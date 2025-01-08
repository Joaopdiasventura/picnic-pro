import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
  @IsNotEmpty({ message: "Digite um email" })
  @IsEmail({}, { message: "Digite um email válido" })
  email: string;

  @IsNotEmpty({ message: "Digite uma senha" })
  @IsString({ message: "Digite uma senha válida" })
  password: string;
}
