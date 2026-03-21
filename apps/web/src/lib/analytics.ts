const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// persistent session id for funnel tracking
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("draftiq_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("draftiq_session", sessionId);
  }
  return sessionId;
}

// event queue for batching
let eventQueue: { eventType: string; metadata: Record<string, unknown>; sessionId: string }[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const FLUSH_INTERVAL_MS = 2000;
const FLUSH_MAX_BATCH = 10;

function flushEvents() {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, FLUSH_MAX_BATCH);

  // fire-and-forget — analytics should never block the ui
  for (const event of batch) {
    fetch(`${API_BASE}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      // silently fail
    });
  }

  // if there are remaining events, schedule another flush
  if (eventQueue.length > 0) {
    scheduleFlush();
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, FLUSH_INTERVAL_MS);
}

export function trackEvent(
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  eventQueue.push({
    eventType,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
    },
    sessionId: getSessionId(),
  });

  // flush immediately if batch is full, otherwise schedule
  if (eventQueue.length >= FLUSH_MAX_BATCH) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

// flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushEvents();
    }
  });
}

// convenience helpers
export function trackStepView(stepId: string, stepIndex: number) {
  trackEvent(`step_view:${stepId}`, { stepId, stepIndex });
}

export function trackStepComplete(stepId: string, stepIndex: number) {
  trackEvent(`step_complete:${stepId}`, { stepId, stepIndex });
}

export function trackBookingStarted(metadata?: Record<string, unknown>) {
  trackEvent("booking_started", metadata ?? {});
}

export function trackBookingCompleted(bookingId: string) {
  trackEvent("booking_completed", { bookingId });
}

export function trackPaymentStarted(amount: number, paymentType: string) {
  trackEvent("payment_started", { amount, paymentType });
}

export function trackPaymentCompleted(amount: number) {
  trackEvent("payment_completed", { amount });
}
