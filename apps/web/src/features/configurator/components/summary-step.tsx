"use client";

import { useConfiguratorStore } from "@/store/configurator";
import { usePricing } from "@/hooks/use-pricing";
import { formatPrice } from "@/features/pricing";
import {
  RecommendationCard,
  PriceExplanation,
  UpsellSuggestions,
  useRecommendation,
  useExplanation,
  useUpsells,
} from "@/features/ai";

export function SummaryStep() {
  const schema = useConfiguratorStore((s) => s.schema);
  const answers = useConfiguratorStore((s) => s.answers);
  const toggleMultiSelect = useConfiguratorStore((s) => s.toggleMultiSelect);
  const { pricing, loading } = usePricing();

  const { data: recommendation, loading: recLoading } = useRecommendation(
    answers,
    pricing,
    pricing.total > 0,
  );

  const { data: explanation, loading: expLoading } = useExplanation(
    pricing,
    pricing.total > 0,
  );

  const { data: upsells, loading: upsLoading } = useUpsells(
    answers,
    pricing,
    pricing.total > 0,
  );

  if (!schema) return null;

  // build selection display from schema + answers
  const selections: { label: string; value: string }[] = [];
  for (const step of schema.steps) {
    if (step.type === "summary" || !step.options) continue;
    const answer = answers[step.id];
    if (!answer) continue;

    if (step.type === "select" && typeof answer === "string") {
      const option = step.options.find((o) => o.id === answer);
      if (option) {
        selections.push({ label: step.title, value: option.label });
      }
    }

    if (step.type === "multi-select" && Array.isArray(answer) && answer.length > 0) {
      const labels = answer
        .map((id) => step.options?.find((o) => o.id === id)?.label)
        .filter(Boolean);
      selections.push({ label: step.title, value: labels.join(", ") });
    }
  }

  const selectedAddons = Array.isArray(answers["add-ons"])
    ? (answers["add-ons"] as string[])
    : [];

  function handleAddUpsell(addonId: string) {
    toggleMultiSelect("add-ons", addonId);
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-neutral-900">
        your estimate summary
      </h2>
      <p className="mb-8 text-neutral-500">
        review your selections and estimated pricing below.
      </p>

      <div className="space-y-4">
        {/* ai recommendation */}
        <RecommendationCard data={recommendation} loading={recLoading} />

        {/* selections */}
        <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            your selections
          </h3>
          <div className="space-y-3">
            {selections.map((item) => (
              <div key={item.label} className="flex justify-between gap-4">
                <span className="text-sm text-neutral-500">{item.label}</span>
                <span className="text-right text-sm font-medium text-neutral-900">
                  {item.value}
                </span>
              </div>
            ))}
            {selections.length === 0 && (
              <p className="text-sm text-neutral-400">
                no selections made yet
              </p>
            )}
          </div>
        </div>

        {/* price breakdown */}
        <div className="rounded-2xl border border-neutral-200 bg-white/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              price breakdown
            </h3>
            {loading && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            )}
          </div>
          <div className="space-y-3">
            {pricing.items.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm text-neutral-500">{item.label}</span>
                <span className="text-sm font-medium text-neutral-900">
                  {formatPrice(item.price)}
                </span>
              </div>
            ))}
            {pricing.items.length === 0 && (
              <p className="text-sm text-neutral-400">
                select options to see pricing
              </p>
            )}
            {pricing.total > 0 && (
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-neutral-900">
                    estimated total
                  </span>
                  <span className="text-xl font-bold text-neutral-900">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ai price explanation */}
        <PriceExplanation data={explanation} loading={expLoading} />

        {/* ai upsell suggestions */}
        <UpsellSuggestions
          data={upsells}
          loading={upsLoading}
          onAdd={handleAddUpsell}
          selectedAddons={selectedAddons}
        />

        <p className="text-center text-xs text-neutral-400">
          this is an estimate. final pricing confirmed after site assessment.
        </p>
      </div>
    </div>
  );
}
