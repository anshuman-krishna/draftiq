import { create } from "zustand";
import type { PaymentIntentResponse } from "@/lib/api";
import { createPaymentIntent as createPaymentIntentApi } from "@/lib/api";

const DEPOSIT_RATE = 0.2;

interface PaymentState {
  // data
  clientSecret: string | null;
  paymentId: string | null;
  paymentType: "deposit" | "full";
  paymentAmount: number;
  paymentStatus: "idle" | "creating" | "processing" | "succeeded" | "failed";
  error: string | null;

  // actions
  setPaymentType: (type: "deposit" | "full") => void;
  createIntent: (amount: number, bookingId?: string, quoteId?: string) => Promise<void>;
  setProcessing: () => void;
  setSucceeded: () => void;
  setFailed: (error: string) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  clientSecret: null,
  paymentId: null,
  paymentType: "full",
  paymentAmount: 0,
  paymentStatus: "idle",
  error: null,

  setPaymentType: (type) => set({ paymentType: type }),

  createIntent: async (amount, bookingId, quoteId) => {
    const { paymentType } = get();
    const finalAmount =
      paymentType === "deposit" ? Math.round(amount * DEPOSIT_RATE * 100) / 100 : amount;

    set({ paymentStatus: "creating", error: null, paymentAmount: finalAmount });

    try {
      const result: PaymentIntentResponse = await createPaymentIntentApi(
        finalAmount,
        bookingId,
        quoteId,
        paymentType,
      );
      set({
        clientSecret: result.clientSecret,
        paymentId: result.paymentId,
        paymentStatus: "idle",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "payment setup failed";
      set({ paymentStatus: "failed", error: message });
    }
  },

  setProcessing: () => set({ paymentStatus: "processing" }),
  setSucceeded: () => set({ paymentStatus: "succeeded" }),
  setFailed: (error) => set({ paymentStatus: "failed", error }),

  reset: () =>
    set({
      clientSecret: null,
      paymentId: null,
      paymentType: "full",
      paymentAmount: 0,
      paymentStatus: "idle",
      error: null,
    }),
}));
