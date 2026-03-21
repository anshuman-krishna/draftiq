import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "@prisma/client";

export interface AbTestVariant {
  id: string;
  weight: number;
}

export interface AbTestConfig {
  testId: string;
  variants: AbTestVariant[];
}

export interface AbTestResult {
  testId: string;
  variant: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

@Injectable()
export class AbTestService {
  private readonly logger = new Logger(AbTestService.name);

  constructor(private readonly prisma: PrismaService) {}

  // assign a variant based on session id (deterministic)
  assignVariant(testId: string, sessionId: string, variants: AbTestVariant[]): string {
    // hash session + test for consistent assignment
    let hash = 0;
    const input = `${testId}:${sessionId}`;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
    }
    const normalized = Math.abs(hash) / 2147483647;

    // weighted random selection
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight / totalWeight;
      if (normalized <= cumulative) {
        return variant.id;
      }
    }

    return variants[variants.length - 1].id;
  }

  // track impression
  async trackImpression(testId: string, variant: string, sessionId: string) {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: `ab_impression:${testId}`,
        metadata: { variant, testId } as unknown as Prisma.InputJsonValue,
        sessionId,
      },
    });
  }

  // track conversion
  async trackConversion(testId: string, variant: string, sessionId: string) {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: `ab_conversion:${testId}`,
        metadata: { variant, testId } as unknown as Prisma.InputJsonValue,
        sessionId,
      },
    });
  }

  // get results for a test
  async getResults(testId: string, days = 30): Promise<AbTestResult[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [impressions, conversions] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where: {
          eventType: `ab_impression:${testId}`,
          createdAt: { gte: since },
        },
        select: { metadata: true },
      }),
      this.prisma.analyticsEvent.findMany({
        where: {
          eventType: `ab_conversion:${testId}`,
          createdAt: { gte: since },
        },
        select: { metadata: true },
      }),
    ]);

    // count by variant
    const impressionCounts = new Map<string, number>();
    const conversionCounts = new Map<string, number>();

    for (const imp of impressions) {
      const variant = (imp.metadata as Record<string, unknown>)?.variant as string;
      if (variant) {
        impressionCounts.set(variant, (impressionCounts.get(variant) ?? 0) + 1);
      }
    }

    for (const conv of conversions) {
      const variant = (conv.metadata as Record<string, unknown>)?.variant as string;
      if (variant) {
        conversionCounts.set(variant, (conversionCounts.get(variant) ?? 0) + 1);
      }
    }

    const results: AbTestResult[] = [];
    for (const [variant, imps] of impressionCounts) {
      const convs = conversionCounts.get(variant) ?? 0;
      results.push({
        testId,
        variant,
        impressions: imps,
        conversions: convs,
        conversionRate: imps > 0 ? Math.round((convs / imps) * 100 * 10) / 10 : 0,
      });
    }

    return results.sort((a, b) => b.conversionRate - a.conversionRate);
  }
}
