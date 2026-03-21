import { IsInt, Min } from "class-validator";

export class UpdateAvailabilityDto {
  @IsInt()
  @Min(0)
  totalSlots!: number;
}
