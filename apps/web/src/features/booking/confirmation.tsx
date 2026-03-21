"use client";

import { motion } from "framer-motion";
import { Button } from "@draftiq/ui";
import { useBookingStore } from "@/store/booking";

export function BookingConfirmation() {
  const booking = useBookingStore((s) => s.booking);
  const reset = useBookingStore((s) => s.reset);

  if (!booking) return null;

  const dateFormatted = new Date(booking.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  const slotFormatted = booking.slot
    .replace("-", " – ")
    .replace(/(\d{2}):(\d{2})/g, (_, h: string, m: string) => {
      const hour = parseInt(h);
      return `${hour > 12 ? hour - 12 : hour}${m === "00" ? "" : `:${m}`}${hour >= 12 ? "pm" : "am"}`;
    });

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          className="text-emerald-600"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.h2
        className="mt-6 text-2xl font-bold text-neutral-900"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        you&apos;re all set!
      </motion.h2>

      <motion.p
        className="mt-2 text-neutral-500"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        your installation has been scheduled.
      </motion.p>

      <motion.div
        className="mt-8 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white/60 p-6 text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">
              date
            </p>
            <p className="mt-0.5 font-semibold text-neutral-900">
              {dateFormatted}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">
              time
            </p>
            <p className="mt-0.5 font-semibold text-neutral-900">
              {slotFormatted}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">
              confirmation
            </p>
            <p className="mt-0.5 font-mono text-sm text-neutral-600">
              {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">
              status
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {booking.status}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.p
        className="mt-6 text-sm text-neutral-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        we&apos;ll send you a confirmation email with all the details.
      </motion.p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button variant="ghost" onClick={reset}>
          start a new estimate
        </Button>
      </motion.div>
    </div>
  );
}
