"use client";

import { useState, useCallback } from "react";
import { DataTable, Badge, Modal } from "@/features/admin/components";
import { Button, Input } from "@draftiq/ui";
import {
  fetchAllAvailability,
  updateAvailabilitySlots,
  type AdminAvailability,
} from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

export default function AvailabilityPage() {
  const {
    data: days,
    loading,
    refresh,
  } = useAdminData(useCallback(() => fetchAllAvailability(), []));
  const [editing, setEditing] = useState<AdminAvailability | null>(null);
  const [formSlots, setFormSlots] = useState("6");
  const [saving, setSaving] = useState(false);

  function openEdit(day: AdminAvailability) {
    setEditing(day);
    setFormSlots(String(day.totalSlots));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateAvailabilitySlots(editing.id, parseInt(formSlots));
      setEditing(null);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "date",
      header: "date",
      render: (row: AdminAvailability) =>
        new Date(row.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "totalSlots",
      header: "total slots",
      render: (row: AdminAvailability) => <span className="font-semibold">{row.totalSlots}</span>,
    },
    {
      key: "booked",
      header: "booked",
      render: (row: AdminAvailability) => {
        const booked = row._count.bookings;
        const utilization = row.totalSlots > 0 ? booked / row.totalSlots : 0;
        return (
          <div className="flex items-center gap-2">
            <span>{booked}</span>
            <Badge
              variant={utilization >= 1 ? "danger" : utilization >= 0.7 ? "warning" : "success"}
            >
              {Math.round(utilization * 100)}%
            </Badge>
          </div>
        );
      },
    },
    {
      key: "remaining",
      header: "remaining",
      render: (row: AdminAvailability) => {
        const remaining = row.totalSlots - row._count.bookings;
        return <span className={remaining === 0 ? "text-red-500" : ""}>{remaining}</span>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: AdminAvailability) => (
        <button
          onClick={() => openEdit(row)}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          edit slots
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="rounded-2xl border border-neutral-200 bg-white/60">
        <DataTable
          columns={columns}
          data={days ?? []}
          loading={loading}
          emptyMessage="no availability configured"
        />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="edit availability">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">date</label>
            <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              {editing &&
                new Date(editing.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">total slots</label>
            <Input
              type="number"
              min="0"
              value={formSlots}
              onChange={(e) => setFormSlots(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "saving..." : "save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
