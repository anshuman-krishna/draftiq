"use client";

import type { ConfiguratorStep } from "@/types/configurator";
import { useConfiguratorStore } from "@/store/configurator";
import { SelectStep } from "./select-step";
import { MultiSelectStep } from "./multi-select-step";
import { SummaryStep } from "./summary-step";
import { BookingStep } from "@/features/booking";
import { PaymentStep } from "@/features/payment";

interface StepRendererProps {
  step: ConfiguratorStep;
}

export function StepRenderer({ step }: StepRendererProps) {
  const answers = useConfiguratorStore((s) => s.answers);
  const setAnswer = useConfiguratorStore((s) => s.setAnswer);
  const toggleMultiSelect = useConfiguratorStore((s) => s.toggleMultiSelect);

  switch (step.type) {
    case "select":
      return (
        <SelectStep
          step={step}
          value={(answers[step.id] as string) ?? ""}
          onChange={(value) => setAnswer(step.id, value)}
        />
      );

    case "multi-select":
      return (
        <MultiSelectStep
          step={step}
          selected={(answers[step.id] as string[]) ?? []}
          onToggle={(optionId) => toggleMultiSelect(step.id, optionId)}
        />
      );

    case "summary":
      return <SummaryStep />;

    case "booking":
      return <BookingStep />;

    case "payment":
      return <PaymentStep />;

    default:
      return null;
  }
}
