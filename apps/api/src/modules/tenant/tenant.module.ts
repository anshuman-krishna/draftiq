import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { TenantController } from "./tenant.controller";
import { TenantMiddleware } from "./tenant.middleware";

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
