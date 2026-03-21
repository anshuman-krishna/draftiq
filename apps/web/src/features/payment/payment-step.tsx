"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePaymentStore } from "@/store/payment";
import { useBookingStore } from "@/store/booking";
import { usePricing } from "@/hooks/use-pricing";
import { formatPrice } from "@/features/pricing";
import { StripeProvider } from "./stripe-provider";
import { PaymentForm } from "./payment-form";

const DEPOSIT_PERCENT = 20;

export function PaymentStep() {
  const { pricing } = usePricing();

  const booking = useBookingStore((s) => s.booking);

  const paymentType = usePaymentStore((s) => s.paymentType);
  const setPaymentType = usePaymentStore((s) => s.setPaymentType);
  const clientSecret = usePaymentStore((s) => s.clientSecret);
  const paymentStatus = usePaymentStore((s) => s.paymentStatus);
  const error = usePaymentStore((s) => s.error);
  const createIntent = usePaymentStore((s) => s.createIntent);

  const total = pricing.total;
  const depositAmount = Math.round(total * (DEPOSIT_PERCENT / 100) * 100) / 100;
  const displayAmount = paymentType === "deposit" ? depositAmount : total;

  // create payment intent when type changes or on mount
  useEffect(() => {
    if (total > 0 && paymentStatus !== "processing" && paymentStatus !== "succeeded") {
      createIntent(total, booking?.id, undefined);
    }
    // only re-run when paymentType or total changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType, total]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">secure your booking</h2>
      <p className="mt-2 text-neutral-500">choose a payment option and complete your order.</p>

      {/* price breakdown recap */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/60 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          order summary
        </p>
        <div className="mt-3 space-y-2">
          {pricing.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">{item.label}</span>
              <span className="font-medium text-neutral-900">{formatPrice(item.price)}</span>
            </div>
          ))}
          <div className="border-t border-neutral-100 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">total</span>
              <span className="text-lg font-bold text-neutral-900">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* payment type selector */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPaymentType("deposit")}
          className={`rounded-2xl border-2 p-4 text-left transition-all ${
            paymentType === "deposit"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white/60 hover:border-neutral-300"
          }`}
        >
          <p
            className={`text-xs uppercase tracking-wider ${paymentType === "deposit" ? "text-white/60" : "text-neutral-400"}`}
          >
            deposit ({DEPOSIT_PERCENT}%)
          </p>
          <p
            className={`mt-1 text-lg font-bold ${paymentType === "deposit" ? "text-white" : "text-neutral-900"}`}
          >
            {formatPrice(depositAmount)}
          </p>
          <p
            className={`mt-1 text-xs ${paymentType === "deposit" ? "text-white/60" : "text-neutral-400"}`}
          >
            pay the rest at installation
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPaymentType("full")}
          className={`rounded-2xl border-2 p-4 text-left transition-all ${
            paymentType === "full"
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white/60 hover:border-neutral-300"
          }`}
        >
          <p
            className={`text-xs uppercase tracking-wider ${paymentType === "full" ? "text-white/60" : "text-neutral-400"}`}
          >
            full payment
          </p>
          <p
            className={`mt-1 text-lg font-bold ${paymentType === "full" ? "text-white" : "text-neutral-900"}`}
          >
            {formatPrice(total)}
          </p>
          <p
            className={`mt-1 text-xs ${paymentType === "full" ? "text-white/60" : "text-neutral-400"}`}
          >
            nothing due at installation
          </p>
        </button>
      </div>

      {/* amount to pay now */}
      <motion.div
        className="mt-6 rounded-2xl bg-neutral-50 p-4 text-center"
        key={displayAmount}
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
      >
        <p className="text-xs text-neutral-400">paying now</p>
        <p className="text-2xl font-bold text-neutral-900">{formatPrice(displayAmount)}</p>
        {paymentType === "deposit" && (
          <p className="mt-1 text-xs text-neutral-400">
            remaining {formatPrice(total - depositAmount)} due at installation
          </p>
        )}
      </motion.div>

      {/* stripe form */}
      <div className="mt-8">
        {paymentStatus === "creating" && (
          <div className="flex flex-col items-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
            <p className="mt-3 text-sm text-neutral-500">setting up secure payment...</p>
          </div>
        )}

        {error && paymentStatus === "failed" && !clientSecret && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {clientSecret && paymentStatus !== "succeeded" && (
          <StripeProvider clientSecret={clientSecret}>
            <PaymentForm />
          </StripeProvider>
        )}
      </div>
    </div>
  );
}
