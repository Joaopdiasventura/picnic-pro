import { Test, TestingModule } from "@nestjs/testing";
import { AddressController } from "../address.controller";
import { AddressService } from "../address.service";
import { ValidCepDto } from "../dto/valid-cep.dto";
import { BadRequestException } from "@nestjs/common";

describe("AddressController", () => {
  let controller: AddressController;
  let service: AddressService;

  const mockAddressService = {
    validateCep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        {
          provide: AddressService,
          useValue: mockAddressService,
        },
      ],
    }).compile();

    controller = module.get<AddressController>(AddressController);
    service = module.get<AddressService>(AddressService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("validateCep", () => {
    it("should return valid address details for a valid CEP", async () => {
      const cep = "01001000";
      const validCepDto: ValidCepDto = {
        street: "Praça da Sé",
        city: "São Paulo",
        state: "SP",
      };

      jest.spyOn(service, "validateCep").mockResolvedValue(validCepDto);

      const result = await controller.validateCep(cep);

      expect(result).toEqual(validCepDto);
      expect(service.validateCep).toHaveBeenCalledWith(cep);
    });

    it("should throw a BadRequestException for an invalid CEP", async () => {
      const cep = "00000000";

      jest
        .spyOn(service, "validateCep")
        .mockRejectedValue(new BadRequestException("CEP inválido"));

      await expect(controller.validateCep(cep)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.validateCep).toHaveBeenCalledWith(cep);
    });
  });
});
