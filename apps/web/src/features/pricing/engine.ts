import type {
  PricingConfig,
  PriceBreakdown,
  PriceLineItem,
  ConfiguratorSchema,
} from "@/types/configurator";

// resolves all active pricing keys from current answers + schema
function resolveActivePricingKeys(
  answers: Record<string, string | string[]>,
  schema: ConfiguratorSchema,
): string[] {
  const keys: string[] = [];

  for (const step of schema.steps) {
    if (step.type === "summary" || !step.options) continue;

    const answer = answers[step.id];
    if (!answer) continue;

    if (step.type === "select" && typeof answer === "string") {
      const option = step.options.find((o) => o.id === answer);
      if (option) keys.push(option.pricingKey);
    }

    if (step.type === "multi-select" && Array.isArray(answer)) {
      for (const selected of answer) {
        const option = step.options.find((o) => o.id === selected);
        if (option) keys.push(option.pricingKey);
      }
    }
  }

  return keys;
}

export function calculatePrice(
  answers: Record<string, string | string[]>,
  schema: ConfiguratorSchema,
  pricing: PricingConfig,
): PriceBreakdown {
  const activeKeys = resolveActivePricingKeys(answers, schema);
  const items: PriceLineItem[] = [];
  let total = 0;

  for (const key of activeKeys) {
    const rule = pricing.rules[key];
    if (!rule) continue;

    let amount = 0;

    if (rule.type === "fixed") {
      amount = rule.value;
    } else if (rule.type === "percentage" && rule.baseKey) {
      const baseRule = pricing.rules[rule.baseKey];
      if (baseRule) amount = baseRule.value * (rule.value / 100);
    }

    // skip zero-value items from the breakdown display
    if (amount > 0) {
      items.push({ label: rule.label, price: amount });
    }
    total += amount;
  }

  return { items, total };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
