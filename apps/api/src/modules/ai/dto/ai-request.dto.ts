import { IsObject, IsNotEmpty } from "class-validator";

export class AiRequestDto {
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, string | string[]>;

  @IsObject()
  @IsNotEmpty()
  breakdown!: {
    items: { label: string; price: number }[];
    total: number;
  };
}
