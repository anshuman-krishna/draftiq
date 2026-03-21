import { Controller, Post, Get, Body, Query } from "@nestjs/common";
import { AiService } from "./ai.service";
import { PredictionService } from "./prediction.service";
import { AbTestService } from "./ab-test.service";
import { AiRequestDto } from "./dto/ai-request.dto";

@Controller("ai")
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly predictionService: PredictionService,
    private readonly abTestService: AbTestService,
  ) {}

  @Post("recommend")
  async recommend(@Body() dto: AiRequestDto) {
    const result = await this.aiService.recommendPackage(
      dto.answers,
      dto.breakdown,
    );
    return result ?? { error: "ai unavailable" };
  }

  @Post("explain")
  async explain(@Body() dto: AiRequestDto) {
    const result = await this.aiService.explainPricing(dto.breakdown);
    return result ?? { error: "ai unavailable" };
  }

  @Post("upsell")
  async upsell(@Body() dto: AiRequestDto) {
    const result = await this.aiService.suggestUpsells(
      dto.answers,
      dto.breakdown,
    );
    return result ?? { error: "ai unavailable" };
  }

  @Get("predict")
  async predictConversion(@Query("sessionId") sessionId: string) {
    if (!sessionId) return { error: "sessionId required" };
    return this.predictionService.predictConversion(sessionId);
  }

  @Get("drop-off-risks")
  async getDropOffRisks(@Query("days") days?: string) {
    return this.predictionService.detectDropOffRisks(
      days ? parseInt(days) : undefined,
    );
  }

  @Get("insights")
  async getInsights(@Query("days") days?: string) {
    return this.predictionService.generateInsights(
      days ? parseInt(days) : undefined,
    );
  }

  @Post("ab/assign")
  async assignVariant(
    @Body() body: { testId: string; sessionId: string; variants: { id: string; weight: number }[] },
  ) {
    const variant = this.abTestService.assignVariant(
      body.testId,
      body.sessionId,
      body.variants,
    );
    await this.abTestService.trackImpression(body.testId, variant, body.sessionId);
    return { variant };
  }

  @Post("ab/convert")
  async trackConversion(
    @Body() body: { testId: string; variant: string; sessionId: string },
  ) {
    await this.abTestService.trackConversion(body.testId, body.variant, body.sessionId);
    return { tracked: true };
  }

  @Get("ab/results")
  async getAbResults(
    @Query("testId") testId: string,
    @Query("days") days?: string,
  ) {
    if (!testId) return { error: "testId required" };
    return this.abTestService.getResults(testId, days ? parseInt(days) : undefined);
  }
}
