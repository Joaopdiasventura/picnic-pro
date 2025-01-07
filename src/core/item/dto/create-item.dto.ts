import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  @IsNotEmpty({ message: 'Digite um nome válido' })
  @IsString({ message: 'Digite um nome válido' })
  name: string;

  @IsNotEmpty({ message: 'Digite uma categoria válida' })
  @IsString({ message: 'Digite uma categoria válida' })
  category: string;

  @IsNotEmpty({ message: 'Digite um preço válido' })
  @IsNumber({}, { message: 'Digite um preço válido' })
  @Min(1, { message: 'Digite um preço maior que R$ 1,00' })
  @Transform(
    ({ value }) => (typeof value != 'number' ? parseFloat(value) : value),
    { toClassOnly: true },
  )
  price: number;

  pictureUrl?: string;
}
