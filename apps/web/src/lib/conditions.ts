import type { StepCondition } from "@/types/configurator";

// evaluates whether a step condition is met given the current answers
export function evaluateCondition(
  condition: StepCondition,
  answers: Record<string, string | string[]>,
): boolean {
  const answer = answers[condition.dependsOn];
  if (answer === undefined) return false;

  switch (condition.operator) {
    case "equals":
      return answer === condition.value;

    case "not-equals":
      return answer !== condition.value;

    case "includes": {
      if (Array.isArray(answer) && typeof condition.value === "string") {
        return answer.includes(condition.value);
      }
      if (typeof answer === "string" && Array.isArray(condition.value)) {
        return condition.value.includes(answer);
      }
      return false;
    }

    default:
      return true;
  }
}
