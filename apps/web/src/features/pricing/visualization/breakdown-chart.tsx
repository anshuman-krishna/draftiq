"use client";

import { motion } from "framer-motion";

interface BreakdownChartProps {
  items: { label: string; price: number }[];
  total: number;
}

const COLORS = [
  "#a7c7e7", // primary
  "#b8e0d2", // secondary
  "#ffc9b9", // accent
  "#d4b8e8", // lavender
  "#f5e6a3", // soft yellow
  "#b8d4e8", // light blue
];

export function BreakdownChart({ items, total }: BreakdownChartProps) {
  if (items.length === 0 || total === 0) return null;

  return (
    <div>
      {/* stacked bar */}
      <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100">
        {items.map((item, i) => {
          const width = (item.price / total) * 100;
          if (width < 1) return null;

          return (
            <motion.div
              key={item.label}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              className="h-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
              title={`${item.label}: ${Math.round(width)}%`}
            />
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-[11px] text-neutral-500">
              {item.label} ({Math.round((item.price / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
