import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";
import { CreateAddressDto } from "../../../shared/services/address/dto/create-address.dto";

export class CreateOrderDto extends CreateAddressDto {
  @IsOptional()
  @IsString({
    message: "Você precisa ser um usuário válido para criar um pedido",
  })
  obs?: string;

  @IsMongoId({
    message: "Você precisa ser um usuário válido para criar um pedido",
  })
  user: string;

  @IsArray({ message: "O campo 'items' deve ser um array" })
  @IsNotEmpty({ message: "O pedido precisa ter pelo menos um item" })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  totalAmount: number;

  address: string;
}
