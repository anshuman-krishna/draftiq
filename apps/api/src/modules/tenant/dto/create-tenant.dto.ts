import { IsString, IsNotEmpty, IsOptional, IsObject, Matches } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase alphanumeric with hyphens" })
  slug!: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
