"use client";

import { motion } from "framer-motion";
import { Button } from "@draftiq/ui";
import { useBookingStore } from "@/store/booking";
import { usePaymentStore } from "@/store/payment";
import { useConfiguratorStore } from "@/store/configurator";
import { formatPrice } from "@/features/pricing";

export function FinalConfirmation() {
  const booking = useBookingStore((s) => s.booking);
  const resetBooking = useBookingStore((s) => s.reset);
  const paymentAmount = usePaymentStore((s) => s.paymentAmount);
  const paymentType = usePaymentStore((s) => s.paymentType);
  const resetPayment = usePaymentStore((s) => s.reset);
  const resetConfigurator = useConfiguratorStore((s) => s.reset);

  function handleStartOver() {
    resetBooking();
    resetPayment();
    if (resetConfigurator) resetConfigurator();
  }

  const dateFormatted = booking
    ? new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const slotFormatted = booking
    ? booking.slot
        .replace("-", " – ")
        .replace(/(\d{2}):(\d{2})/g, (_, h: string, m: string) => {
          const hour = parseInt(h);
          return `${hour > 12 ? hour - 12 : hour}${m === "00" ? "" : `:${m}`}${hour >= 12 ? "pm" : "am"}`;
        })
    : "";

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
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
        booking confirmed!
      </motion.h2>

      <motion.p
        className="mt-2 max-w-sm text-neutral-500"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        your payment was successful and your installation is scheduled.
      </motion.p>

      <motion.div
        className="mt-8 w-full max-w-md rounded-2xl border border-neutral-200 bg-white/60 p-6 text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="space-y-4">
          {/* payment info */}
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-emerald-600"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                payment received — {formatPrice(paymentAmount)}
              </p>
              <p className="text-xs text-emerald-600">
                {paymentType === "deposit"
                  ? "deposit paid — remainder due at installation"
                  : "paid in full"}
              </p>
            </div>
          </div>

          {booking && (
            <>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  installation date
                </p>
                <p className="mt-0.5 font-semibold text-neutral-900">
                  {dateFormatted}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  time window
                </p>
                <p className="mt-0.5 font-semibold text-neutral-900">
                  {slotFormatted}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  confirmation id
                </p>
                <p className="mt-0.5 font-mono text-sm text-neutral-600">
                  {booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        className="mt-6 w-full max-w-md rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          what happens next
        </p>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-neutral-400">1.</span>
            you&apos;ll receive a confirmation email with all the details
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-neutral-400">2.</span>
            our team will reach out 24 hours before your appointment
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-neutral-400">3.</span>
            installation typically takes 4–8 hours depending on your system
          </li>
        </ul>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button variant="ghost" onClick={handleStartOver}>
          start a new estimate
        </Button>
      </motion.div>
    </div>
  );
}
