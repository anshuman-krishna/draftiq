import { IsNumber, IsOptional, IsUUID, IsString, Min } from "class-validator";

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @IsUUID()
  @IsOptional()
  quoteId?: string;

  @IsString()
  @IsOptional()
  paymentType?: "deposit" | "full";
}
