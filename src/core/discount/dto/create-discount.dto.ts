import { IsMongoId, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { Transform } from "class-transformer";
import {
  DiscountRule,
  IsDiscountRule,
} from "../../../shared/types/discount-rules";

export class CreateDiscountDto {
  @IsNotEmpty({ message: "Digite uma regra válida" })
  @IsDiscountRule()
  rule: DiscountRule;

  @Min(1, { message: "O valor deve ser no mínimo 1" })
  @Max(99, { message: "O valor deve ser no máximo 99" })
  @IsNotEmpty({ message: "Digite um valor válido" })
  @IsNumber({}, { message: "Digite um valor válido" })
  @Transform(
    ({ value }) => (typeof value != "number" ? parseFloat(value) : value),
    { toClassOnly: true },
  )
  value: number;

  @IsNotEmpty({ message: "Escolha um item" })
  @IsMongoId({ message: "Escolha um item válido" })
  item: string;
}
