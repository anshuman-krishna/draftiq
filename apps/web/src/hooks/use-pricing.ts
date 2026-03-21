"use client";

import { useEffect, useRef, useState } from "react";
import { useConfiguratorStore } from "@/store/configurator";
import { calculatePriceRemote } from "@/lib/api";
import type { PriceBreakdown } from "@/types/configurator";

const DEBOUNCE_MS = 300;

export function usePricing() {
  const answers = useConfiguratorStore((s) => s.answers);
  const localPricing = useConfiguratorStore((s) => s.getPricing());
  const [remotePricing, setRemotePricing] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // skip if no answers yet
    const hasAnswers = Object.values(answers).some((v) =>
      Array.isArray(v) ? v.length > 0 : v !== "",
    );
    if (!hasAnswers) {
      setRemotePricing(null);
      return;
    }

    setLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await calculatePriceRemote(answers);
        setRemotePricing(result);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [answers]);

  // use remote pricing when available, fall back to local calculation
  const pricing = remotePricing ?? localPricing;

  return { pricing, loading, error };
}
