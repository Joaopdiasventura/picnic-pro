import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Digite um email" })
  @IsEmail({}, { message: "Digite um email válido" })
  email: string;

  @IsNotEmpty({ message: "Digite um nome" })
  @IsString({ message: "Digite um nome válido" })
  name: string;

  @IsNotEmpty({ message: "Digite uma senha" })
  @IsString({ message: "Digite uma senha válida" })
  password: string;
}
