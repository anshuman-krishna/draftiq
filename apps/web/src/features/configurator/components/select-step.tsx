"use client";

import { OptionSelector } from "@draftiq/ui";
import type { ConfiguratorStep } from "@/types/configurator";

interface SelectStepProps {
  step: ConfiguratorStep;
  value: string;
  onChange: (value: string) => void;
}

export function SelectStep({ step, value, onChange }: SelectStepProps) {
  const options = (step.options ?? []).map((o) => ({
    id: o.id,
    label: o.label,
    description: o.description,
    badge: o.badge,
  }));

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-neutral-900">
        {step.title}
      </h2>
      <p className="mb-8 text-neutral-500">{step.description}</p>
      <OptionSelector
        options={options}
        value={value}
        onChange={onChange}
        columns={step.columns ?? 3}
      />
    </div>
  );
}
