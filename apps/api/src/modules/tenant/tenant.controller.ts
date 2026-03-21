import { Controller, Get, Post, Patch, Param, Body, Req } from "@nestjs/common";
import type { Request } from "express";
import { TenantService } from "./tenant.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async list() {
    return this.tenantService.listTenants();
  }

  @Get("current")
  async getCurrent(@Req() req: Request) {
    if (!req.tenantId) return { tenant: null };
    const tenant = await this.tenantService.findById(req.tenantId);
    return { tenant };
  }

  @Get(":slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Post()
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantService.createTenant(dto);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() data: { name?: string; domain?: string; settings?: Record<string, unknown> },
  ) {
    return this.tenantService.updateTenant(id, data);
  }

  @Get(":id/settings")
  async getSettings(@Param("id") id: string) {
    return this.tenantService.getSettings(id);
  }
}
