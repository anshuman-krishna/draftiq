"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/features/admin/components";
import {
  fetchIntegrations,
  fetchIntegrationLogs,
  updateIntegration,
  type IntegrationConfig,
  type IntegrationLog,
} from "@/features/admin/api";
import { useAdminData } from "@/features/admin/use-admin-data";

const PROVIDER_META: Record<string, { label: string; description: string }> = {
  hubspot: {
    label: "HubSpot",
    description: "sync contacts, deals, and pipeline stages",
  },
  ghl: {
    label: "GoHighLevel",
    description: "sync contacts, opportunities, and tags",
  },
};

function ProviderCard({
  config,
  onToggle,
  toggling,
}: {
  config: IntegrationConfig;
  onToggle: (provider: string, enabled: boolean) => void;
  toggling: boolean;
}) {
  const meta = PROVIDER_META[config.provider] ?? {
    label: config.provider,
    description: "crm provider",
  };

  const hasApiKey = !!config.apiKey;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/60 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-neutral-600"
            >
              <path
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {meta.label}
            </h3>
            <p className="text-xs text-neutral-500">{meta.description}</p>
          </div>
        </div>

        <button
          onClick={() => onToggle(config.provider, !config.isEnabled)}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
            config.isEnabled ? "bg-emerald-500" : "bg-neutral-300"
          } ${toggling ? "opacity-50" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              config.isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Badge variant={config.isEnabled ? "success" : "neutral"}>
          {config.isEnabled ? "connected" : "disabled"}
        </Badge>
        <Badge variant={hasApiKey ? "info" : "warning"}>
          {hasApiKey ? "api key set" : "no api key"}
        </Badge>
      </div>
    </div>
  );
}

function LogRow({ log }: { log: IntegrationLog }) {
  const meta = PROVIDER_META[log.provider];

  return (
    <tr className="border-t border-neutral-100">
      <td className="px-4 py-3 text-xs text-neutral-500">
        {new Date(log.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-neutral-700">
        {meta?.label ?? log.provider}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">{log.action}</td>
      <td className="px-4 py-3">
        <Badge variant={log.status === "success" ? "success" : "danger"}>
          {log.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500">
        {log.entityId ? (
          <span className="font-mono">{log.entityId.slice(0, 8)}</span>
        ) : (
          <span className="text-neutral-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500">
        {log.error ? (
          <span className="text-red-500" title={log.error}>
            {log.error.length > 40
              ? `${log.error.slice(0, 40)}...`
              : log.error}
          </span>
        ) : (
          <span className="text-neutral-300">—</span>
        )}
      </td>
    </tr>
  );
}

export default function IntegrationsPage() {
  const {
    data: configs,
    loading: configsLoading,
    refresh: refreshConfigs,
  } = useAdminData(useCallback(() => fetchIntegrations(), []));

  const { data: logs, loading: logsLoading } = useAdminData(
    useCallback(() => fetchIntegrationLogs(30), []),
  );

  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(provider: string, enabled: boolean) {
    setToggling(provider);
    try {
      await updateIntegration(provider, { isEnabled: enabled });
      await refreshConfigs();
    } catch {
      // silently fail — user sees no change
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* provider cards */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-neutral-500">
          crm providers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {configsLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-neutral-100"
                />
              ))
            : (configs ?? []).map((config) => (
                <ProviderCard
                  key={config.id}
                  config={config}
                  onToggle={handleToggle}
                  toggling={toggling === config.provider}
                />
              ))}
        </div>
      </div>

      {/* activity log */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-neutral-500">
          recent activity
        </h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/60">
          <table className="w-full text-left">
            <thead className="bg-neutral-50/80">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500">
                  time
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500">
                  provider
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500">
                  action
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500">
                  status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500">
                  entity
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500">
                  error
                </th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                    </td>
                  </tr>
                ))
              ) : (logs ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-neutral-400"
                  >
                    no integration activity yet
                  </td>
                </tr>
              ) : (
                (logs ?? []).map((log) => <LogRow key={log.id} log={log} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
