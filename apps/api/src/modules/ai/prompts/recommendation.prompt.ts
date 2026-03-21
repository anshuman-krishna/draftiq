export function buildRecommendationPrompt(
  answers: Record<string, string | string[]>,
  breakdown: { items: { label: string; price: number }[]; total: number },
): string {
  const selections = Object.entries(answers)
    .map(([step, value]) => `- ${step}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");

  const priceLines = breakdown.items
    .map((item) => `- ${item.label}: $${item.price.toLocaleString()}`)
    .join("\n");

  return `you are a trusted hvac advisor helping a homeowner choose the right system. your goal is to increase their confidence and help them make a decision they won't regret.

the customer has made the following selections:
${selections}

current price breakdown:
${priceLines}
total: $${breakdown.total.toLocaleString()}

analyze their selections and recommend the best system tier (good, better, or best):

- good = standard efficiency. reliable, budget-friendly.
- better = high efficiency. energy savings, rebate eligible. best value for most homes.
- best = premium. top performance, whisper quiet, maximum comfort.

rules:
- never invent or change prices. use only the prices shown above.
- be honest. if their current selection is already the best fit, say so.
- keep it simple. no technical jargon. speak like a helpful neighbor, not a salesperson.
- be concise. 2-3 sentences for reasoning.

respond in this exact JSON format:
{
  "tier": "good" | "better" | "best",
  "title": "short recommendation title (5-8 words)",
  "reasoning": "2-3 sentence explanation of why this tier fits their needs",
  "confidence": 0.0 to 1.0
}`;
}
