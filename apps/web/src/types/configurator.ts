// schema-driven configurator types

export type StepType = "select" | "multi-select" | "slider" | "summary" | "booking" | "payment";

export interface StepOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  pricingKey: string;
  recommended?: boolean;
}

export interface StepCondition {
  dependsOn: string;
  operator: "equals" | "not-equals" | "includes";
  value: string | string[];
}

export interface ConfiguratorStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  options?: StepOption[];
  columns?: 2 | 3;
  condition?: StepCondition;
  defaultValue?: string | string[];
  // slider-specific
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
    pricingKey: string;
  };
}

export interface ConfiguratorSchema {
  id: string;
  name: string;
  industry: string;
  steps: ConfiguratorStep[];
}

// pricing types

export type PricingRuleType = "fixed" | "percentage" | "per-unit";

export interface PricingRule {
  key: string;
  label: string;
  type: PricingRuleType;
  value: number;
  // for percentage rules, this is the base key to apply the percentage to
  baseKey?: string;
}

export interface PricingConfig {
  rules: Record<string, PricingRule>;
  // tier multipliers — applied to base price
  tierMultipliers?: Record<string, number>;
}

export interface PriceLineItem {
  label: string;
  price: number;
}

export interface PriceBreakdown {
  items: PriceLineItem[];
  total: number;
}
