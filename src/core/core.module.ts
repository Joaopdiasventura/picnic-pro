import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';

@Module({ imports: [UserModule, ItemModule] })
export class CoreModule {}
