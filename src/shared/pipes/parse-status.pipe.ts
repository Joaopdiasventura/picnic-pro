import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { OrderStatus } from "../types/order-status";

@Injectable()
export class ParseStatusPipe implements PipeTransform<string, OrderStatus> {
  private readonly validStatuses: OrderStatus[] = [
    "pending",
    "cancelled",
    "rejected",
    "preparing",
    "completed",
  ];

  transform(value: OrderStatus): OrderStatus {
    if (!this.validStatuses.includes(value as OrderStatus))
      throw new BadRequestException(`Status inválido: ${value}`);
    return value;
  }
}
