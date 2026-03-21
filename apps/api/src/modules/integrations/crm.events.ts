// event names
export const CRM_EVENTS = {
  BOOKING_CREATED: "crm.booking.created",
  BOOKING_CONFIRMED: "crm.booking.confirmed",
  PAYMENT_SUCCEEDED: "crm.payment.succeeded",
} as const;

// event payloads
export interface BookingCreatedEvent {
  bookingId: string;
  email?: string;
  name?: string;
  phone?: string;
  quoteTotal?: number;
  bookingDate?: string;
  slot?: string;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  contactId?: string;
  bookingDate?: string;
  slot?: string;
}

export interface PaymentSucceededEvent {
  bookingId?: string;
  contactId?: string;
  amount: number;
  paymentType?: string;
}
