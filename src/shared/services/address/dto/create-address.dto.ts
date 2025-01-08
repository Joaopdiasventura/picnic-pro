import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ValidCepDto } from "./valid-cep.dto";

export class CreateAddressDto extends PartialType(ValidCepDto) {
  @IsNotEmpty({ message: "Digite um CEP válido" })
  @IsString({ message: "Digite um CEP válido" })
  cep: string;

  @IsNotEmpty({ message: "Digite um número válido" })
  @IsString({ message: "Digite um número válido" })
  number: string;

  @IsOptional()
  @IsString({ message: "Digite um complemento válido" })
  complement?: string;
}
