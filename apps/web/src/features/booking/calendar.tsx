"use client";

import { motion } from "framer-motion";
import type { DayAvailability } from "@/lib/api";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface CalendarProps {
  days: DayAvailability[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    dayName: DAY_NAMES[d.getDay()],
    dayNum: d.getDate(),
    monthShort: d.toLocaleDateString("en-US", { month: "short" }).toLowerCase(),
  };
}

function getDayStatus(day: DayAvailability) {
  const available = day.slots.some((s) => s.remaining > 0);
  if (!available) return "full";
  const hasUrgent = day.slots.some((s) => s.label === "last slot" || s.label === "limited");
  return hasUrgent ? "limited" : "available";
}

export function Calendar({ days, selectedDate, onSelect }: CalendarProps) {
  return (
    <motion.div
      className="grid grid-cols-4 gap-2 sm:grid-cols-7"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {days.map((day) => {
        const { dayName, dayNum, monthShort } = formatDay(day.date);
        const status = getDayStatus(day);
        const isSelected = selectedDate === day.date;
        const isFull = status === "full";

        return (
          <motion.button
            key={day.date}
            type="button"
            disabled={isFull}
            onClick={() => onSelect(day.date)}
            variants={staggerItem}
            className={`relative flex flex-col items-center rounded-2xl px-3 py-3 transition-all duration-200 ${
              isSelected
                ? "bg-neutral-900 text-white shadow-lg"
                : isFull
                  ? "cursor-not-allowed bg-neutral-100 text-neutral-300"
                  : "bg-white/60 text-neutral-700 hover:bg-white/80 hover:shadow-sm"
            } border ${isSelected ? "border-neutral-900" : "border-neutral-200"}`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-60">{dayName}</span>
            <span className="mt-0.5 text-lg font-bold">{dayNum}</span>
            <span className="text-[10px] opacity-60">{monthShort}</span>

            {/* urgency dot */}
            {!isFull && !isSelected && status === "limited" && (
              <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
            )}
            {isFull && (
              <span className="absolute -bottom-1.5 text-[8px] font-medium uppercase tracking-wider text-neutral-400">
                full
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
