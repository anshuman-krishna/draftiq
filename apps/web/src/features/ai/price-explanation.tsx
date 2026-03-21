"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExplanationData } from "./use-ai";

interface PriceExplanationProps {
  data: ExplanationData | null;
  loading: boolean;
}

export function PriceExplanation({ data, loading }: PriceExplanationProps) {
  const [expanded, setExpanded] = useState(false);

  if (!data && !loading) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/60">
      <button
        onClick={() => setExpanded(!expanded)}
        disabled={loading}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
            <path
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-sm font-medium text-neutral-700">why this price?</span>
          {loading && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          )}
        </div>

        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-neutral-400"
        >
          <path
            d="M19 9l-7 7-7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {expanded && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 px-5 pb-5 pt-4">
              <p className="text-sm text-neutral-600 mb-4">{data.summary}</p>

              <div className="space-y-3">
                {data.items.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold text-neutral-800">{item.label}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{item.explanation}</p>
                  </div>
                ))}
              </div>

              {data.valueNote && (
                <p className="mt-4 text-xs text-neutral-500 italic border-t border-neutral-100 pt-3">
                  {data.valueNote}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
