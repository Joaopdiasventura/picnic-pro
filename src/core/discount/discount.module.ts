import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { MongoDiscountRepository } from './repositories/discount.mongo.repository';
import { ItemModule } from '../item/item.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountSchema } from './entities/discount.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Discount', schema: DiscountSchema }]),
    ItemModule,
  ],
  controllers: [DiscountController],
  providers: [
    DiscountService,
    { provide: 'DiscountRepository', useClass: MongoDiscountRepository },
  ],
  exports: [DiscountService],
})
export class DiscountModule {}
