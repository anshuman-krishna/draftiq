import type { ConfiguratorSchema, PricingConfig } from "@/types/configurator";

export const hvacSchema: ConfiguratorSchema = {
  id: "hvac-v1",
  name: "hvac system configurator",
  industry: "hvac",
  steps: [
    {
      id: "home-size",
      type: "select",
      title: "how big is your home?",
      description: "this helps us determine the right system size for your space.",
      columns: 2,
      defaultValue: "medium",
      options: [
        {
          id: "small",
          label: "small",
          description: "under 1,500 sq ft — apartments, condos, small homes",
          pricingKey: "base:small",
        },
        {
          id: "medium",
          label: "medium",
          description: "1,500–2,500 sq ft — standard single-family homes",
          pricingKey: "base:medium",
          recommended: true,
        },
        {
          id: "large",
          label: "large",
          description: "2,500–3,500 sq ft — larger homes, multi-story",
          badge: "popular",
          pricingKey: "base:large",
        },
        {
          id: "xlarge",
          label: "extra large",
          description: "3,500+ sq ft — large estates, commercial spaces",
          pricingKey: "base:xlarge",
        },
      ],
    },
    {
      id: "system-type",
      type: "select",
      title: "choose your system",
      description: "select the tier that fits your comfort and budget needs.",
      columns: 3,
      defaultValue: "high-efficiency",
      options: [
        {
          id: "standard",
          label: "standard efficiency",
          description: "reliable and affordable — meets all building codes",
          pricingKey: "system:standard",
        },
        {
          id: "high-efficiency",
          label: "high efficiency",
          description: "up to 20% energy savings — qualifies for rebates",
          badge: "best value",
          pricingKey: "system:high-efficiency",
          recommended: true,
        },
        {
          id: "premium",
          label: "premium",
          description: "top-tier performance — whisper quiet, maximum comfort",
          pricingKey: "system:premium",
        },
      ],
    },
    {
      id: "duct-condition",
      type: "select",
      title: "what condition are your ducts in?",
      description: "ductwork condition affects installation cost and system performance.",
      columns: 2,
      options: [
        {
          id: "good",
          label: "good condition",
          description: "less than 10 years old, no visible damage or leaks",
          pricingKey: "duct:good",
        },
        {
          id: "fair",
          label: "fair condition",
          description: "some age or minor issues — may need sealing",
          pricingKey: "duct:fair",
        },
        {
          id: "poor",
          label: "poor condition",
          description: "significant wear, visible leaks, or old insulation",
          pricingKey: "duct:poor",
        },
        {
          id: "replace",
          label: "full replacement",
          description: "complete ductwork replacement needed",
          pricingKey: "duct:replace",
        },
      ],
    },
    {
      id: "add-ons",
      type: "multi-select",
      title: "enhance your system",
      description: "optional upgrades to improve comfort and efficiency.",
      columns: 2,
      options: [
        {
          id: "thermostat",
          label: "smart thermostat",
          description: "wi-fi enabled, learns your schedule",
          pricingKey: "addon:thermostat",
        },
        {
          id: "purifier",
          label: "air purifier",
          description: "whole-home air purification system",
          pricingKey: "addon:purifier",
        },
        {
          id: "humidifier",
          label: "whole-home humidifier",
          description: "maintain optimal indoor humidity",
          pricingKey: "addon:humidifier",
        },
        {
          id: "warranty",
          label: "extended warranty",
          description: "5-year parts and labor coverage",
          pricingKey: "addon:warranty",
        },
        {
          id: "maintenance",
          label: "annual maintenance plan",
          description: "yearly tune-up and priority service",
          pricingKey: "addon:maintenance",
        },
        {
          id: "zoning",
          label: "zone control system",
          description: "independent temperature control per zone",
          pricingKey: "addon:zoning",
          badge: "recommended",
        },
      ],
    },
    {
      id: "summary",
      type: "summary",
      title: "your estimate summary",
      description: "review your selections and estimated pricing below.",
    },
    {
      id: "booking",
      type: "booking",
      title: "schedule installation",
      description: "pick a date and time for your installation.",
    },
    {
      id: "payment",
      type: "payment",
      title: "secure payment",
      description: "complete your payment to confirm the booking.",
    },
  ],
};

export const hvacPricing: PricingConfig = {
  rules: {
    // base prices by home size
    "base:small": { key: "base:small", label: "base installation", type: "fixed", value: 3200 },
    "base:medium": { key: "base:medium", label: "base installation", type: "fixed", value: 4800 },
    "base:large": { key: "base:large", label: "base installation", type: "fixed", value: 6500 },
    "base:xlarge": { key: "base:xlarge", label: "base installation", type: "fixed", value: 8200 },

    // system tier upgrades
    "system:standard": {
      key: "system:standard",
      label: "standard system",
      type: "fixed",
      value: 0,
    },
    "system:high-efficiency": {
      key: "system:high-efficiency",
      label: "high efficiency upgrade",
      type: "fixed",
      value: 1800,
    },
    "system:premium": {
      key: "system:premium",
      label: "premium upgrade",
      type: "fixed",
      value: 3500,
    },

    // ductwork
    "duct:good": { key: "duct:good", label: "ductwork — good", type: "fixed", value: 0 },
    "duct:fair": { key: "duct:fair", label: "duct sealing", type: "fixed", value: 800 },
    "duct:poor": { key: "duct:poor", label: "duct repair", type: "fixed", value: 1600 },
    "duct:replace": { key: "duct:replace", label: "duct replacement", type: "fixed", value: 3200 },

    // add-ons
    "addon:thermostat": {
      key: "addon:thermostat",
      label: "smart thermostat",
      type: "fixed",
      value: 350,
    },
    "addon:purifier": { key: "addon:purifier", label: "air purifier", type: "fixed", value: 650 },
    "addon:humidifier": {
      key: "addon:humidifier",
      label: "whole-home humidifier",
      type: "fixed",
      value: 450,
    },
    "addon:warranty": {
      key: "addon:warranty",
      label: "extended warranty",
      type: "fixed",
      value: 500,
    },
    "addon:maintenance": {
      key: "addon:maintenance",
      label: "annual maintenance plan",
      type: "fixed",
      value: 299,
    },
    "addon:zoning": {
      key: "addon:zoning",
      label: "zone control system",
      type: "fixed",
      value: 1200,
    },
  },

  tierMultipliers: {
    standard: 1.0,
    "high-efficiency": 1.0,
    premium: 1.0,
  },
};
