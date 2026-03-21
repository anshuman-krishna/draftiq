// shared types for all crm providers

export interface CrmContactData {
  email: string;
  name?: string;
  phone?: string;
  properties?: Record<string, string>;
}

export interface CrmDealData {
  contactId: string;
  title: string;
  amount: number;
  stage?: string;
  properties?: Record<string, string>;
}

export interface CrmUpdateData {
  contactId: string;
  properties: Record<string, string>;
  tags?: string[];
  stage?: string;
}

export interface CrmResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

// provider interface — every crm provider must implement this
export interface CrmProvider {
  readonly name: string;

  createContact(data: CrmContactData): Promise<CrmResult>;
  updateContact(data: CrmUpdateData): Promise<CrmResult>;
  createDeal(data: CrmDealData): Promise<CrmResult>;
  updateDeal(dealId: string, properties: Record<string, string>): Promise<CrmResult>;
}
