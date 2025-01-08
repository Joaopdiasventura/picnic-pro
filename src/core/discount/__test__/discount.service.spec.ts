import { Test, TestingModule } from "@nestjs/testing";
import { DiscountService } from "../discount.service";
import { DiscountRepository } from "../repositories/discount.repository";
import { ItemService } from "../../item/item.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateDiscountDto } from "../dto/create-discount.dto";
import { UpdateDiscountDto } from "../dto/update-discount.dto";
import { Discount } from "../entities/discount.entity";
import { Item } from "../../item/entities/item.entity";

describe("DiscountService", () => {
  let service: DiscountService;
  let discountRepository: DiscountRepository;
  let itemService: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountService,
        {
          provide: "DiscountRepository",
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findMany: jest.fn(),
            findManyByItem: jest.fn(),
            findAllByItemSorted: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ItemService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DiscountService>(DiscountService);
    discountRepository = module.get<DiscountRepository>("DiscountRepository");
    itemService = module.get<ItemService>(ItemService);
  });

  const mockedDiscount = {
    _id: "id1",
    value: 75,
    rule: "> 95",
    item: "id2",
    lastChange: new Date(),
  } as unknown as Discount;

  const mockedItem = {
    _id: "id2",
    name: "test",
    category: "test",
    pictureUrl: "picture.png",
    price: 100,
    quantity: 1,
  } as unknown as Item;

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a discount", async () => {
      jest.spyOn(itemService, "findById").mockResolvedValue(mockedItem);
      jest
        .spyOn(discountRepository, "create")
        .mockResolvedValue(mockedDiscount);

      const dto: CreateDiscountDto = {
        item: "item1",
        value: 10,
        rule: "> 5",
      };

      const result = await service.create(dto);

      expect(itemService.findById).toHaveBeenCalledWith("item1");
      expect(discountRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: "Desconto adicionado com sucesso" });
    });
  });

  describe("findById", () => {
    it("should return a discount if found", async () => {
      jest
        .spyOn(discountRepository, "findById")
        .mockResolvedValue(mockedDiscount);

      const result = await service.findById("id1");

      expect(discountRepository.findById).toHaveBeenCalledWith("id1");
      expect(result).toEqual(mockedDiscount);
    });

    it("should throw NotFoundException if discount is not found", async () => {
      jest.spyOn(discountRepository, "findById").mockResolvedValue(null);

      await expect(service.findById("id1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("applyDiscount", () => {
    it("should calculate the maximum discount for a valid item and quantity", async () => {
      const discounts = [
        { value: 10, rule: "> 5" },
        { value: 20, rule: "> 10" },
      ] as unknown as Discount[];

      jest.spyOn(itemService, "findById").mockResolvedValue(mockedItem);
      jest
        .spyOn(discountRepository, "findAllByItemSorted")
        .mockResolvedValue(discounts.sort((a, b) => b.value - a.value));

      const result = await service.applyDiscount("item1", 15);

      expect(itemService.findById).toHaveBeenCalledWith("item1");
      expect(discountRepository.findAllByItemSorted).toHaveBeenCalledWith(
        "item1",
      );
      expect(result).toEqual({ value: 20 * 15 });
    });

    it("should throw BadRequestException if quantity is invalid", async () => {
      await expect(service.applyDiscount("item1", 0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("update", () => {
    it("should update a discount", async () => {
      jest
        .spyOn(discountRepository, "findById")
        .mockResolvedValue(mockedDiscount);
      jest
        .spyOn(discountRepository, "update")
        .mockResolvedValue(mockedDiscount);

      const dto = {
        value: 15,
        rule: "> 10",
      } as UpdateDiscountDto;

      const result = await service.update("id1", dto);

      expect(discountRepository.findById).toHaveBeenCalledWith("id1");
      expect(discountRepository.update).toHaveBeenCalledWith("id1", {
        ...dto,
        lastChange: expect.any(Date),
      });
      expect(result).toEqual({ message: "Desconto atualizado com sucesso" });
    });
  });

  describe("delete", () => {
    it("should delete a discount", async () => {
      jest
        .spyOn(discountRepository, "findById")
        .mockResolvedValue(mockedDiscount);

      jest
        .spyOn(discountRepository, "delete")
        .mockResolvedValue(mockedDiscount);

      const result = await service.delete("id1");

      expect(discountRepository.findById).toHaveBeenCalledWith("id1");
      expect(discountRepository.delete).toHaveBeenCalledWith("id1");
      expect(result).toEqual({ message: "Desconto removido com sucesso" });
    });
  });
});
