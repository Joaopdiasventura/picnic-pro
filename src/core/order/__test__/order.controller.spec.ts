import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";
import { CreateOrderDto } from "../dto/create-order.dto";
import { Message } from "../../../shared/interfaces/message";

describe("OrderController", () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call OrderService.create with the correct parameters", async () => {
      const createOrderDto: CreateOrderDto = {
        user: "validUserId",
        items: [{ item: "item1", quantity: 2 }],
        cep: "12345-678",
        number: "123",
      } as CreateOrderDto;

      const result: Message = { message: "Pedido criado com sucesso" };
      jest.spyOn(service, "create").mockResolvedValue(result);

      const response = await controller.create(createOrderDto);

      expect(service.create).toHaveBeenCalledWith(createOrderDto);
      expect(response).toEqual(result);
    });
  });
});
