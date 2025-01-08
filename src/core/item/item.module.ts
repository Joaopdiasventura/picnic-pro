import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema } from './entities/item.entity';
import { ImageModule } from '../../shared/services/image/image.module';
import { MongoItemRepository } from './repositories/item.mongo.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }]),
    ImageModule,
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    { provide: 'ItemRepository', useClass: MongoItemRepository },
  ],
  exports: [ItemService],
})
export class ItemModule {}
