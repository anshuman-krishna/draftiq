import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { PredictionService } from "./prediction.service";
import { AbTestService } from "./ab-test.service";
import { AiController } from "./ai.controller";

@Module({
  controllers: [AiController],
  providers: [AiService, PredictionService, AbTestService],
  exports: [AiService, PredictionService, AbTestService],
})
export class AiModule {}
