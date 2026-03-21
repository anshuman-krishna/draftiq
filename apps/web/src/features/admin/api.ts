const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `api error: ${response.status}`);
  }

  return response.json();
}

// pricing
export interface PricingRule {
  id: string;
  key: string;
  label: string;
  type: string;
  value: string;
  baseKey: string | null;
  isActive: boolean;
  category: string | null;
  createdAt: string;
}

export function fetchPricingRules(): Promise<PricingRule[]> {
  return fetchApi("/pricing/rules/all");
}

export function updatePricingRule(
  id: string,
  data: Partial<{ label: string; value: number; type: string; isActive: boolean }>,
): Promise<PricingRule> {
  return fetchApi(`/pricing/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// bookings
export interface AdminBooking {
  id: string;
  date: string;
  slot: string;
  status: string;
  quoteId: string | null;
  createdAt: string;
  payments: { id: string; amount: string; status: string }[];
}

export function fetchBookings(): Promise<AdminBooking[]> {
  return fetchApi("/bookings");
}

export function updateBookingStatus(
  id: string,
  status: string,
): Promise<AdminBooking> {
  return fetchApi(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// availability
export interface AdminAvailability {
  id: string;
  date: string;
  totalSlots: number;
  _count: { bookings: number };
}

export function fetchAllAvailability(): Promise<AdminAvailability[]> {
  return fetchApi("/bookings/availability/all");
}

export function updateAvailabilitySlots(
  id: string,
  totalSlots: number,
): Promise<AdminAvailability> {
  return fetchApi(`/bookings/availability/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ totalSlots }),
  });
}

// quotes
export interface AdminQuote {
  id: string;
  status: string;
  totalPrice: string;
  answers: Record<string, unknown> | null;
  breakdown: unknown;
  createdAt: string;
  user: { id: string; email: string; name: string | null } | null;
  booking: { id: string; date: string; slot: string; status: string } | null;
}

export function fetchQuotes(): Promise<AdminQuote[]> {
  return fetchApi("/quotes");
}

// payments
export interface AdminPayment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  stripeId: string | null;
  bookingId: string | null;
  createdAt: string;
  booking: { id: string; date: string; slot: string; status: string } | null;
}

export function fetchPayments(): Promise<AdminPayment[]> {
  return fetchApi("/payments");
}

// integrations
export interface IntegrationConfig {
  id: string;
  provider: string;
  isEnabled: boolean;
  apiKey: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationLog {
  id: string;
  provider: string;
  action: string;
  status: string;
  payload: Record<string, unknown> | null;
  error: string | null;
  entityId: string | null;
  createdAt: string;
}

export function fetchIntegrations(): Promise<IntegrationConfig[]> {
  return fetchApi("/integrations");
}

export function updateIntegration(
  provider: string,
  data: Partial<{ isEnabled: boolean; apiKey: string; metadata: Record<string, unknown> }>,
): Promise<IntegrationConfig> {
  return fetchApi(`/integrations/${provider}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function fetchIntegrationLogs(limit = 50): Promise<IntegrationLog[]> {
  return fetchApi(`/integrations/logs?limit=${limit}`);
}

// analytics
export interface FunnelStep {
  step: string;
  label: string;
  count: number;
  conversionRate: number;
  dropOff: number;
}

export interface RevenueStats {
  totalRevenue: number;
  avgOrderValue: number;
  totalPayments: number;
  conversionRate: number;
  totalSessions: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface AnalyticsEventItem {
  id: string;
  eventType: string;
  metadata: Record<string, unknown>;
  sessionId: string | null;
  createdAt: string;
}

export function fetchFunnelData(days = 30): Promise<FunnelStep[]> {
  return fetchApi(`/analytics/funnel?days=${days}`);
}

export function fetchRevenueStats(days = 30): Promise<RevenueStats> {
  return fetchApi(`/analytics/revenue?days=${days}`);
}

export function fetchDailyRevenue(days = 30): Promise<DailyRevenue[]> {
  return fetchApi(`/analytics/revenue/daily?days=${days}`);
}

export function fetchAnalyticsEvents(limit = 30): Promise<AnalyticsEventItem[]> {
  return fetchApi(`/analytics/events?limit=${limit}`);
}

// ai insights
export interface AdminInsight {
  type: "warning" | "recommendation" | "success";
  title: string;
  description: string;
  metric?: string;
}

export interface DropOffRisk {
  step: string;
  riskLevel: "low" | "medium" | "high";
  dropOffRate: number;
  recommendation: string;
}

export function fetchInsights(days = 30): Promise<AdminInsight[]> {
  return fetchApi(`/ai/insights?days=${days}`);
}

export function fetchDropOffRisks(days = 30): Promise<DropOffRisk[]> {
  return fetchApi(`/ai/drop-off-risks?days=${days}`);
}
