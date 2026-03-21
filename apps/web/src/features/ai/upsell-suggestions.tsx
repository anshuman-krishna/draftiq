"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/features/pricing";
import type { UpsellData } from "./use-ai";

interface UpsellSuggestionsProps {
  data: UpsellData | null;
  loading: boolean;
  onAdd: (addonId: string) => void;
  selectedAddons: string[];
}

export function UpsellSuggestions({
  data,
  loading,
  onAdd,
  selectedAddons,
}: UpsellSuggestionsProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.suggestions.length === 0) return null;

  // filter out already-selected add-ons
  const available = data.suggestions.filter((s) => !selectedAddons.includes(s.addonId));

  if (available.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl border border-neutral-200 bg-white/60 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#ffc9b9]">
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          recommended for you
        </span>
      </div>

      <div className="space-y-3">
        {available.map((suggestion) => (
          <div
            key={suggestion.addonId}
            className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white/40 p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-900">{suggestion.label}</span>
                <span className="text-xs font-semibold text-neutral-500">
                  +{formatPrice(suggestion.price)}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{suggestion.reason}</p>
            </div>
            <button
              onClick={() => onAdd(suggestion.addonId)}
              className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
            >
              add
            </button>
          </div>
        ))}
      </div>

      {data.note && <p className="mt-3 text-xs text-neutral-400">{data.note}</p>}
    </motion.div>
  );
}
