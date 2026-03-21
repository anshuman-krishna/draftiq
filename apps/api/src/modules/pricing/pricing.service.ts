import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Decimal } from "@prisma/client/runtime/library";

interface PriceLineItem {
  label: string;
  price: number;
}

interface PriceBreakdown {
  items: PriceLineItem[];
  total: number;
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRules() {
    return this.prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
  }

  async getAllRulesAdmin() {
    return this.prisma.pricingRule.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
  }

  async updateRule(
    id: string,
    data: { label?: string; value?: number; type?: string; isActive?: boolean; category?: string },
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.value !== undefined) updateData.value = new Decimal(data.value);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.category !== undefined) updateData.category = data.category;

    return this.prisma.pricingRule.update({
      where: { id },
      data: updateData,
    });
  }

  async calculatePrice(answers: Record<string, string | string[]>): Promise<PriceBreakdown> {
    // collect all pricing keys from answers
    const pricingKeys = this.resolvePricingKeys(answers);

    if (pricingKeys.length === 0) {
      return { items: [], total: 0 };
    }

    // fetch matching rules from database in a single query
    const rules = await this.prisma.pricingRule.findMany({
      where: {
        key: { in: pricingKeys },
        isActive: true,
      },
    });

    // build a lookup map for percentage base resolution
    const ruleMap = new Map(rules.map((r) => [r.key, r]));

    const items: PriceLineItem[] = [];
    let total = 0;

    for (const rule of rules) {
      let amount = 0;

      if (rule.type === "FIXED") {
        amount = this.toNumber(rule.value);
      } else if (rule.type === "PERCENTAGE" && rule.baseKey) {
        const baseRule = ruleMap.get(rule.baseKey);
        if (baseRule) {
          amount = this.toNumber(baseRule.value) * (this.toNumber(rule.value) / 100);
        }
      } else if (rule.type === "PER_UNIT") {
        amount = this.toNumber(rule.value);
      }

      if (amount > 0) {
        items.push({ label: rule.label, price: amount });
      }
      total += amount;
    }

    return { items, total: Math.round(total * 100) / 100 };
  }

  // maps configurator answers to pricing rule keys
  // keys follow the format "category:option" (e.g., "base:large", "addon:thermostat")
  private resolvePricingKeys(answers: Record<string, string | string[]>): string[] {
    const keys: string[] = [];

    // mapping from step ids to pricing key prefixes
    const stepKeyMap: Record<string, string> = {
      "home-size": "base",
      "system-type": "system",
      "duct-condition": "duct",
      "add-ons": "addon",
    };

    for (const [stepId, answer] of Object.entries(answers)) {
      const prefix = stepKeyMap[stepId];
      if (!prefix) continue;

      if (typeof answer === "string" && answer) {
        keys.push(`${prefix}:${answer}`);
      } else if (Array.isArray(answer)) {
        for (const value of answer) {
          if (value) keys.push(`${prefix}:${value}`);
        }
      }
    }

    return keys;
  }

  private toNumber(value: Decimal): number {
    return Number(value);
  }
}
