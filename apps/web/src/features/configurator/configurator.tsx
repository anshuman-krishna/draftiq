"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, PanInfo } from "framer-motion";
import { Button, Stepper, PricingSidebar } from "@draftiq/ui";
import { useConfiguratorStore } from "@/store/configurator";
import { useBookingStore } from "@/store/booking";
import { usePaymentStore } from "@/store/payment";
import { usePricing } from "@/hooks/use-pricing";
import { formatPrice } from "@/features/pricing";
import { AnimatedPrice } from "@/features/pricing/visualization";
import {
  trackStepView,
  trackStepComplete,
  trackBookingStarted,
  trackBookingCompleted,
  trackPaymentStarted,
  trackPaymentCompleted,
} from "@/lib/analytics";
import { stepForward, stepBackward } from "@/lib/motion";
import { FinalConfirmation } from "./components/final-confirmation";
import { hvacSchema, hvacPricing } from "./schema";
import { StepRenderer } from "./components";

const SWIPE_THRESHOLD = 50;

export function Configurator() {
  const loadSchema = useConfiguratorStore((s) => s.loadSchema);
  const schema = useConfiguratorStore((s) => s.schema);
  const currentStepIndex = useConfiguratorStore((s) => s.currentStepIndex);
  const nextStep = useConfiguratorStore((s) => s.nextStep);
  const prevStep = useConfiguratorStore((s) => s.prevStep);
  const goToStep = useConfiguratorStore((s) => s.goToStep);
  const visibleSteps = useConfiguratorStore((s) => s.getVisibleSteps());
  const currentStep = useConfiguratorStore((s) => s.getCurrentStep());
  const isFirst = useConfiguratorStore((s) => s.isFirstStep());

  const booking = useBookingStore((s) => s.booking);
  const submitting = useBookingStore((s) => s.submitting);
  const confirmBooking = useBookingStore((s) => s.confirmBooking);
  const selectedSlot = useBookingStore((s) => s.selectedSlot);

  const paymentStatus = usePaymentStore((s) => s.paymentStatus);

  const { pricing, loading } = usePricing();

  const prevStepRef = useRef<string | null>(null);
  const prevIndexRef = useRef(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const dragX = useMotionValue(0);

  // mobile bottom sheet expanded state
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  useEffect(() => {
    if (!schema) {
      loadSchema(hvacSchema, hvacPricing);
    }
  }, [schema, loadSchema]);

  // track direction of step changes
  useEffect(() => {
    if (currentStepIndex > prevIndexRef.current) {
      setDirection("forward");
    } else if (currentStepIndex < prevIndexRef.current) {
      setDirection("backward");
    }
    prevIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  // track step views
  useEffect(() => {
    if (!currentStep || currentStep.id === prevStepRef.current) return;

    if (prevStepRef.current) {
      const prevIndex = visibleSteps.findIndex((s) => s.id === prevStepRef.current);
      if (prevIndex !== -1 && prevIndex < currentStepIndex) {
        trackStepComplete(prevStepRef.current, prevIndex);
      }
    }

    trackStepView(currentStep.id, currentStepIndex);

    if (currentStep.type === "booking") {
      trackBookingStarted();
    }
    if (currentStep.type === "payment") {
      trackPaymentStarted(pricing.total, "full");
    }

    prevStepRef.current = currentStep.id;
  }, [currentStep?.id, currentStepIndex, visibleSteps, currentStep, pricing.total]);

  useEffect(() => {
    if (booking) {
      trackBookingCompleted(booking.id);
    }
  }, [booking]);

  useEffect(() => {
    if (paymentStatus === "succeeded") {
      trackPaymentCompleted(pricing.total);
    }
  }, [paymentStatus, pricing.total]);

  // auto-advance after booking confirmed
  useEffect(() => {
    if (booking && currentStep?.type === "booking") {
      nextStep();
    }
  }, [booking, currentStep?.type, nextStep]);

  if (!currentStep) return null;

  const isBookingStep = currentStep.type === "booking";
  const isSummaryStep = currentStep.type === "summary";
  const isPaymentStep = currentStep.type === "payment";
  const hidesPricing = isBookingStep || isPaymentStep;

  if (paymentStatus === "succeeded") {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <FinalConfirmation />
      </div>
    );
  }

  const stepLabels = visibleSteps.map((s) =>
    s.title.length > 15 ? s.title.split(" ").slice(0, 2).join(" ") : s.title,
  );

  const showNavButtons = !isPaymentStep;
  const variants = direction === "forward" ? stepForward : stepBackward;

  // swipe handler for mobile
  function handleDragEnd(_: unknown, info: PanInfo) {
    if (isPaymentStep || isBookingStep) return;
    if (info.offset.x < -SWIPE_THRESHOLD && info.velocity.x < -100) {
      nextStep();
    } else if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > 100 && !isFirst) {
      prevStep();
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex justify-center">
        <Stepper
          steps={stepLabels}
          currentStep={currentStepIndex}
          onStepClick={goToStep}
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag={isPaymentStep || isBookingStep ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
              className="touch-pan-y"
            >
              <StepRenderer step={currentStep} />
            </motion.div>
          </AnimatePresence>

          {showNavButtons && (
            <div className="mt-10 flex items-center justify-between">
              <Button variant="ghost" onClick={prevStep} disabled={isFirst}>
                back
              </Button>

              {isBookingStep ? (
                <Button
                  size="lg"
                  onClick={confirmBooking}
                  disabled={!selectedSlot || submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      confirming...
                    </>
                  ) : (
                    <>
                      continue to payment
                      <svg className="ml-2" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </Button>
              ) : isSummaryStep ? (
                <Button size="lg" onClick={nextStep}>
                  schedule installation
                  <svg className="ml-2" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              ) : (
                <Button onClick={nextStep}>continue</Button>
              )}
            </div>
          )}

          {isPaymentStep && (
            <div className="mt-6">
              <Button variant="ghost" onClick={prevStep}>
                back to scheduling
              </Button>
            </div>
          )}
        </div>

        {/* pricing sidebar — desktop */}
        <div className={`hidden lg:w-80 ${hidesPricing ? "" : "lg:block"}`}>
          <div className="sticky top-24">
            <PricingSidebar
              items={pricing.items}
              total={pricing.total}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* pricing — mobile interactive bottom sheet */}
      <div className={`fixed inset-x-0 bottom-0 z-40 ${hidesPricing ? "hidden" : "lg:hidden"}`}>
        <motion.div
          animate={{ height: bottomSheetOpen ? "auto" : "auto" }}
          className="glass-foreground glass-noise relative border-t border-white/20"
        >
          <button
            onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            className="w-full px-4 py-4 sm:px-6"
          >
            <div className="mx-auto flex max-w-lg items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">estimated total</p>
                <AnimatedPrice
                  value={pricing.total}
                  className={`text-xl font-bold text-neutral-900 ${loading ? "opacity-50" : ""}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  {loading
                    ? "calculating..."
                    : `${pricing.items.length} item${pricing.items.length !== 1 ? "s" : ""}`}
                </span>
                <motion.svg
                  animate={{ rotate: bottomSheetOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-neutral-400"
                >
                  <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {bottomSheetOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border-t border-neutral-200/50 px-4 pb-6 pt-3 sm:px-6">
                  <div className="mx-auto max-w-lg space-y-2">
                    {pricing.items.map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-xs text-neutral-500">{item.label}</span>
                        <span className="text-xs font-medium text-neutral-900">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
