"use client";

import { motion, AnimatePresence } from "framer-motion";

interface PriceItem {
  label: string;
  price: number;
}

interface PricingSidebarProps {
  items: PriceItem[];
  total: number;
  loading?: boolean;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricingSidebar({ items, total, loading = false }: PricingSidebarProps) {
  return (
    <div
      className={`glass-foreground glass-noise relative rounded-2xl p-6 transition-opacity duration-200 ${loading ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          your estimate
        </h3>
        {loading && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
        )}
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 && !loading && (
          <p className="text-sm text-neutral-400">
            select options to see pricing
          </p>
        )}
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.label}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-neutral-600">{item.label}</span>
              <span className="text-sm font-medium text-neutral-900">
                {formatPrice(item.price)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length > 0 && (
        <>
          {/* distribution bar */}
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-neutral-200/50">
            {items.map((item, i) => {
              const width = total > 0 ? (item.price / total) * 100 : 0;
              const colors = ["#a7c7e7", "#b8e0d2", "#ffc9b9", "#d4b8e8", "#f5e6a3", "#b8d4e8"];
              return (
                <motion.div
                  key={item.label}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="h-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
              );
            })}
          </div>

          <div className="my-4 h-px bg-neutral-200" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-600">
              estimated total
            </span>
            <motion.span
              key={total}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-2xl font-bold text-neutral-900"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
        </>
      )}

      {total > 0 && (
        <p className="mt-3 text-xs text-neutral-400">
          final pricing confirmed after site assessment
        </p>
      )}
    </div>
  );
}
