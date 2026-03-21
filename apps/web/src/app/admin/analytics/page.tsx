"use client";

import { useCallback } from "react";
import { Badge } from "@/features/admin/components";
import {
  fetchFunnelData,
  fetchRevenueStats,
  fetchDailyRevenue,
  fetchAnalyticsEvents,
  fetchInsights,
  type FunnelStep,
  type RevenueStats,
  type DailyRevenue,
  type AnalyticsEventItem,
  type AdminInsight,
} from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

// simple bar chart using divs
function FunnelChart({ data }: { data: FunnelStep[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((step, i) => (
        <div key={step.step} className="group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 w-5 text-right">{i + 1}</span>
              <span className="text-sm text-neutral-700">{step.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-neutral-900">
                {step.count.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-400 w-10 text-right">
                {step.conversionRate}%
              </span>
            </div>
          </div>
          <div className="ml-7 flex items-center gap-2">
            <div className="h-6 flex-1 rounded-lg bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${maxCount > 0 ? (step.count / maxCount) * 100 : 0}%`,
                  backgroundColor:
                    step.conversionRate > 60
                      ? "#b8e0d2"
                      : step.conversionRate > 30
                        ? "#a7c7e7"
                        : "#ffc9b9",
                }}
              />
            </div>
            {step.dropOff > 0 && (
              <span className="text-[10px] text-red-400 whitespace-nowrap">-{step.dropOff}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ data }: { data: DailyRevenue[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-neutral-400">
        no revenue data yet
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const barWidth = Math.max(100 / data.length, 2);

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((day) => (
        <div
          key={day.date}
          className="group relative flex-1 min-w-[4px]"
          style={{ maxWidth: `${barWidth}%` }}
        >
          <div
            className="w-full rounded-t bg-[#a7c7e7] transition-all duration-300 hover:bg-[#8bb5d9]"
            style={{
              height: `${(day.revenue / maxRevenue) * 100}%`,
              minHeight: day.revenue > 0 ? "4px" : "0px",
            }}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-xs text-white shadow-lg">
            ${day.revenue.toLocaleString()} —{" "}
            {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5">
      <p className="text-xs font-medium text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {subtext && <p className="text-xs text-neutral-400 mt-1">{subtext}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: funnel, loading: funnelLoading } = useAdminData(
    useCallback(() => fetchFunnelData(30), []),
  );

  const { data: revenue, loading: revenueLoading } = useAdminData(
    useCallback(() => fetchRevenueStats(30), []),
  );

  const { data: dailyRevenue, loading: dailyLoading } = useAdminData(
    useCallback(() => fetchDailyRevenue(30), []),
  );

  const { data: events, loading: eventsLoading } = useAdminData(
    useCallback(() => fetchAnalyticsEvents(30), []),
  );

  const { data: insights, loading: insightsLoading } = useAdminData(
    useCallback(() => fetchInsights(30), []),
  );

  return (
    <div className="space-y-8">
      {/* revenue stat cards */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-neutral-500">revenue — last 30 days</h2>
        {revenueLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : revenue ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="total revenue"
              value={`$${revenue.totalRevenue.toLocaleString()}`}
              subtext={`${revenue.totalPayments} payments`}
            />
            <StatCard
              label="avg order value"
              value={`$${revenue.avgOrderValue.toLocaleString()}`}
            />
            <StatCard
              label="conversion rate"
              value={`${revenue.conversionRate}%`}
              subtext={`${revenue.totalSessions} sessions`}
            />
            <StatCard label="total sessions" value={revenue.totalSessions.toLocaleString()} />
          </div>
        ) : null}
      </div>

      {/* daily revenue chart */}
      <div className="rounded-2xl border border-neutral-200 bg-white/60 p-6">
        <h2 className="mb-4 text-sm font-medium text-neutral-500">daily revenue</h2>
        {dailyLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-neutral-100" />
        ) : (
          <RevenueChart data={dailyRevenue ?? []} />
        )}
      </div>

      {/* ai insights */}
      <div className="rounded-2xl border border-neutral-200 bg-white/60 p-6">
        <h2 className="mb-4 text-sm font-medium text-neutral-500">ai insights</h2>
        {insightsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : (
          <InsightsPanel data={insights ?? []} />
        )}
      </div>

      {/* funnel */}
      <div className="rounded-2xl border border-neutral-200 bg-white/60 p-6">
        <h2 className="mb-6 text-sm font-medium text-neutral-500">
          conversion funnel — last 30 days
        </h2>
        {funnelLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
        ) : funnel && funnel.length > 0 ? (
          <FunnelChart data={funnel} />
        ) : (
          <p className="text-sm text-neutral-400 text-center py-8">
            no funnel data yet — events will appear as users go through the configurator
          </p>
        )}
      </div>

      {/* recent activity */}
      <div className="rounded-2xl border border-neutral-200 bg-white/60">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h2 className="text-sm font-medium text-neutral-500">recent events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50/80">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-neutral-500">time</th>
                <th className="px-6 py-3 text-xs font-medium text-neutral-500">event</th>
                <th className="px-6 py-3 text-xs font-medium text-neutral-500">session</th>
                <th className="px-6 py-3 text-xs font-medium text-neutral-500">details</th>
              </tr>
            </thead>
            <tbody>
              {eventsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td colSpan={4} className="px-6 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                    </td>
                  </tr>
                ))
              ) : (events ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-400">
                    no events tracked yet
                  </td>
                </tr>
              ) : (
                (events ?? []).map((event) => <EventRow key={event.id} event={event} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InsightsPanel({ data }: { data: AdminInsight[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-400 text-center py-8">
        not enough data to generate insights yet
      </p>
    );
  }

  const iconMap = {
    warning: "⚠",
    recommendation: "→",
    success: "✓",
  };

  const colorMap = {
    warning: "border-l-[#ffc9b9] bg-[#ffc9b9]/5",
    recommendation: "border-l-[#a7c7e7] bg-[#a7c7e7]/5",
    success: "border-l-[#b8e0d2] bg-[#b8e0d2]/5",
  };

  return (
    <div className="space-y-3">
      {data.map((insight, i) => (
        <div
          key={i}
          className={`rounded-xl border border-neutral-200 border-l-4 p-4 ${colorMap[insight.type]}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-sm mt-0.5">{iconMap[insight.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-800">{insight.title}</p>
                {insight.metric && (
                  <span className="text-xs font-mono text-neutral-500 shrink-0">
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">{insight.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventRow({ event }: { event: AnalyticsEventItem }) {
  const eventCategory = event.eventType.includes("payment")
    ? "info"
    : event.eventType.includes("booking")
      ? "success"
      : event.eventType.includes("step_view")
        ? "neutral"
        : "warning";

  return (
    <tr className="border-t border-neutral-100">
      <td className="px-6 py-3 text-xs text-neutral-500 whitespace-nowrap">
        {new Date(event.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </td>
      <td className="px-6 py-3">
        <Badge variant={eventCategory}>{event.eventType}</Badge>
      </td>
      <td className="px-6 py-3 text-xs text-neutral-500 font-mono">
        {event.sessionId ? event.sessionId.slice(0, 8) : "—"}
      </td>
      <td className="px-6 py-3 text-xs text-neutral-500">{formatMetadata(event.metadata)}</td>
    </tr>
  );
}

function formatMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata)
    .filter(([key]) => key !== "timestamp" && key !== "url")
    .map(([key, value]) => `${key}: ${value}`)
    .slice(0, 3);

  return entries.length > 0 ? entries.join(", ") : "—";
}
