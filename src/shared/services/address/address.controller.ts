import { Controller, Get, Param } from "@nestjs/common";
import { AddressService } from "./address.service";
import { ValidCepDto } from "./dto/valid-cep.dto";

@Controller("address")
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get("validateCep/:cep")
  public validateCep(@Param("cep") cep: string): Promise<ValidCepDto> {
    return this.addressService.validateCep(cep);
  }
}
