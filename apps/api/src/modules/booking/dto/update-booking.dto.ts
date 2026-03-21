import { IsEnum } from "class-validator";

enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
