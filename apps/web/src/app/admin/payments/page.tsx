"use client";

import { useCallback } from "react";
import { DataTable, Badge } from "@/features/admin/components";
import { fetchPayments, type AdminPayment } from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

function PaymentStatusBadge({ status }: { status: string }) {
  const variant =
    status === "SUCCEEDED"
      ? "success"
      : status === "FAILED"
        ? "danger"
        : "warning";
  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
}

export default function PaymentsPage() {
  const { data: payments, loading } = useAdminData(
    useCallback(() => fetchPayments(), []),
  );

  const columns = [
    {
      key: "id",
      header: "id",
      render: (row: AdminPayment) => (
        <span className="font-mono text-xs text-neutral-500">
          {row.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "amount",
      render: (row: AdminPayment) => (
        <span className="font-semibold">
          ${parseFloat(row.amount).toLocaleString()}
        </span>
      ),
    },
    { key: "currency", header: "currency", className: "uppercase" },
    {
      key: "status",
      header: "status",
      render: (row: AdminPayment) => <PaymentStatusBadge status={row.status} />,
    },
    {
      key: "booking",
      header: "booking",
      render: (row: AdminPayment) =>
        row.booking ? (
          <span className="text-sm">
            {new Date(row.booking.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            · {row.booking.slot}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "stripeId",
      header: "stripe id",
      render: (row: AdminPayment) =>
        row.stripeId ? (
          <span className="font-mono text-xs text-neutral-500">
            {row.stripeId.slice(0, 16)}...
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "created",
      render: (row: AdminPayment) =>
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
        data={payments ?? []}
        loading={loading}
        emptyMessage="no payments yet"
      />
    </div>
  );
}
