import { Min, IsNotEmpty, IsNumber, IsMongoId } from "class-validator";
import { Transform } from "class-transformer";

export class OrderItemDto {
  @IsMongoId({ message: "Escolha um item válido" })
  item: string;

  @Min(1, { message: "A quantidade de itens deve ser pelo menos de 1 unidade" })
  @IsNotEmpty({ message: "Digite uma quantidade válida" })
  @IsNumber({}, { message: "Digite uma quantidade válida" })
  @Transform(
    ({ value }) => (typeof value != "number" ? parseFloat(value) : value),
    { toClassOnly: true },
  )
  quantity: number;
}
