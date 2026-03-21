import { IsDateString, IsOptional } from "class-validator";

export class GetAvailabilityDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
