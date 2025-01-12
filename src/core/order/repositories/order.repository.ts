import { UpdateOrderDto } from "./../dto/update-order.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import { Order } from "../entities/order.entity";

export interface OrderRepository {
  create(createOrderDto: CreateOrderDto): Promise<Order>;
  findById(id: string): Promise<Order>;
  findManyByUser(user: string, page: number): Promise<Order[]>;
  update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
  delete(id: string): Promise<Order>;
}
