import { Controller, Post, Get, Patch, Body, Param } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { CalculatePriceDto } from "./dto/calculate-price.dto";
import { UpdatePricingRuleDto } from "./dto/update-pricing-rule.dto";

@Controller("pricing")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get("rules")
  async getRules() {
    return this.pricingService.getAllRules();
  }

  @Get("rules/all")
  async getAllRulesAdmin() {
    return this.pricingService.getAllRulesAdmin();
  }

  @Patch("rules/:id")
  async updateRule(@Param("id") id: string, @Body() dto: UpdatePricingRuleDto) {
    return this.pricingService.updateRule(id, dto);
  }

  @Post("calculate")
  async calculate(@Body() dto: CalculatePriceDto) {
    return this.pricingService.calculatePrice(dto.answers);
  }
}
