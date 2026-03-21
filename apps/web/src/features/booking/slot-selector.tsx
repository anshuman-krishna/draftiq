"use client";

import { motion } from "framer-motion";
import type { SlotInfo } from "@/lib/api";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface SlotSelectorProps {
  slots: SlotInfo[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}

const SLOT_LABELS: Record<string, string> = {
  "09:00-12:00": "morning",
  "12:00-15:00": "afternoon",
  "15:00-18:00": "evening",
};

const SLOT_ICONS: Record<string, string> = {
  "09:00-12:00": "9am – 12pm",
  "12:00-15:00": "12pm – 3pm",
  "15:00-18:00": "3pm – 6pm",
};

function getUrgencyStyle(label: SlotInfo["label"], isSelected: boolean) {
  if (isSelected) return "text-white/80";
  switch (label) {
    case "last slot":
      return "text-red-500 font-semibold";
    case "limited":
      return "text-amber-600";
    default:
      return "text-neutral-400";
  }
}

export function SlotSelector({ slots, selectedSlot, onSelect }: SlotSelectorProps) {
  return (
    <motion.div
      className="grid gap-3 sm:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.time;
        const isFull = slot.remaining === 0;

        return (
          <motion.button
            key={slot.time}
            type="button"
            disabled={isFull}
            onClick={() => onSelect(slot.time)}
            variants={staggerItem}
            className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
              isSelected
                ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                : isFull
                  ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300"
                  : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:shadow-sm"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-wider ${isSelected ? "text-white/70" : "text-neutral-400"}`}
            >
              {SLOT_LABELS[slot.time] ?? slot.time}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${isSelected ? "text-white" : isFull ? "text-neutral-300" : "text-neutral-900"}`}
            >
              {SLOT_ICONS[slot.time] ?? slot.time}
            </p>
            <p className={`mt-2 text-xs ${getUrgencyStyle(slot.label, isSelected)}`}>
              {isFull
                ? "fully booked"
                : slot.label === "last slot"
                  ? "last slot!"
                  : slot.label === "limited"
                    ? `${slot.remaining} left`
                    : `${slot.remaining} available`}
            </p>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
