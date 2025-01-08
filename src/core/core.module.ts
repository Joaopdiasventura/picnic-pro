import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { ItemModule } from "./item/item.module";
import { DiscountModule } from "./discount/discount.module";

@Module({ imports: [UserModule, ItemModule, DiscountModule] })
export class CoreModule {}
