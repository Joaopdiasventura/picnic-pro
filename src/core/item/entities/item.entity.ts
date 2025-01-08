import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false })
export class Item extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  pictureUrl: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
