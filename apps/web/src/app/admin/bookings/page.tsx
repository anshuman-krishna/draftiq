"use client";

import { useCallback } from "react";
import { DataTable, Badge } from "@/features/admin/components";
import { fetchBookings, updateBookingStatus, type AdminBooking } from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "CONFIRMED" ? "success" : status === "CANCELLED" ? "danger" : "warning";
  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
}

export default function BookingsPage() {
  const { data: bookings, loading, refresh } = useAdminData(useCallback(() => fetchBookings(), []));

  async function handleStatusChange(id: string, status: string) {
    await updateBookingStatus(id, status);
    refresh();
  }

  const columns = [
    {
      key: "date",
      header: "date",
      render: (row: AdminBooking) =>
        new Date(row.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
    },
    { key: "slot", header: "slot" },
    {
      key: "status",
      header: "status",
      render: (row: AdminBooking) => <StatusBadge status={row.status} />,
    },
    {
      key: "payments",
      header: "payment",
      render: (row: AdminBooking) => {
        if (!row.payments || row.payments.length === 0) {
          return <span className="text-neutral-400">none</span>;
        }
        const p = row.payments[0];
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">${parseFloat(p.amount).toLocaleString()}</span>
            <Badge
              variant={
                p.status === "SUCCEEDED" ? "success" : p.status === "FAILED" ? "danger" : "warning"
              }
            >
              {p.status.toLowerCase()}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "created",
      render: (row: AdminBooking) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
    {
      key: "actions",
      header: "",
      render: (row: AdminBooking) => {
        if (row.status === "CANCELLED") return null;
        return (
          <div className="flex gap-2">
            {row.status === "PENDING" && (
              <button
                onClick={() => handleStatusChange(row.id, "CONFIRMED")}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                confirm
              </button>
            )}
            <button
              onClick={() => handleStatusChange(row.id, "CANCELLED")}
              className="text-sm text-red-500 hover:text-red-600"
            >
              cancel
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/60">
      <DataTable
        columns={columns}
        data={bookings ?? []}
        loading={loading}
        emptyMessage="no bookings yet"
      />
    </div>
  );
}
