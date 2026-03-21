"use client";

import { useState, useCallback } from "react";
import { DataTable, Badge, Modal } from "@/features/admin/components";
import { Button, Input } from "@draftiq/ui";
import {
  fetchPricingRules,
  updatePricingRule,
  type PricingRule,
} from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

export default function PricingPage() {
  const { data: rules, loading, refresh } = useAdminData(
    useCallback(() => fetchPricingRules(), []),
  );
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formType, setFormType] = useState("FIXED");
  const [saving, setSaving] = useState(false);

  function openEdit(rule: PricingRule) {
    setEditing(rule);
    setFormLabel(rule.label);
    setFormValue(rule.value);
    setFormType(rule.type);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await updatePricingRule(editing.id, {
        label: formLabel,
        value: parseFloat(formValue),
        type: formType,
      });
      setEditing(null);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(rule: PricingRule) {
    await updatePricingRule(rule.id, { isActive: !rule.isActive });
    refresh();
  }

  const columns = [
    { key: "key", header: "key", className: "font-mono text-xs" },
    { key: "label", header: "label" },
    {
      key: "type",
      header: "type",
      render: (row: PricingRule) => (
        <Badge variant="info">{row.type.toLowerCase()}</Badge>
      ),
    },
    {
      key: "value",
      header: "value",
      render: (row: PricingRule) => (
        <span className="font-semibold">
          {row.type === "PERCENTAGE" ? `${row.value}%` : `$${parseFloat(row.value).toLocaleString()}`}
        </span>
      ),
    },
    { key: "category", header: "category" },
    {
      key: "isActive",
      header: "status",
      render: (row: PricingRule) => (
        <button onClick={() => handleToggleActive(row)}>
          <Badge variant={row.isActive ? "success" : "neutral"}>
            {row.isActive ? "active" : "inactive"}
          </Badge>
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row: PricingRule) => (
        <button
          onClick={() => openEdit(row)}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          edit
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="rounded-2xl border border-neutral-200 bg-white/60">
        <DataTable
          columns={columns}
          data={rules ?? []}
          loading={loading}
          emptyMessage="no pricing rules found"
        />
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="edit pricing rule"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              key
            </label>
            <p className="rounded-lg bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-600">
              {editing?.key}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              label
            </label>
            <Input
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              value
            </label>
            <Input
              type="number"
              step="0.01"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              type
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900"
            >
              <option value="FIXED">fixed</option>
              <option value="PERCENTAGE">percentage</option>
              <option value="PER_UNIT">per unit</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "saving..." : "save changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
