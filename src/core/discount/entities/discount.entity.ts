import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DiscountRule } from '../../../shared/types/discount-rules';
import { Item } from '../../item/entities/item.entity';

@Schema({ versionKey: false })
export class Discount extends Document {
  @Prop({ required: true })
  value: number;

  @Prop({ default: () => new Date() })
  lastChange: Date;

  @Prop({ required: true })
  rule: DiscountRule;

  @Prop({ required: true, type: String, ref: 'Item' })
  item: string | Item;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
