import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { CRM_EVENTS } from "../integrations/crm.events";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const secretKey = this.config.get<string>("STRIPE_SECRET_KEY");
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(
    amount: number,
    bookingId?: string,
    quoteId?: string,
    paymentType?: "deposit" | "full",
  ) {
    if (amount <= 0) {
      throw new BadRequestException("amount must be greater than zero");
    }

    // convert dollars to cents for stripe
    const amountInCents = Math.round(amount * 100);

    const metadata: Record<string, string> = {};
    if (bookingId) metadata.bookingId = bookingId;
    if (quoteId) metadata.quoteId = quoteId;
    if (paymentType) metadata.paymentType = paymentType;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    // store payment record
    const payment = await this.prisma.payment.create({
      data: {
        amount,
        currency: "usd",
        status: "PENDING",
        stripeId: paymentIntent.id,
        bookingId: bookingId ?? null,
        quoteId: quoteId ?? null,
      },
    });

    return {
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      paymentType: paymentType ?? "full",
    };
  }

  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException("invalid webhook signature");
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: { stripeId: paymentIntent.id },
      data: { status: "SUCCEEDED" },
    });

    // if linked to a booking, confirm the booking
    const bookingId = paymentIntent.metadata?.bookingId;
    if (bookingId) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
    }

    // emit crm event (async, non-blocking)
    this.eventEmitter.emit(CRM_EVENTS.PAYMENT_SUCCEEDED, {
      bookingId: bookingId ?? undefined,
      amount: paymentIntent.amount / 100,
      paymentType: paymentIntent.metadata?.paymentType,
    });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: { stripeId: paymentIntent.id },
      data: { status: "FAILED" },
    });
  }

  async listPayments() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: { select: { id: true, date: true, slot: true, status: true } },
      },
    });
  }

  async getPaymentByBookingId(bookingId: string) {
    return this.prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });
  }
}
