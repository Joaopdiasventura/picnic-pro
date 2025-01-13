import { InjectModel } from "@nestjs/mongoose";
import { CreateOrderDto } from "../dto/create-order.dto";
import { UpdateOrderDto } from "../dto/update-order.dto";
import { Order } from "../entities/order.entity";
import { OrderRepository } from "./order.repository";
import { OrderStatus } from "../../../shared/types/order-status";
import { Model } from "mongoose";

export class MongoOrderRepository implements OrderRepository {
  constructor(
    @InjectModel("Order") private readonly orderModel: Model<Order>,
  ) {}

  public async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.orderModel.create(createOrderDto);
  }

  public async findById(id: string): Promise<Order> {
    return await this.orderModel.findById(id).exec();
  }

  public async findByIdWithDetails(id: string): Promise<Order> {
    return await this.orderModel
      .findById(id)
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "items.item",
        select: "name price pictureUrl",
      })
      .exec();
  }

  public async findManyByUser(user: string, page: number): Promise<Order[]> {
    return await this.orderModel
      .find({ user })
      .skip(page * 10)
      .limit(10)
      .populate({
        path: "items.item",
        select: "name price pictureUrl",
      })
      .exec();
  }

  public async findManyByItem(item: string, page: number): Promise<Order[]> {
    return await this.orderModel
      .find({ "items.item": item })
      .skip(page * 10)
      .limit(10)
      .populate({
        path: "user",
        select: "name email",
      })
      .exec();
  }

  public async update(
    id: string,
    updateOrderDto: UpdateOrderDto | { status: OrderStatus },
  ): Promise<Order> {
    return await this.orderModel.findByIdAndUpdate(id, updateOrderDto);
  }

  public async delete(id: string): Promise<Order> {
    return await this.orderModel.findByIdAndDelete(id);
  }
}
