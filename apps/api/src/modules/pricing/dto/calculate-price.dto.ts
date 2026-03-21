import { IsObject, IsNotEmpty } from "class-validator";

export class CalculatePriceDto {
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, string | string[]>;
}
