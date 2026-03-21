import { IsDateString, IsString, IsOptional, IsUUID } from "class-validator";

export class CreateBookingDto {
  @IsDateString()
  date!: string;

  @IsString()
  slot!: string;

  @IsUUID()
  @IsOptional()
  quoteId?: string;
}
