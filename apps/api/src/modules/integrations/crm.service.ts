import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { HubspotProvider } from "./providers/hubspot.provider";
import { GhlProvider } from "./providers/ghl.provider";
import type { CrmProvider, CrmContactData, CrmUpdateData, CrmDealData, CrmResult } from "./crm.types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  private readonly providers: Map<string, CrmProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hubspot: HubspotProvider,
    private readonly ghl: GhlProvider,
  ) {
    this.providers = new Map<string, CrmProvider>();
    this.providers.set("hubspot", this.hubspot);
    this.providers.set("ghl", this.ghl);
  }

  // get all enabled providers from db config
  private async getEnabledProviders(): Promise<CrmProvider[]> {
    const configs = await this.prisma.integrationConfig.findMany({
      where: { isEnabled: true },
    });

    return configs
      .map((c) => this.providers.get(c.provider))
      .filter((p): p is CrmProvider => !!p);
  }

  // execute an action on all enabled providers
  private async executeOnAll(
    action: string,
    entityId: string | undefined,
    fn: (provider: CrmProvider) => Promise<CrmResult>,
  ): Promise<void> {
    const enabledProviders = await this.getEnabledProviders();

    if (enabledProviders.length === 0) {
      this.logger.debug("no crm providers enabled, skipping");
      return;
    }

    for (const provider of enabledProviders) {
      const result = await this.withRetry(() => fn(provider));
      await this.log(provider.name, action, result, entityId);
    }
  }

  // retry wrapper
  private async withRetry(
    fn: () => Promise<CrmResult>,
    retries = MAX_RETRIES,
  ): Promise<CrmResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await fn();
        if (result.success || attempt === retries) return result;

        this.logger.warn(
          `crm action failed (attempt ${attempt}/${retries}): ${result.error}`,
        );
        await this.delay(RETRY_DELAY_MS * attempt);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`crm action error (attempt ${attempt}/${retries}): ${message}`);
        if (attempt === retries) {
          return { success: false, error: message };
        }
        await this.delay(RETRY_DELAY_MS * attempt);
      }
    }
    return { success: false, error: "max retries reached" };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // log all crm actions to db
  private async log(
    provider: string,
    action: string,
    result: CrmResult,
    entityId?: string,
  ): Promise<void> {
    try {
      await this.prisma.integrationLog.create({
        data: {
          provider,
          action,
          status: result.success ? "success" : "failed",
          payload: result.externalId
            ? { externalId: result.externalId }
            : undefined,
          error: result.error ?? null,
          entityId: entityId ?? null,
        },
      });
    } catch (err) {
      this.logger.error(`failed to log crm action: ${err}`);
    }
  }

  // --- public event methods ---

  async onBookingCreated(data: {
    bookingId: string;
    email?: string;
    name?: string;
    phone?: string;
    quoteTotal?: number;
    bookingDate?: string;
    slot?: string;
  }): Promise<void> {
    if (!data.email) return;

    await this.executeOnAll("create_contact", data.bookingId, (provider) =>
      provider.createContact({
        email: data.email!,
        name: data.name,
        phone: data.phone,
        properties: {
          quote_value: String(data.quoteTotal ?? 0),
          booking_date: data.bookingDate ?? "",
          booking_slot: data.slot ?? "",
          source: "draftiq",
        },
      }),
    );
  }

  async onBookingConfirmed(data: {
    bookingId: string;
    contactId?: string;
    bookingDate?: string;
    slot?: string;
  }): Promise<void> {
    if (!data.contactId) return;

    await this.executeOnAll("update_contact", data.bookingId, (provider) =>
      provider.updateContact({
        contactId: data.contactId!,
        properties: {
          booking_status: "confirmed",
          booking_date: data.bookingDate ?? "",
          booking_slot: data.slot ?? "",
        },
        tags: ["booked", "draftiq-confirmed"],
        stage: "booked",
      }),
    );
  }

  async onPaymentSucceeded(data: {
    bookingId?: string;
    contactId?: string;
    amount: number;
    paymentType?: string;
  }): Promise<void> {
    if (!data.contactId) return;

    await this.executeOnAll("update_contact", data.bookingId, (provider) =>
      provider.updateContact({
        contactId: data.contactId!,
        properties: {
          payment_status: "paid",
          payment_amount: String(data.amount),
          payment_type: data.paymentType ?? "full",
        },
        tags: ["paid", "draftiq-paid"],
        stage: "paid",
      }),
    );
  }

  // --- admin methods ---

  async getIntegrationConfigs() {
    return this.prisma.integrationConfig.findMany({
      orderBy: { provider: "asc" },
    });
  }

  async upsertIntegrationConfig(
    provider: string,
    data: { isEnabled?: boolean; apiKey?: string; metadata?: Record<string, unknown> },
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
    if (data.apiKey !== undefined) updateData.apiKey = data.apiKey;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    return this.prisma.integrationConfig.upsert({
      where: { provider },
      create: {
        provider,
        isEnabled: data.isEnabled ?? false,
        apiKey: data.apiKey ?? null,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      update: updateData,
    });
  }

  async getIntegrationLogs(limit = 50) {
    return this.prisma.integrationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
