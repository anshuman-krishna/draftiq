import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "@prisma/client";

// ordered funnel steps for conversion calculation
const FUNNEL_STEPS = [
  "step_view:home-size",
  "step_view:system-type",
  "step_view:duct-condition",
  "step_view:add-ons",
  "step_view:summary",
  "booking_started",
  "booking_completed",
  "payment_started",
  "payment_completed",
] as const;

const FUNNEL_LABELS: Record<string, string> = {
  "step_view:home-size": "home size",
  "step_view:system-type": "system type",
  "step_view:duct-condition": "duct condition",
  "step_view:add-ons": "add-ons",
  "step_view:summary": "summary",
  "booking_started": "booking started",
  "booking_completed": "booking completed",
  "payment_started": "payment started",
  "payment_completed": "payment completed",
};

interface FunnelStep {
  step: string;
  label: string;
  count: number;
  conversionRate: number;
  dropOff: number;
}

interface RevenueStats {
  totalRevenue: number;
  avgOrderValue: number;
  totalPayments: number;
  conversionRate: number;
  totalSessions: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(
    eventType: string,
    metadata: Record<string, unknown>,
    sessionId?: string,
  ): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          eventType,
          metadata: metadata as Prisma.InputJsonValue,
          sessionId: sessionId ?? null,
        },
      });
    } catch (err) {
      this.logger.error(`failed to track event: ${err}`);
    }
  }

  async getFunnelData(days = 30): Promise<FunnelStep[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // count unique sessions for each funnel step
    const events = await this.prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where: {
        createdAt: { gte: since },
        eventType: { in: [...FUNNEL_STEPS] },
      },
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    for (const event of events) {
      countMap.set(event.eventType, event._count.id);
    }

    const funnel: FunnelStep[] = [];
    let previousCount = 0;

    for (let i = 0; i < FUNNEL_STEPS.length; i++) {
      const step = FUNNEL_STEPS[i];
      const count = countMap.get(step) ?? 0;
      const firstCount = countMap.get(FUNNEL_STEPS[0]) ?? 1;

      const conversionRate =
        firstCount > 0 ? Math.round((count / firstCount) * 100) : 0;
      const dropOff =
        i === 0 ? 0 : previousCount > 0 ? previousCount - count : 0;

      funnel.push({
        step,
        label: FUNNEL_LABELS[step] ?? step,
        count,
        conversionRate,
        dropOff,
      });

      previousCount = count;
    }

    return funnel;
  }

  async getRevenueStats(days = 30): Promise<RevenueStats> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [payments, sessionCount] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          status: "SUCCEEDED",
          createdAt: { gte: since },
        },
        select: { amount: true },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ["sessionId"],
        where: {
          createdAt: { gte: since },
          sessionId: { not: null },
          eventType: FUNNEL_STEPS[0],
        },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const totalPayments = payments.length;
    const avgOrderValue =
      totalPayments > 0
        ? Math.round((totalRevenue / totalPayments) * 100) / 100
        : 0;
    const totalSessions = sessionCount.length;
    const conversionRate =
      totalSessions > 0
        ? Math.round((totalPayments / totalSessions) * 100 * 10) / 10
        : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue,
      totalPayments,
      conversionRate,
      totalSessions,
    };
  }

  async getRecentEvents(limit = 50) {
    return this.prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getDailyRevenue(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: "SUCCEEDED",
        createdAt: { gte: since },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // group by date
    const dailyMap = new Map<string, number>();
    for (const p of payments) {
      const date = p.createdAt.toISOString().slice(0, 10);
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + Number(p.amount));
    }

    return Array.from(dailyMap, ([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));
  }
}
