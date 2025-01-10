import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false })
export class Address extends Document {
  @Prop({ required: true })
  cep: string;

  @Prop({ required: true })
  number: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: false })
  complement?: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
