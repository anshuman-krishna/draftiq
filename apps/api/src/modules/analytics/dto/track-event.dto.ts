import { IsString, IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsObject()
  metadata!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
