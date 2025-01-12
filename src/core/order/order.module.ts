import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderSchema } from "./entities/order.entity";
import { UserModule } from "../user/user.module";
import { ItemModule } from "../item/item.module";
import { DiscountModule } from "../discount/discount.module";
import { AddressModule } from "../../shared/services/address/address.module";
import { MongoOrderRepository } from "./repositories/order.mongo.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Order", schema: OrderSchema }]),
    UserModule,
    ItemModule,
    AddressModule,
    DiscountModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: "OrderRepository", useClass: MongoOrderRepository },
  ],
})
export class OrderModule {}
