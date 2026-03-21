"use client";

import { useCallback } from "react";
import { DataTable, Badge } from "@/features/admin/components";
import { fetchQuotes, type AdminQuote } from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

function QuoteStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
    DRAFT: "neutral",
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    EXPIRED: "neutral",
  };
  return <Badge variant={variants[status] ?? "neutral"}>{status.toLowerCase()}</Badge>;
}

export default function QuotesPage() {
  const { data: quotes, loading } = useAdminData(useCallback(() => fetchQuotes(), []));

  const columns = [
    {
      key: "id",
      header: "id",
      render: (row: AdminQuote) => (
        <span className="font-mono text-xs text-neutral-500">{row.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "status",
      header: "status",
      render: (row: AdminQuote) => <QuoteStatusBadge status={row.status} />,
    },
    {
      key: "totalPrice",
      header: "total",
      render: (row: AdminQuote) => (
        <span className="font-semibold">${parseFloat(row.totalPrice).toLocaleString()}</span>
      ),
    },
    {
      key: "user",
      header: "customer",
      render: (row: AdminQuote) =>
        row.user ? (
          <span>{row.user.email}</span>
        ) : (
          <span className="text-neutral-400">anonymous</span>
        ),
    },
    {
      key: "booking",
      header: "booking",
      render: (row: AdminQuote) =>
        row.booking ? (
          <Badge variant="info">booked</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "created",
      render: (row: AdminQuote) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/60">
      <DataTable
        columns={columns}
        data={quotes ?? []}
        loading={loading}
        emptyMessage="no quotes yet"
      />
    </div>
  );
}
