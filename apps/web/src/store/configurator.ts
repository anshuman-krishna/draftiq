import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConfiguratorSchema, ConfiguratorStep, PricingConfig, PriceBreakdown } from "@/types/configurator";
import { evaluateCondition } from "@/lib/conditions";
import { calculatePrice } from "@/features/pricing";

interface ConfiguratorState {
  // schema
  schema: ConfiguratorSchema | null;
  pricingConfig: PricingConfig | null;

  // state
  currentStepIndex: number;
  answers: Record<string, string | string[]>;

  // actions
  loadSchema: (schema: ConfiguratorSchema, pricing: PricingConfig) => void;
  setAnswer: (stepId: string, value: string | string[]) => void;
  toggleMultiSelect: (stepId: string, optionId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;

  // computed helpers
  getVisibleSteps: () => ConfiguratorStep[];
  getCurrentStep: () => ConfiguratorStep | null;
  getPricing: () => PriceBreakdown;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      schema: null,
      pricingConfig: null,
      currentStepIndex: 0,
      answers: {},

      loadSchema: (schema, pricing) => {
        // apply smart defaults from schema
        const defaults: Record<string, string | string[]> = {};
        for (const step of schema.steps) {
          if (step.defaultValue !== undefined) {
            defaults[step.id] = step.defaultValue;
          }
        }
        set({ schema, pricingConfig: pricing, currentStepIndex: 0, answers: defaults });
      },

      setAnswer: (stepId, value) =>
        set((state) => ({
          answers: { ...state.answers, [stepId]: value },
        })),

      toggleMultiSelect: (stepId, optionId) =>
        set((state) => {
          const current = (state.answers[stepId] as string[]) ?? [];
          const next = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { answers: { ...state.answers, [stepId]: next } };
        }),

      nextStep: () => {
        const { currentStepIndex, getVisibleSteps } = get();
        const visible = getVisibleSteps();
        const nextIndex = Math.min(currentStepIndex + 1, visible.length - 1);
        set({ currentStepIndex: nextIndex });
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        set({ currentStepIndex: Math.max(currentStepIndex - 1, 0) });
      },

      goToStep: (index) => {
        const visible = get().getVisibleSteps();
        set({ currentStepIndex: Math.max(0, Math.min(index, visible.length - 1)) });
      },

      reset: () => set({ currentStepIndex: 0, answers: {} }),

      getVisibleSteps: () => {
        const { schema, answers } = get();
        if (!schema) return [];
        return schema.steps.filter((step) => {
          if (!step.condition) return true;
          return evaluateCondition(step.condition, answers);
        });
      },

      getCurrentStep: () => {
        const { currentStepIndex, getVisibleSteps } = get();
        const visible = getVisibleSteps();
        return visible[currentStepIndex] ?? null;
      },

      getPricing: () => {
        const { schema, pricingConfig, answers } = get();
        if (!schema || !pricingConfig) return { items: [], total: 0 };
        return calculatePrice(answers, schema, pricingConfig);
      },

      isFirstStep: () => get().currentStepIndex === 0,

      isLastStep: () => {
        const { currentStepIndex, getVisibleSteps } = get();
        return currentStepIndex === getVisibleSteps().length - 1;
      },
    }),
    {
      name: "draftiq-configurator",
      partialize: (state) => ({
        currentStepIndex: state.currentStepIndex,
        answers: state.answers,
      }),
    },
  ),
);
