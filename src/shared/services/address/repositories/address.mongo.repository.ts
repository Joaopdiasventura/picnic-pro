import { InjectModel } from "@nestjs/mongoose";
import { CreateAddressDto } from "../dto/create-address.dto";
import { Address } from "../entities/address.entity";
import { AddressRepository } from "./address.repository";
import { Model } from "mongoose";

export class MongoAddressRepository implements AddressRepository {
  constructor(
    @InjectModel("Address")
    private readonly addressModel: Model<Address>,
  ) {}

  public async create(createAddressDto: CreateAddressDto): Promise<Address> {
    return await this.addressModel.create(createAddressDto);
  }
  public async findByAddressDetails(
    cep: string,
    number: string,
    complement?: string,
  ): Promise<Address> {
    return await this.addressModel.findOne({ cep, number, complement }).exec();
  }
}
