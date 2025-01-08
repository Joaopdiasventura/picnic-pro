import { IsNotEmpty } from "class-validator";

export class ValidCepDto {
  @IsNotEmpty({ message: "Digite uma rua válida" })
  @IsNotEmpty({ message: "Digite uma rua válida" })
  street: string;

  @IsNotEmpty({ message: "Digite uma cidade válida" })
  @IsNotEmpty({ message: "Digite uma cidade válida" })
  city: string;

  @IsNotEmpty({ message: "Digite um estado válido" })
  @IsNotEmpty({ message: "Digite um estado válido" })
  state: string;
}
