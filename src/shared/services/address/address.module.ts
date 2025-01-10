import { Module } from "@nestjs/common";
import { AddressService } from "./address.service";
import { AddressController } from "./address.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { AddressSchema } from "./entities/address.entity";
import { MongoAddressRepository } from "./repositories/address.mongo.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Address", schema: AddressSchema }]),
  ],
  controllers: [AddressController],
  providers: [
    AddressService,
    { provide: "AddressRepository", useClass: MongoAddressRepository },
  ],
  exports: [AddressService],
})
export class AddressModule {}
