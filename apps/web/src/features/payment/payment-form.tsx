"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Button } from "@draftiq/ui";
import { usePaymentStore } from "@/store/payment";
import { formatPrice } from "@/features/pricing";

export function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);

  const paymentAmount = usePaymentStore((s) => s.paymentAmount);
  const paymentStatus = usePaymentStore((s) => s.paymentStatus);
  const setProcessing = usePaymentStore((s) => s.setProcessing);
  const setSucceeded = usePaymentStore((s) => s.setSucceeded);
  const setFailed = usePaymentStore((s) => s.setFailed);

  const isProcessing = paymentStatus === "processing";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing();

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setFailed(error.message ?? "payment failed");
    } else {
      setSucceeded();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* trust indicators */}
      <div className="mb-6 flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs text-neutral-500">
          secured by stripe — your payment info never touches our servers
        </span>
      </div>

      <PaymentElement onReady={() => setReady(true)} options={{ layout: "tabs" }} />

      <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }}>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!stripe || !ready || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              processing...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                <rect
                  x="1"
                  y="4"
                  width="22"
                  height="16"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
              </svg>
              pay {formatPrice(paymentAmount)}
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
