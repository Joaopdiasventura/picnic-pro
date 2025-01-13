import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Message } from "../../shared/interfaces/message";
import { ParseObjectIdPipe } from "../../shared/pipes/parse-object-id.pipe";
import { Order } from "./entities/order.entity";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { ParseStatusPipe } from "../../shared/pipes/parse-status.pipe";
import { OrderStatus } from "../../shared/types/order-status";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto): Promise<Message> {
    return this.orderService.create(createOrderDto);
  }

  @Get(":id")
  findById(@Param("id", ParseObjectIdPipe) id: string): Promise<Order> {
    return this.orderService.findByIdWithDetails(id);
  }

  @Get("findManyByUser/:user/:page")
  findManyByUser(
    @Param("user", ParseObjectIdPipe) user: string,
    @Param("page", ParseIntPipe) page: number,
  ): Promise<Order[]> {
    return this.orderService.findManyByUser(user, page < 0 ? 0 : page);
  }

  @Get("findManyByItem/:item/:page")
  findManyByItem(
    @Param("item", ParseObjectIdPipe) item: string,
    @Param("page", ParseIntPipe) page: number,
  ): Promise<Order[]> {
    return this.orderService.findManyByItem(item, page < 0 ? 0 : page);
  }

  @Patch(":id")
  update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Message> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch("changeStatus/:id/:status")
  changeStatus(
    @Param("id", ParseObjectIdPipe) id: string,
    @Param("status", ParseStatusPipe) status: OrderStatus,
  ): Promise<Message> {
    return this.orderService.changeStatus(id, status);
  }
}
