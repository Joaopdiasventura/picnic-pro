import { Test, TestingModule } from "@nestjs/testing";
import { DiscountController } from "../discount.controller";
import { DiscountService } from "../discount.service";
import { CreateDiscountDto } from "../dto/create-discount.dto";
import { UpdateDiscountDto } from "../dto/update-discount.dto";
import { Discount } from "../entities/discount.entity";
import { DiscountReturn } from "../../../shared/interfaces/discountReturn";
import { Message } from "../../../shared/interfaces/message";
import { NotFoundException } from "@nestjs/common";

describe("DiscountController", () => {
  let controller: DiscountController;
  let service: DiscountService;

  const mockedDiscount = {
    _id: "id1",
    value: 75,
    rule: "> 95",
    item: "id2",
    lastChange: new Date(),
  } as unknown as Discount;

  const mockMessage: Message = { message: "Sucesso" };

  const mockDiscountReturn: DiscountReturn = {
    value: 20 * 15 - (mockedDiscount.value * 20) / 100 * 15,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountController],
      providers: [
        {
          provide: DiscountService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockMessage),
            findById: jest.fn().mockResolvedValue(mockedDiscount),
            findMany: jest.fn().mockResolvedValue([mockedDiscount]),
            findManyByItem: jest.fn().mockResolvedValue([mockedDiscount]),
            applyDiscount: jest.fn().mockResolvedValue(mockDiscountReturn),
            update: jest.fn().mockResolvedValue(mockMessage),
            delete: jest.fn().mockResolvedValue(mockMessage),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscountController>(DiscountController);
    service = module.get<DiscountService>(DiscountService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a discount", async () => {
      const dto: CreateDiscountDto = { item: "item1", value: 10, rule: "> 5" };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe("findById", () => {
    it("should return a discount", async () => {
      const result = await controller.findById("id1");

      expect(service.findById).toHaveBeenCalledWith("id1");
      expect(result).toEqual(mockedDiscount);
    });

    it("should throw NotFoundException if discount is not found", async () => {
      jest
        .spyOn(service, "findById")
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findById("id2")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findMany", () => {
    it("should return a list of discounts", async () => {
      const result = await controller.findMany(1);

      expect(service.findMany).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockedDiscount]);
    });
  });

  describe("findManyByItem", () => {
    it("should return a list of discounts by item", async () => {
      const result = await controller.findManyByItem("item1", 1);

      expect(service.findManyByItem).toHaveBeenCalledWith("item1", 1);
      expect(result).toEqual([mockedDiscount]);
    });
  });

  describe("applyDiscount", () => {
    it("should apply a discount", async () => {
      const result = await controller.applyDiscount("item1", 100, 15);

      expect(service.applyDiscount).toHaveBeenCalledWith("item1", 100, 15);
      expect(result).toEqual(mockDiscountReturn);
    });
  });

  describe("update", () => {
    it("should update a discount", async () => {
      const dto: UpdateDiscountDto = { value: 15, rule: "> 10" };

      const result = await controller.update("id1", dto);

      expect(service.update).toHaveBeenCalledWith("id1", dto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe("delete", () => {
    it("should delete a discount", async () => {
      const result = await controller.delete("id1");

      expect(service.delete).toHaveBeenCalledWith("id1");
      expect(result).toEqual(mockMessage);
    });
  });
});
