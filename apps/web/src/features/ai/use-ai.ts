import { useState, useEffect, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface RecommendationData {
  tier: "good" | "better" | "best";
  title: string;
  reasoning: string;
  confidence: number;
}

export interface ExplanationData {
  summary: string;
  items: { label: string; explanation: string }[];
  valueNote: string;
}

export interface UpsellData {
  suggestions: {
    addonId: string;
    label: string;
    price: number;
    reason: string;
  }[];
  note: string | null;
}

interface AiPayload {
  answers: Record<string, string | string[]>;
  breakdown: { items: { label: string; price: number }[]; total: number };
}

async function fetchAi<T>(
  endpoint: string,
  payload: AiPayload,
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}/ai/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;
    return data as T;
  } catch {
    return null;
  }
}

function useAiRequest<T>(
  endpoint: string,
  answers: Record<string, string | string[]>,
  breakdown: { items: { label: string; price: number }[]; total: number },
  enabled: boolean,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const requestedRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || breakdown.total === 0) return;

    // deduplicate identical requests
    const key = JSON.stringify({ answers, breakdown });
    if (requestedRef.current === key) return;
    requestedRef.current = key;

    setLoading(true);
    fetchAi<T>(endpoint, { answers, breakdown }).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [endpoint, answers, breakdown, enabled]);

  return { data, loading };
}

export function useRecommendation(
  answers: Record<string, string | string[]>,
  breakdown: { items: { label: string; price: number }[]; total: number },
  enabled = true,
) {
  return useAiRequest<RecommendationData>("recommend", answers, breakdown, enabled);
}

export function useExplanation(
  breakdown: { items: { label: string; price: number }[]; total: number },
  enabled = true,
) {
  // explanation only needs breakdown, but api expects answers too
  return useAiRequest<ExplanationData>("explain", {}, breakdown, enabled);
}

export function useUpsells(
  answers: Record<string, string | string[]>,
  breakdown: { items: { label: string; price: number }[]; total: number },
  enabled = true,
) {
  return useAiRequest<UpsellData>("upsell", answers, breakdown, enabled);
}
