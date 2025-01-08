import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isManager: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
