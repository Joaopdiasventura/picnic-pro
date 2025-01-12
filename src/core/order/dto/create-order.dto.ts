import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderItemDto } from "./order-item.dto";
import { CreateAddressDto } from "../../../shared/services/address/dto/create-address.dto";
import { Address } from "../../../shared/services/address/entities/address.entity";

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

  @IsNotEmpty({ message: "Digite uma data válida para a entrega do pedido" })
  @IsDate({ message: "Digite uma data válida para a entrega do pedido" })
  @Type(() => Date)
  conclusionDate: Date;

  @IsArray({ message: "O campo 'items' deve ser um array" })
  @IsNotEmpty({ message: "O pedido precisa ter pelo menos um item" })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  totalAmount: number;

  address: Address;
}
