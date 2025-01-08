import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsOptional()
  @IsBoolean({ message: 'O campo de disponível só pode ser sim ou não' })
  avaliable?: boolean;
}
