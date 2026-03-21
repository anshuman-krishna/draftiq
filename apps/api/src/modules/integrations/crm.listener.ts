import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CrmService } from "./crm.service";
import {
  CRM_EVENTS,
  type BookingCreatedEvent,
  type BookingConfirmedEvent,
  type PaymentSucceededEvent,
} from "./crm.events";

@Injectable()
export class CrmListener {
  private readonly logger = new Logger(CrmListener.name);

  constructor(private readonly crmService: CrmService) {}

  @OnEvent(CRM_EVENTS.BOOKING_CREATED, { async: true })
  async handleBookingCreated(event: BookingCreatedEvent) {
    this.logger.log(`booking created event: ${event.bookingId}`);
    await this.crmService.onBookingCreated(event);
  }

  @OnEvent(CRM_EVENTS.BOOKING_CONFIRMED, { async: true })
  async handleBookingConfirmed(event: BookingConfirmedEvent) {
    this.logger.log(`booking confirmed event: ${event.bookingId}`);
    await this.crmService.onBookingConfirmed(event);
  }

  @OnEvent(CRM_EVENTS.PAYMENT_SUCCEEDED, { async: true })
  async handlePaymentSucceeded(event: PaymentSucceededEvent) {
    this.logger.log(`payment succeeded event: booking=${event.bookingId}`);
    await this.crmService.onPaymentSucceeded(event);
  }
}
