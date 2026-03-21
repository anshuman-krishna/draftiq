import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  CrmProvider,
  CrmContactData,
  CrmUpdateData,
  CrmDealData,
  CrmResult,
} from "../crm.types";

@Injectable()
export class GhlProvider implements CrmProvider {
  readonly name = "ghl";
  private readonly logger = new Logger(GhlProvider.name);
  private readonly apiKey: string;
  private readonly locationId: string;
  private readonly baseUrl = "https://services.leadconnectorhq.com";

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>("GHL_API_KEY") ?? "";
    this.locationId = this.config.get<string>("GHL_LOCATION_ID") ?? "";
  }

  async createContact(data: CrmContactData): Promise<CrmResult> {
    const body = {
      email: data.email,
      name: data.name ?? "",
      phone: data.phone ?? "",
      locationId: this.locationId,
      tags: data.properties?.tags?.split(",") ?? ["draftiq"],
      customFields: data.properties
        ? Object.entries(data.properties)
            .filter(([key]) => key !== "tags")
            .map(([key, value]) => ({ key, value }))
        : [],
    };

    const response = await this.request("/contacts/", "POST", body);

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`ghl create contact failed: ${error}`);
      return { success: false, error };
    }

    const result = (await response.json()) as { contact?: { id: string } };
    return { success: true, externalId: result.contact?.id };
  }

  async updateContact(data: CrmUpdateData): Promise<CrmResult> {
    const body: Record<string, unknown> = {};

    if (data.properties.name) body.name = data.properties.name;
    if (data.properties.email) body.email = data.properties.email;
    if (data.properties.phone) body.phone = data.properties.phone;
    if (data.tags) body.tags = data.tags;

    const response = await this.request(
      `/contacts/${data.contactId}`,
      "PUT",
      body,
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`ghl update contact failed: ${error}`);
      return { success: false, error };
    }

    return { success: true, externalId: data.contactId };
  }

  async createDeal(data: CrmDealData): Promise<CrmResult> {
    const body = {
      title: data.title,
      monetaryValue: data.amount,
      contactId: data.contactId,
      locationId: this.locationId,
      status: "open",
      stageId: data.stage ?? undefined,
    };

    const response = await this.request("/opportunities/", "POST", body);

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`ghl create opportunity failed: ${error}`);
      return { success: false, error };
    }

    const result = (await response.json()) as { opportunity?: { id: string } };
    return { success: true, externalId: result.opportunity?.id };
  }

  async updateDeal(
    dealId: string,
    properties: Record<string, string>,
  ): Promise<CrmResult> {
    const body: Record<string, unknown> = {};

    if (properties.status) body.status = properties.status;
    if (properties.stageId) body.stageId = properties.stageId;
    if (properties.monetaryValue)
      body.monetaryValue = parseFloat(properties.monetaryValue);

    const response = await this.request(
      `/opportunities/${dealId}`,
      "PUT",
      body,
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`ghl update opportunity failed: ${error}`);
      return { success: false, error };
    }

    return { success: true, externalId: dealId };
  }

  private async request(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        Version: "2021-07-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
