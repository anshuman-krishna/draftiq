import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FUNNEL_STEPS } from "../analytics/analytics.service";

interface ConversionPrediction {
  probability: number;
  risk: "low" | "medium" | "high";
  signals: string[];
}

interface DropOffRisk {
  step: string;
  riskLevel: "low" | "medium" | "high";
  dropOffRate: number;
  recommendation: string;
}

export interface AdminInsight {
  type: "warning" | "recommendation" | "success";
  title: string;
  description: string;
  metric?: string;
}

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predictConversion(sessionId: string): Promise<ConversionPrediction> {
    // get all events for this session
    const events = await this.prisma.analyticsEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    const signals: string[] = [];
    let score = 50; // base probability

    const eventTypes = events.map((e) => e.eventType);

    // progression signals
    const stepsReached = eventTypes.filter((e) => e.startsWith("step_view:")).length;
    if (stepsReached >= 4) {
      score += 15;
      signals.push("completed most configuration steps");
    }
    if (stepsReached >= 2) {
      score += 10;
    }

    // engagement signals
    if (eventTypes.includes("step_view:summary")) {
      score += 10;
      signals.push("viewed pricing summary");
    }

    if (eventTypes.includes("booking_started")) {
      score += 15;
      signals.push("started booking process");
    }

    if (eventTypes.includes("booking_completed")) {
      score += 20;
      signals.push("completed booking");
    }

    // time-based signals
    if (events.length >= 2) {
      const first = new Date(events[0].createdAt).getTime();
      const last = new Date(events[events.length - 1].createdAt).getTime();
      const durationMinutes = (last - first) / (1000 * 60);

      if (durationMinutes > 3 && durationMinutes < 20) {
        score += 5;
        signals.push("engaged for a healthy duration");
      } else if (durationMinutes < 1) {
        score -= 10;
        signals.push("very brief session");
      }
    }

    // back-navigation signals (possible indecision)
    const stepCompletes = eventTypes.filter((e) => e.startsWith("step_complete:")).length;
    if (stepsReached > 0 && stepCompletes < stepsReached * 0.5) {
      score -= 5;
      signals.push("high browse-to-action ratio");
    }

    const probability = Math.max(5, Math.min(95, score));
    const risk = probability >= 60 ? "low" : probability >= 35 ? "medium" : "high";

    return { probability, risk, signals };
  }

  async detectDropOffRisks(days = 30): Promise<DropOffRisk[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const funnelSteps = [...FUNNEL_STEPS];

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where: {
        createdAt: { gte: since },
        eventType: { in: funnelSteps },
      },
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    for (const e of events) {
      countMap.set(e.eventType, e._count.id);
    }

    const risks: DropOffRisk[] = [];

    for (let i = 1; i < funnelSteps.length; i++) {
      const prev = countMap.get(funnelSteps[i - 1]) ?? 0;
      const curr = countMap.get(funnelSteps[i]) ?? 0;

      if (prev === 0) continue;

      const dropOffRate = Math.round(((prev - curr) / prev) * 100);

      if (dropOffRate > 20) {
        const riskLevel = dropOffRate > 50 ? "high" : dropOffRate > 35 ? "medium" : "low";

        const recommendation = this.getDropOffRecommendation(funnelSteps[i], dropOffRate);

        risks.push({
          step: funnelSteps[i],
          riskLevel,
          dropOffRate,
          recommendation,
        });
      }
    }

    return risks.sort((a, b) => b.dropOffRate - a.dropOffRate);
  }

  async generateInsights(days = 30): Promise<AdminInsight[]> {
    const insights: AdminInsight[] = [];

    const [dropOffs, revenueData] = await Promise.all([
      this.detectDropOffRisks(days),
      this.getRevenueMetrics(days),
    ]);

    // drop-off warnings
    for (const risk of dropOffs.slice(0, 3)) {
      if (risk.riskLevel === "high") {
        insights.push({
          type: "warning",
          title: `high drop-off at ${this.formatStepName(risk.step)}`,
          description: risk.recommendation,
          metric: `${risk.dropOffRate}% drop-off`,
        });
      }
    }

    // revenue insights
    if (revenueData.avgOrderValue > 0) {
      insights.push({
        type: "success",
        title: "average order value",
        description: `current avg is $${revenueData.avgOrderValue.toLocaleString()}. ${
          revenueData.trend > 0 ? "trending up" : revenueData.trend < 0 ? "trending down" : "stable"
        } over the last ${days} days.`,
        metric: `$${revenueData.avgOrderValue.toLocaleString()}`,
      });
    }

    // conversion rate insight
    if (revenueData.conversionRate > 0) {
      const level = revenueData.conversionRate > 10 ? "success" : "recommendation";
      insights.push({
        type: level,
        title: "conversion rate",
        description:
          revenueData.conversionRate > 10
            ? "conversion rate is healthy."
            : "conversion rate is below 10%. consider simplifying the flow or adding trust indicators.",
        metric: `${revenueData.conversionRate}%`,
      });
    }

    // if no data yet
    if (insights.length === 0) {
      insights.push({
        type: "recommendation",
        title: "collect more data",
        description:
          "not enough traffic yet to generate meaningful insights. insights will appear as users go through the configurator.",
      });
    }

    return insights;
  }

  private async getRevenueMetrics(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const midpoint = new Date();
    midpoint.setDate(midpoint.getDate() - Math.floor(days / 2));

    const [allPayments, recentPayments] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: "SUCCEEDED", createdAt: { gte: since } },
        select: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: { status: "SUCCEEDED", createdAt: { gte: midpoint } },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = allPayments.reduce((s, p) => s + Number(p.amount), 0);
    const recentRevenue = recentPayments.reduce((s, p) => s + Number(p.amount), 0);
    const avgOrderValue =
      allPayments.length > 0 ? Math.round(totalRevenue / allPayments.length) : 0;

    const olderRevenue = totalRevenue - recentRevenue;
    const trend = recentRevenue > olderRevenue ? 1 : recentRevenue < olderRevenue ? -1 : 0;

    // compute conversion rate
    const sessions = await this.prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: since },
        sessionId: { not: null },
        eventType: "step_view:home-size",
      },
      _count: { id: true },
    });

    const conversionRate =
      sessions.length > 0 ? Math.round((allPayments.length / sessions.length) * 100 * 10) / 10 : 0;

    return { totalRevenue, avgOrderValue, trend, conversionRate };
  }

  private getDropOffRecommendation(step: string, rate: number): string {
    const recommendations: Record<string, string> = {
      "step_view:system-type":
        "users may be confused by system options. consider adding comparison tooltips or simplifying descriptions.",
      "step_view:duct-condition":
        "duct condition is technical. add a visual guide or 'not sure' option to reduce uncertainty.",
      "step_view:add-ons":
        "users may feel overwhelmed by add-ons. consider showing fewer options or pre-selecting popular ones.",
      "step_view:summary":
        "price shock at summary. consider showing running total earlier in the flow.",
      booking_started:
        "users hesitate at booking. add trust indicators (reviews, guarantees) before this step.",
      booking_completed: "booking form may be too complex. simplify or reduce required fields.",
      payment_started:
        "users abandon before payment. highlight deposit option and security badges.",
      payment_completed:
        "payment failures. check stripe integration and offer alternative payment methods.",
    };

    return (
      recommendations[step] ??
      `${rate}% of users drop off here. investigate this step for friction points.`
    );
  }

  private formatStepName(step: string): string {
    return step.replace("step_view:", "").replace("_", " ").replace(/-/g, " ");
  }
}
