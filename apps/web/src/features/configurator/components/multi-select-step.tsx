"use client";

import { motion } from "framer-motion";
import type { ConfiguratorStep } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator";
import { formatPrice } from "@/features/pricing";

interface MultiSelectStepProps {
  step: ConfiguratorStep;
  selected: string[];
  onToggle: (optionId: string) => void;
}

export function MultiSelectStep({ step, selected, onToggle }: MultiSelectStepProps) {
  const pricingConfig = useConfiguratorStore((s) => s.pricingConfig);
  const columns = step.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3";

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-neutral-900">{step.title}</h2>
      <p className="mb-8 text-neutral-500">{step.description}</p>
      <div className={`grid gap-3 ${columns}`}>
        {(step.options ?? []).map((option, index) => {
          const isSelected = selected.includes(option.id);
          const rule = pricingConfig?.rules[option.pricingKey];
          const price = rule ? formatPrice(rule.value) : null;

          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.06 }}
              whileTap={{ scale: 0.97 }}
              className={`relative rounded-2xl border-2 p-4 text-left transition-colors duration-200 ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900/5 selection-glow"
                  : "border-neutral-200 bg-white/60 hover:border-neutral-300"
              }`}
            >
              {option.badge && (
                <span
                  className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isSelected ? "bg-neutral-900 text-white" : "bg-primary text-white"
                  }`}
                >
                  {option.badge}
                </span>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{option.label}</p>
                  {option.description && (
                    <p className="mt-1 text-xs text-neutral-500">{option.description}</p>
                  )}
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  {price && <span className="text-sm font-semibold text-neutral-900">{price}</span>}
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-200 ${
                      isSelected ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"
                    }`}
                  >
                    {isSelected && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
