"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { fetchBookings, fetchPayments, fetchPricingRules, fetchQuotes } from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

function StatCard({
  label,
  value,
  subtitle,
  delay,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  delay: number;
}) {
  return (
    <motion.div
      className="rounded-2xl border border-neutral-200 bg-white/60 p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: bookings, loading: bookingsLoading } = useAdminData(
    useCallback(() => fetchBookings(), []),
  );
  const { data: payments, loading: paymentsLoading } = useAdminData(
    useCallback(() => fetchPayments(), []),
  );
  const { data: rules, loading: rulesLoading } = useAdminData(
    useCallback(() => fetchPricingRules(), []),
  );
  const { data: quotes, loading: quotesLoading } = useAdminData(
    useCallback(() => fetchQuotes(), []),
  );

  const loading = bookingsLoading || paymentsLoading || rulesLoading || quotesLoading;

  const totalRevenue = payments
    ? payments
        .filter((p) => p.status === "SUCCEEDED")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
    : 0;

  const confirmedBookings = bookings ? bookings.filter((b) => b.status === "CONFIRMED").length : 0;

  const pendingBookings = bookings ? bookings.filter((b) => b.status === "PENDING").length : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="total revenue"
          value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${payments?.filter((p) => p.status === "SUCCEEDED").length ?? 0} successful payments`}
          delay={0}
        />
        <StatCard
          label="total bookings"
          value={bookings?.length ?? 0}
          subtitle={`${confirmedBookings} confirmed · ${pendingBookings} pending`}
          delay={0.05}
        />
        <StatCard label="total quotes" value={quotes?.length ?? 0} delay={0.1} />
        <StatCard
          label="pricing rules"
          value={rules?.length ?? 0}
          subtitle={`${rules?.filter((r) => r.isActive).length ?? 0} active`}
          delay={0.15}
        />
      </div>

      {/* recent bookings */}
      {bookings && bookings.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-400">
            recent bookings
          </h2>
          <div className="space-y-2">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white/60 px-5 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-neutral-900">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-neutral-500">{booking.slot}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    booking.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700"
                      : booking.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {booking.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
