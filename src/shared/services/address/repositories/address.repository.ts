import { Address } from "../entities/address.entity";
import { CreateAddressDto } from "./../dto/create-address.dto";

export interface AddressRepository {
  create(createAddressDto: CreateAddressDto): Promise<Address>;
  findByAddressDetails(
    cep: string,
    number: string,
    complement?: string,
  ): Promise<Address>;
}
