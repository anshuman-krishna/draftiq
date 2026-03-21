"use client";

import { motion } from "framer-motion";
import type { RecommendationData } from "./use-ai";

const TIER_CONFIG = {
  good: {
    label: "good",
    color: "text-neutral-700",
    bg: "bg-neutral-100",
    border: "border-neutral-200",
    icon: "M5 13l4 4L19 7",
  },
  better: {
    label: "better",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    icon: "M5 13l4 4L19 7",
  },
  best: {
    label: "best",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
};

interface RecommendationCardProps {
  data: RecommendationData | null;
  loading: boolean;
}

export function RecommendationCard({ data, loading }: RecommendationCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100 mb-2" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-100 mb-2" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
      </div>
    );
  }

  if (!data) return null;

  const tier = TIER_CONFIG[data.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border ${tier.border} bg-white/60 p-5`}
    >
      <div className="flex items-center gap-2 mb-1">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={tier.color}
        >
          <path
            d={tier.icon}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={`text-xs font-semibold uppercase tracking-wider ${tier.color}`}>
          ai recommends: {tier.label}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-neutral-900 mb-1">
        {data.title}
      </h4>

      <p className="text-sm text-neutral-600 leading-relaxed">
        {data.reasoning}
      </p>
    </motion.div>
  );
}
