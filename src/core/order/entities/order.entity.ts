import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User } from "../../user/entities/user.entity";
import { Address } from "../../../shared/services/address/entities/address.entity";
import { OrderStatus } from "../../../shared/types/order-status";
import { OrderItem } from "../../../shared/interfaces/orderItem";

@Schema({ versionKey: false })
export class Order extends Document {
  @Prop({ default: "pending" })
  status: OrderStatus;

  @Prop({ required: false })
  obs?: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  conclusionDate: Date;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ required: true, type: String, ref: "User" })
  user: string | User;

  @Prop({ required: true, type: String, ref: "Address" })
  address: string | Address;

  @Prop({
    _id: false,
    required: true,
    type: [
      {
        item: { type: String, required: true, ref: "Item" },
        quantity: { type: Number, required: true },
      },
    ],
  })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
