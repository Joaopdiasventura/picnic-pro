import { UpdateOrderDto } from "./../dto/update-order.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import { Order } from "../entities/order.entity";
import { OrderStatus } from "../../../shared/types/order-status";

export interface OrderRepository {
  create(createOrderDto: CreateOrderDto): Promise<Order>;
  findById(id: string): Promise<Order>;
  findByIdWithDetails(id: string): Promise<Order>;
  findManyByUser(user: string, page: number): Promise<Order[]>;
  findManyByItem(item: string, page: number): Promise<Order[]>;
  update(
    id: string,
    updateOrderDto: UpdateOrderDto | { status: OrderStatus },
  ): Promise<Order>;
  delete(id: string): Promise<Order>;
}
