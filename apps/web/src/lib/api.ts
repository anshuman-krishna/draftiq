const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface PriceLineItem {
  label: string;
  price: number;
}

interface PriceBreakdown {
  items: PriceLineItem[];
  total: number;
}

export async function calculatePriceRemote(
  answers: Record<string, string | string[]>,
): Promise<PriceBreakdown> {
  const response = await fetch(`${API_BASE}/pricing/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error(`pricing api error: ${response.status}`);
  }

  return response.json();
}

// booking types

export interface SlotInfo {
  time: string;
  remaining: number;
  label: "available" | "limited" | "last slot" | "full";
}

export interface DayAvailability {
  date: string;
  totalSlots: number;
  bookedCount: number;
  slots: SlotInfo[];
}

export interface BookingResponse {
  id: string;
  date: string;
  slot: string;
  status: string;
}

export async function fetchAvailability(
  startDate: string,
  endDate?: string,
): Promise<DayAvailability[]> {
  const params = new URLSearchParams({ startDate });
  if (endDate) params.set("endDate", endDate);

  const response = await fetch(`${API_BASE}/bookings/availability?${params}`);

  if (!response.ok) {
    throw new Error(`availability api error: ${response.status}`);
  }

  return response.json();
}

// payment types

export interface PaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
  amount: number;
  paymentType: "deposit" | "full";
}

export async function createPaymentIntent(
  amount: number,
  bookingId?: string,
  quoteId?: string,
  paymentType?: "deposit" | "full",
): Promise<PaymentIntentResponse> {
  const response = await fetch(`${API_BASE}/payments/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, bookingId, quoteId, paymentType }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `payment api error: ${response.status}`);
  }

  return response.json();
}

export async function createBooking(
  date: string,
  slot: string,
  quoteId?: string,
): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, slot, quoteId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `booking api error: ${response.status}`);
  }

  return response.json();
}
