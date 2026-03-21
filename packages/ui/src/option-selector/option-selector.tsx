"use client";

import { motion } from "framer-motion";

interface Option {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  recommended?: boolean;
}

interface OptionSelectorProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  columns?: 2 | 3;
}

export function OptionSelector({
  options,
  value,
  onChange,
  columns = 3,
}: OptionSelectorProps) {
  const gridCols = columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {options.map((option, index) => {
        const isSelected = value === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            whileTap={{ scale: 0.97 }}
            className={`relative rounded-2xl border-2 p-5 text-left transition-colors duration-200 ${
              isSelected
                ? "border-neutral-900 bg-neutral-900/5 selection-glow"
                : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:shadow-sm"
            }`}
          >
            {option.badge && (
              <span
                className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isSelected
                    ? "bg-neutral-900 text-white"
                    : "bg-primary text-white"
                }`}
              >
                {option.badge}
              </span>
            )}
            <div className="flex items-start gap-3">
              <motion.div
                animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900"
                    : "border-neutral-300"
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="h-2 w-2 rounded-full bg-white"
                  />
                )}
              </motion.div>
              <div>
                <p
                  className={`text-sm font-semibold ${isSelected ? "text-neutral-900" : "text-neutral-700"}`}
                >
                  {option.label}
                </p>
                {option.description && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
