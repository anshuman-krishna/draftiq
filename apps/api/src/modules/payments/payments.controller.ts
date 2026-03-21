import { Controller, Post, Get, Body, Req, Headers, HttpCode } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { Request } from "express";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async listPayments() {
    return this.paymentsService.listPayments();
  }

  @Post("intent")
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(
      dto.amount,
      dto.bookingId,
      dto.quoteId,
      dto.paymentType,
    );
  }

  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(@Req() req: Request, @Headers("stripe-signature") signature: string) {
    // raw body is set by the express raw middleware in main.ts
    return this.paymentsService.handleWebhookEvent(req.body as Buffer, signature);
  }
}
