import { Test, TestingModule } from "@nestjs/testing";
import { AddressService } from "../address.service";
import { AddressRepository } from "../repositories/address.repository";
import { BadRequestException } from "@nestjs/common";

describe("AddressService", () => {
  let service: AddressService;
  let addressRepository: AddressRepository;

  const mockAddressRepository = {
    create: jest.fn(),
    findByAddressDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: "AddressRepository",
          useValue: mockAddressRepository,
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    addressRepository = module.get<AddressRepository>("AddressRepository");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should return an existing address if it already exists", async () => {
      const createAddressDto = {
        cep: "01001000",
        number: "123",
        complement: "Apt 1",
      };
      const existingAddress = {
        id: "1",
        ...createAddressDto,
        street: "Praça da Sé",
        city: "São Paulo",
        state: "SP",
      };

      jest.spyOn(service, "validateCep").mockResolvedValue({
        street: "Praça da Sé",
        city: "São Paulo",
        state: "SP",
      });
      mockAddressRepository.findByAddressDetails.mockResolvedValue(
        existingAddress,
      );

      const result = await service.create(createAddressDto);

      expect(result).toEqual(existingAddress);
      expect(service.validateCep).toHaveBeenCalledWith("01001000");
      expect(addressRepository.findByAddressDetails).toHaveBeenCalledWith(
        "01001000",
        "123",
        "Apt 1",
      );
    });

    it("should create a new address if it does not exist", async () => {
      const createAddressDto = {
        cep: "01001000",
        number: "123",
        complement: "Apt 1",
      };
      const validCep = {
        street: "Praça da Sé",
        city: "São Paulo",
        state: "SP",
      };
      const newAddress = {
        id: "2",
        ...createAddressDto,
        ...validCep,
      };

      jest.spyOn(service, "validateCep").mockResolvedValue(validCep);
      mockAddressRepository.findByAddressDetails.mockResolvedValue(null);
      mockAddressRepository.create.mockResolvedValue(newAddress);

      const result = await service.create(createAddressDto);

      expect(result).toEqual(newAddress);
      expect(service.validateCep).toHaveBeenCalledWith("01001000");
      expect(addressRepository.findByAddressDetails).toHaveBeenCalledWith(
        "01001000",
        "123",
        "Apt 1",
      );
      expect(addressRepository.create).toHaveBeenCalledWith({
        ...createAddressDto,
        ...validCep,
      });
    });
  });

  describe("validateCep", () => {
    it("should return a ValidCepDto when the CEP is valid", async () => {
      const cep = "01001000";
      const validCep = {
        logradouro: "Praça da Sé",
        localidade: "São Paulo",
        estado: "SP",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(validCep),
      });

      const result = await service.validateCep(cep);

      expect(result).toEqual({
        street: "Praça da Sé",
        city: "São Paulo",
        state: "SP",
      });
      expect(global.fetch).toHaveBeenCalledWith(
        `https://viacep.com.br/ws/${cep}/json/`,
      );
    });

    it("should throw a BadRequestException when the CEP is invalid", async () => {
      const cep = "00000000";

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      });

      await expect(service.validateCep(cep)).rejects.toThrow(
        BadRequestException,
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `https://viacep.com.br/ws/${cep}/json/`,
      );
    });
  });
});
