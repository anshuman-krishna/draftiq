export function buildUpsellPrompt(
  answers: Record<string, string | string[]>,
  breakdown: { items: { label: string; price: number }[]; total: number },
): string {
  const selections = Object.entries(answers)
    .map(([step, value]) => `- ${step}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");

  const selectedAddons = Array.isArray(answers["add-ons"]) ? answers["add-ons"] : [];

  const availableAddons = [
    { id: "thermostat", label: "smart thermostat", price: 350, benefit: "wi-fi enabled, learns your schedule" },
    { id: "purifier", label: "air purifier", price: 650, benefit: "whole-home air purification" },
    { id: "humidifier", label: "whole-home humidifier", price: 450, benefit: "optimal indoor humidity" },
    { id: "warranty", label: "extended warranty", price: 500, benefit: "5-year parts and labor coverage" },
    { id: "maintenance", label: "annual maintenance plan", price: 299, benefit: "yearly tune-up and priority service" },
    { id: "zoning", label: "zone control system", price: 1200, benefit: "independent temperature control per zone" },
  ];

  const unselectedAddons = availableAddons
    .filter((a) => !selectedAddons.includes(a.id))
    .map((a) => `- ${a.label} ($${a.price}): ${a.benefit}`)
    .join("\n");

  return `you are a helpful hvac advisor suggesting relevant add-ons to a homeowner. your goal is to genuinely improve their experience, not hard-sell.

customer selections:
${selections}

current total: $${breakdown.total.toLocaleString()}

add-ons they have NOT selected yet:
${unselectedAddons || "all add-ons already selected"}

rules:
- suggest 2-3 add-ons that make the most sense for their specific setup.
- never invent products or prices. only suggest from the list above.
- explain why each suggestion matters for THEIR situation specifically.
- be conversational, not salesy. like a friend giving advice.
- if they already have all relevant add-ons, say so honestly.

respond in this exact JSON format:
{
  "suggestions": [
    {
      "addonId": "the id from the list",
      "label": "add-on name",
      "price": number,
      "reason": "1-2 sentence personalized reason why this matters for their setup"
    }
  ],
  "note": "optional one-sentence note about their overall setup (or null)"
}`;
}
