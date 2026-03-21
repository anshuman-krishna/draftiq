import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "@prisma/client";

export interface TenantSettings {
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logo?: string;
    businessName?: string;
  };
  industry?: string;
  schemaId?: string;
}

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException(`tenant "${slug}" not found`);
    return tenant;
  }

  async findByDomain(domain: string) {
    return this.prisma.tenant.findUnique({ where: { domain } });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException("tenant not found");
    return tenant;
  }

  async createTenant(data: {
    name: string;
    slug: string;
    domain?: string;
    settings?: TenantSettings;
  }) {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        domain: data.domain ?? null,
        settings: data.settings ? (data.settings as unknown as Prisma.InputJsonValue) : undefined,
      },
    });

    // seed default data for new tenant
    await this.seedTenantDefaults(tenant.id);

    return tenant;
  }

  async updateTenant(
    id: string,
    data: {
      name?: string;
      domain?: string;
      settings?: TenantSettings;
    },
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.domain !== undefined) updateData.domain = data.domain;
    if (data.settings !== undefined)
      updateData.settings = data.settings as unknown as Prisma.InputJsonValue;

    return this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });
  }

  async listTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getSettings(tenantId: string): Promise<TenantSettings> {
    const tenant = await this.findById(tenantId);
    return (tenant.settings as unknown as TenantSettings) ?? {};
  }

  private async seedTenantDefaults(tenantId: string) {
    // seed default integration configs
    const providers = ["hubspot", "ghl"];
    for (const provider of providers) {
      await this.prisma.integrationConfig.create({
        data: {
          tenantId,
          provider: `${tenantId}:${provider}`,
          isEnabled: false,
        },
      });
    }

    // seed default availability (14 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() === 0) continue;

      const totalSlots = date.getDay() === 6 ? 4 : 6;
      await this.prisma.availability.create({
        data: { tenantId, date, totalSlots },
      });
    }
  }
}
