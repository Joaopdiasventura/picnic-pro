import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { ItemModule } from "./item/item.module";
import { DiscountModule } from "./discount/discount.module";
import { OrderModule } from "./order/order.module";

@Module({ imports: [UserModule, ItemModule, DiscountModule, OrderModule] })
export class CoreModule {}
