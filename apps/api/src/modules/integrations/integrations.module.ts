import { Module } from "@nestjs/common";
import { IntegrationsController } from "./integrations.controller";
import { CrmService } from "./crm.service";
import { CrmListener } from "./crm.listener";
import { HubspotProvider } from "./providers/hubspot.provider";
import { GhlProvider } from "./providers/ghl.provider";

@Module({
  controllers: [IntegrationsController],
  providers: [CrmService, CrmListener, HubspotProvider, GhlProvider],
  exports: [CrmService],
})
export class IntegrationsModule {}
