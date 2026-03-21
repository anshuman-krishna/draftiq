import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from "class-validator";

enum PricingRuleType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
  PER_UNIT = "PER_UNIT",
}

export class UpdatePricingRuleDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsEnum(PricingRuleType)
  @IsOptional()
  type?: PricingRuleType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
}
