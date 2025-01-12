import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UserService } from "../user/user.service";
import { ItemService } from "../item/item.service";
import { DiscountService } from "../discount/discount.service";
import { AddressService } from "../../shared/services/address/address.service";
import { Message } from "../../shared/interfaces/message";
import { OrderRepository } from "./repositories/order.repository";
import { Item } from "../item/entities/item.entity";

@Injectable()
export class OrderService {
  constructor(
    @Inject("OrderRepository")
    private readonly orderRepository: OrderRepository,
    private readonly userService: UserService,
    private readonly itemService: ItemService,
    private readonly addressService: AddressService,
    private readonly discountService: DiscountService,
  ) {}

  public async create(createOrderDto: CreateOrderDto): Promise<Message> {
    this.validateConclusionDate(createOrderDto.conclusionDate);

    await this.userService.findById(createOrderDto.user);

    createOrderDto.items = this.consolidateDuplicateItems(createOrderDto.items);

    const items: Item[] = [];

    for (let i = 0; i < createOrderDto.items.length; i++) {
      const item = await this.itemService.findById(
        createOrderDto.items[i].item,
      );
      items.push(item);
    }

    const totalAmount = await this.validateAndCalculateTotalAmount(
      createOrderDto.items,
      items,
    );

    const address = await this.addressService.create(createOrderDto);

    await this.updateItemQuantitiesInBulk(createOrderDto.items, items);

    const orderData = {
      ...createOrderDto,
      totalAmount,
      address: address.id,
    };

    await this.orderRepository.create(orderData);

    return { message: "Pedido criado com sucesso" };
  }

  private validateConclusionDate(conclusionDate: Date): void {
    const twoWeeksFromToday = new Date();
    twoWeeksFromToday.setDate(twoWeeksFromToday.getDate() + 7);
    twoWeeksFromToday.setHours(0, 0, 0, 0);

    if (conclusionDate < twoWeeksFromToday) {
      throw new BadRequestException(
        "A data de conclusão do pedido deve ser até sete dias a partir de hoje",
      );
    }
  }

  private consolidateDuplicateItems(
    items: CreateOrderDto["items"],
  ): CreateOrderDto["items"] {
    const consolidated = new Map<string, number>();

    for (const { item, quantity } of items)
      consolidated.set(item, (consolidated.get(item) || 0) + quantity);

    return Array.from(consolidated.entries()).map(([item, quantity]) => ({
      item,
      quantity,
    }));
  }

  private async validateAndCalculateTotalAmount(
    items: CreateOrderDto["items"],
    itemsData: Item[],
  ): Promise<number> {
    const discounts = await Promise.all(
      items.map(({ item, quantity }) => {
        const itemData = itemsData.find((i) => i.id == item);
        if (itemData.quantity < quantity)
          throw new BadRequestException(
            `O item '${itemData.name}' não está disponível na quantidade solicitada.`,
          );

        return this.discountService.applyDiscount(
          item,
          itemData.price,
          quantity,
        );
      }),
    );

    return discounts.reduce((sum, discount) => sum + discount.value, 0);
  }

  private async updateItemQuantitiesInBulk(
    items: CreateOrderDto["items"],
    itemsData: Item[],
  ): Promise<void> {
    const updates = items.map(({ item, quantity }) => {
      const itemData = itemsData.find((i) => i.id == item);
      return {
        id: item,
        quantity: itemData.quantity - quantity,
      };
    });

    await this.itemService.updateMany(updates);
  }
}
