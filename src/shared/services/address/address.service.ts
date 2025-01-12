import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateAddressDto } from "./dto/create-address.dto";
import { ViaCepResponse } from "../../interfaces/viaCepResponse";
import { ValidCepDto } from "./dto/valid-cep.dto";
import { Address } from "./entities/address.entity";
import { AddressRepository } from "./repositories/address.repository";

@Injectable()
export class AddressService {
  constructor(
    @Inject("AddressRepository")
    private readonly addressRepository: AddressRepository,
  ) {}

  public async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const validCep = await this.validateCep(createAddressDto.cep);
    const completeAddress = { ...createAddressDto, ...validCep };

    const existingAddress = await this.addressRepository.findByAddressDetails(
      completeAddress.cep,
      completeAddress.number,
      completeAddress.complement,
    );

    if (existingAddress) return existingAddress;

    return this.addressRepository.create(completeAddress);
  }

  public async validateCep(cep: string): Promise<ValidCepDto> {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error();

      const result: ViaCepResponse = await response.json();

      if ("erro" in result) throw new Error();

      return {
        street: result.logradouro,
        city: result.localidade,
        state: result.estado,
      };
    } catch {
      throw new BadRequestException("CEP inválido");
    }
  }
}
