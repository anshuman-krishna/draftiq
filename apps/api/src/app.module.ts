import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PrismaModule } from "./prisma/prisma.module";
import { PricingModule } from "./modules/pricing/pricing.module";
import { BookingModule } from "./modules/booking/booking.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { QuotesModule } from "./modules/quotes/quotes.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { AiModule } from "./modules/ai/ai.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { TenantModule } from "./modules/tenant/tenant.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    TenantModule,
    PricingModule,
    BookingModule,
    PaymentsModule,
    QuotesModule,
    IntegrationsModule,
    AiModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
