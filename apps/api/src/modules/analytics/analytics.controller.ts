import { Controller, Post, Get, Body, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { TrackEventDto } from "./dto/track-event.dto";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("event")
  async trackEvent(@Body() dto: TrackEventDto) {
    await this.analyticsService.trackEvent(dto.eventType, dto.metadata, dto.sessionId);
    return { tracked: true };
  }

  @Get("funnel")
  async getFunnel(@Query("days") days?: string) {
    return this.analyticsService.getFunnelData(days ? parseInt(days) : undefined);
  }

  @Get("revenue")
  async getRevenue(@Query("days") days?: string) {
    return this.analyticsService.getRevenueStats(days ? parseInt(days) : undefined);
  }

  @Get("revenue/daily")
  async getDailyRevenue(@Query("days") days?: string) {
    return this.analyticsService.getDailyRevenue(days ? parseInt(days) : undefined);
  }

  @Get("events")
  async getRecentEvents(@Query("limit") limit?: string) {
    return this.analyticsService.getRecentEvents(limit ? parseInt(limit) : undefined);
  }
}
