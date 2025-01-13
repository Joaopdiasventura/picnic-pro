import { Test, TestingModule } from "@nestjs/testing";
import { OrderService } from "../order.service";
import { UserService } from "../../user/user.service";
import { ItemService } from "../../item/item.service";
import { DiscountService } from "../../discount/discount.service";
import { AddressService } from "../../../shared/services/address/address.service";
import { OrderRepository } from "../repositories/order.repository";
import { BadRequestException } from "@nestjs/common";
import { CreateOrderDto } from "../dto/create-order.dto";
import { Item } from "../../item/entities/item.entity";
import { Address } from "../../../shared/services/address/entities/address.entity";
import { MongoOrderRepository } from "../repositories/order.mongo.repository";
import { Order } from "../entities/order.entity";
import { User } from "../../user/entities/user.entity";

jest.mock("../../user/user.service");
jest.mock("../../item/item.service");
jest.mock("../../discount/discount.service");
jest.mock("../../../shared/services/address/address.service");
jest.mock("../repositories/order.mongo.repository");

describe("OrderService", () => {
  let service: OrderService;
  let userService: UserService;
  let itemService: ItemService;
  let discountService: DiscountService;
  let addressService: AddressService;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: "OrderRepository", useClass: MongoOrderRepository },
        UserService,
        ItemService,
        DiscountService,
        AddressService,
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    userService = module.get<UserService>(UserService);
    itemService = module.get<ItemService>(ItemService);
    discountService = module.get<DiscountService>(DiscountService);
    addressService = module.get<AddressService>(AddressService);
    orderRepository = module.get<OrderRepository>("OrderRepository");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should throw an error if the user does not exist", async () => {
      jest
        .spyOn(userService, "findById")
        .mockRejectedValue(new BadRequestException("User not found"));

      await expect(
        service.create({
          user: "invalidUserId",
          items: [],
          cep: "12345-678",
          number: "123",
        } as CreateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it("should consolidate duplicate items", async () => {
      const createOrderDto = {
        user: "validUserId",
        items: [
          { item: "item1", quantity: 1 },
          { item: "item1", quantity: 2 },
        ],
        cep: "12345-678",
        number: "123",
      };

      jest.spyOn(userService, "findById").mockResolvedValue({} as User);
      jest
        .spyOn(itemService, "findById")
        .mockResolvedValue({ id: "item1", quantity: 10 } as Item);
      jest
        .spyOn(discountService, "applyDiscount")
        .mockResolvedValue({ value: 100 });
      jest
        .spyOn(addressService, "create")
        .mockResolvedValue({ id: "addressId" } as Address);
      jest.spyOn(orderRepository, "create").mockResolvedValue({} as Order);
      jest.spyOn(itemService, "updateMany").mockResolvedValue(undefined);

      const result = await service.create(createOrderDto as CreateOrderDto);

      expect(result.message).toBe("Pedido criado com sucesso");
      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [{ item: "item1", quantity: 3 }],
        }),
      );
    });

    it("should throw an error if item quantity is insufficient", async () => {
      const createOrderDto = {
        user: "validUserId",
        items: [{ item: "item1", quantity: 5 }],
        cep: "12345-678",
        number: "123",
      };

      jest.spyOn(userService, "findById").mockResolvedValue({} as User);
      jest
        .spyOn(itemService, "findById")
        .mockResolvedValue({ id: "item1", quantity: 3 } as Item);

      await expect(
        service.create(createOrderDto as CreateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it("should calculate total amount and create an order", async () => {
      const createOrderDto = {
        user: "validUserId",
        items: [{ item: "item1", quantity: 2 }],
        cep: "12345-678",
        number: "123",
      };

      jest.spyOn(userService, "findById").mockResolvedValue({} as User);
      jest.spyOn(itemService, "findById").mockResolvedValue({
        id: "item1",
        quantity: 10,
        name: "Test Item",
        price: 50,
      } as Item);
      jest
        .spyOn(discountService, "applyDiscount")
        .mockResolvedValue({ value: 100 });
      jest
        .spyOn(addressService, "create")
        .mockResolvedValue({ id: "addressId" } as Address);
      jest.spyOn(orderRepository, "create").mockResolvedValue({} as Order);
      jest.spyOn(itemService, "updateMany").mockResolvedValue(undefined);

      const result = await service.create(createOrderDto as CreateOrderDto);

      expect(result.message).toBe("Pedido criado com sucesso");
      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 100,
          address: "addressId",
        }),
      );
    });
  });
});
