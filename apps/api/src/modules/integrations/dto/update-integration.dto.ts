import { IsBoolean, IsOptional, IsString, IsObject } from "class-validator";

export class UpdateIntegrationDto {
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
