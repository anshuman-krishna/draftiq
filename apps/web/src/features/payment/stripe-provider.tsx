"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { ReactNode } from "react";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  if (!stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            colorPrimary: "#171717",
            colorBackground: "#ffffff",
            colorText: "#171717",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              padding: "12px",
            },
            ".Input:focus": {
              border: "1px solid #171717",
              boxShadow: "0 0 0 1px #171717",
            },
            ".Label": {
              fontSize: "13px",
              fontWeight: "500",
              color: "#525252",
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
