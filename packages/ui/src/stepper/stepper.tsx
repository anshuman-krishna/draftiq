"use client";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && isCompleted;

        return (
          <div key={step} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={`flex items-center gap-2 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-white shadow-sm"
                    : isActive
                      ? "bg-neutral-900 text-white shadow-md"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`hidden text-sm sm:block ${
                  isActive
                    ? "font-medium text-neutral-900"
                    : isCompleted
                      ? "text-neutral-600"
                      : "text-neutral-400"
                }`}
              >
                {step}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className="mx-3 h-px w-6 sm:w-10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    background: isCompleted ? "#a7c7e7" : "#e5e5e5",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
