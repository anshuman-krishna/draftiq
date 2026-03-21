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
export class HubspotProvider implements CrmProvider {
  readonly name = "hubspot";
  private readonly logger = new Logger(HubspotProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.hubapi.com";

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>("HUBSPOT_API_KEY") ?? "";
  }

  async createContact(data: CrmContactData): Promise<CrmResult> {
    const body = {
      properties: {
        email: data.email,
        firstname: data.name?.split(" ")[0] ?? "",
        lastname: data.name?.split(" ").slice(1).join(" ") ?? "",
        phone: data.phone ?? "",
        ...data.properties,
      },
    };

    const response = await this.request("/crm/v3/objects/contacts", "POST", body);

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`hubspot create contact failed: ${error}`);
      return { success: false, error };
    }

    const result = (await response.json()) as { id: string };
    return { success: true, externalId: result.id };
  }

  async updateContact(data: CrmUpdateData): Promise<CrmResult> {
    const body = { properties: data.properties };

    const response = await this.request(
      `/crm/v3/objects/contacts/${data.contactId}`,
      "PATCH",
      body,
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`hubspot update contact failed: ${error}`);
      return { success: false, error };
    }

    return { success: true, externalId: data.contactId };
  }

  async createDeal(data: CrmDealData): Promise<CrmResult> {
    const body = {
      properties: {
        dealname: data.title,
        amount: String(data.amount),
        dealstage: data.stage ?? "appointmentscheduled",
        ...data.properties,
      },
      associations: [
        {
          to: { id: data.contactId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
        },
      ],
    };

    const response = await this.request("/crm/v3/objects/deals", "POST", body);

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`hubspot create deal failed: ${error}`);
      return { success: false, error };
    }

    const result = (await response.json()) as { id: string };
    return { success: true, externalId: result.id };
  }

  async updateDeal(dealId: string, properties: Record<string, string>): Promise<CrmResult> {
    const response = await this.request(`/crm/v3/objects/deals/${dealId}`, "PATCH", { properties });

    if (!response.ok) {
      const error = await response.text();
      this.logger.warn(`hubspot update deal failed: ${error}`);
      return { success: false, error };
    }

    return { success: true, externalId: dealId };
  }

  private async request(path: string, method: string, body?: unknown): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
