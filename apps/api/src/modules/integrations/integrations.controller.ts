import { Controller, Get, Patch, Param, Body, Query } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { UpdateIntegrationDto } from "./dto/update-integration.dto";

@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly crmService: CrmService) {}

  @Get()
  async getConfigs() {
    return this.crmService.getIntegrationConfigs();
  }

  @Patch(":provider")
  async updateConfig(
    @Param("provider") provider: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.crmService.upsertIntegrationConfig(provider, dto);
  }

  @Get("logs")
  async getLogs(@Query("limit") limit?: string) {
    return this.crmService.getIntegrationLogs(
      limit ? parseInt(limit) : undefined,
    );
  }
}
