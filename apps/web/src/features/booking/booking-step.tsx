"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingStore } from "@/store/booking";
import { Calendar } from "./calendar";
import { SlotSelector } from "./slot-selector";
import { fadeIn } from "@/lib/motion";

export function BookingStep() {
  const availability = useBookingStore((s) => s.availability);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedSlot = useBookingStore((s) => s.selectedSlot);
  const loading = useBookingStore((s) => s.loading);
  const error = useBookingStore((s) => s.error);
  const fetchAvailability = useBookingStore((s) => s.fetchAvailability);
  const selectDate = useBookingStore((s) => s.selectDate);
  const selectSlot = useBookingStore((s) => s.selectSlot);

  useEffect(() => {
    if (availability.length === 0) {
      fetchAvailability();
    }
  }, [availability.length, fetchAvailability]);

  const selectedDay = availability.find((d) => d.date === selectedDate);
  const availableSlots = selectedDay?.slots ?? [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
        <p className="mt-4 text-sm text-neutral-500">loading availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchAvailability}
          className="mt-3 text-sm font-medium text-red-700 underline"
        >
          try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">
        schedule your installation
      </h2>
      <p className="mt-2 text-neutral-500">
        pick a date and time that works best for you.
      </p>

      <div className="mt-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
          select a date
        </p>
        <Calendar
          days={availability}
          selectedDate={selectedDate}
          onSelect={selectDate}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedDate && availableSlots.length > 0 && (
          <motion.div
            key={selectedDate}
            className="mt-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
              choose a time slot
            </p>
            <SlotSelector
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelect={selectSlot}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDate && selectedSlot && (
        <motion.div
          className="mt-8 rounded-2xl border border-secondary/30 bg-secondary/10 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-medium text-neutral-700">
            selected:{" "}
            <span className="font-bold text-neutral-900">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>{" "}
            ·{" "}
            <span className="font-bold text-neutral-900">
              {selectedSlot.replace("-", " – ").replace(/(\d{2}):(\d{2})/g, (_, h, m) => {
                const hour = parseInt(h);
                return `${hour > 12 ? hour - 12 : hour}${m === "00" ? "" : `:${m}`}${hour >= 12 ? "pm" : "am"}`;
              })}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
