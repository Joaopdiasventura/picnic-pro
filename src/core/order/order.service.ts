import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { UserService } from "../user/user.service";
import { ItemService } from "../item/item.service";
import { DiscountService } from "../discount/discount.service";
import { AddressService } from "../../shared/services/address/address.service";
import { Message } from "../../shared/interfaces/message";
import { OrderRepository } from "./repositories/order.repository";
import { Item } from "../item/entities/item.entity";
import { Order } from "./entities/order.entity";
import { User } from "../user/entities/user.entity";
import { OrderItemDto } from "./dto/order-item.dto";
import { OrderStatus } from "../../shared/types/order-status";

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
    await this.findUser(createOrderDto.user);

    const consolidatedItems = this.consolidateDuplicateItems(
      createOrderDto.items,
    );
    const itemsData = await this.fetchItemsData(consolidatedItems);

    const totalAmount = await this.validateAndCalculateTotalAmount(
      consolidatedItems,
      itemsData,
    );
    const address = await this.getAddress(createOrderDto);

    await this.updateItemQuantitiesInBulk(consolidatedItems, itemsData);

    await this.orderRepository.create({
      ...createOrderDto,
      items: consolidatedItems,
      totalAmount,
      address,
    });

    return { message: "Pedido criado com sucesso" };
  }

  public async findById(id: string): Promise<Order> {
    return this.ensureOrderExists(await this.orderRepository.findById(id));
  }

  public async findByIdWithDetails(id: string): Promise<Order> {
    return this.ensureOrderExists(
      await this.orderRepository.findByIdWithDetails(id),
    );
  }

  public async findManyByUser(user: string, page: number): Promise<Order[]> {
    await this.findUser(user);
    return this.orderRepository.findManyByUser(user, page);
  }

  public async findManyByItem(item: string, page: number): Promise<Order[]> {
    await this.findItem(item);
    return this.orderRepository.findManyByItem(item, page);
  }

  public async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Message> {
    await this.findById(id);

    if (updateOrderDto.cep && updateOrderDto.number)
      updateOrderDto.address = await this.getAddress(updateOrderDto);

    if (updateOrderDto.user) delete updateOrderDto.user;

    if (updateOrderDto.items) delete updateOrderDto.items;

    if (updateOrderDto.totalAmount) delete updateOrderDto.totalAmount;

    await this.orderRepository.update(id, updateOrderDto);
    return { message: "Pedido atualizado com sucesso" };
  }

  public async changeStatus(id: string, status: OrderStatus): Promise<Message> {
    await this.findById(id);
    await this.orderRepository.update(id, { status });
    return { message: "Status do pedido alterado com sucesso" };
  }

  private consolidateDuplicateItems(
    items: CreateOrderDto["items"],
  ): CreateOrderDto["items"] {
    const consolidated = new Map<string, number>();

    items.forEach(({ item, quantity }) =>
      consolidated.set(item, (consolidated.get(item) || 0) + quantity),
    );

    return Array.from(consolidated.entries()).map(([item, quantity]) => ({
      item,
      quantity,
    }));
  }

  private async validateAndCalculateTotalAmount(
    items: OrderItemDto[],
    itemsData: Item[],
  ): Promise<number> {
    const discounts = await Promise.all(
      items.map(({ item, quantity }) => {
        const itemData = this.findItemData(itemsData, item);
        this.ensureItemAvailability(itemData, quantity);
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
    items: OrderItemDto[],
    itemsData: Item[],
  ): Promise<void> {
    const updates = items.map(({ item, quantity }) => {
      const itemData = this.findItemData(itemsData, item);
      return { id: item, quantity: itemData.quantity - quantity };
    });
    await this.itemService.updateMany(updates);
  }

  private async findItem(item: string): Promise<Item> {
    return this.itemService.findById(item);
  }

  private async findUser(user: string): Promise<User> {
    return this.userService.findById(user);
  }

  private async fetchItemsData(items: OrderItemDto[]): Promise<Item[]> {
    return Promise.all(items.map(({ item }) => this.findItem(item)));
  }

  private findItemData(itemsData: Item[], itemId: string): Item {
    const item = itemsData.find((i) => i.id == itemId);
    if (!item) throw new NotFoundException(`Item não encontrado.`);
    return item;
  }

  private ensureItemAvailability(item: Item, quantity: number): void {
    if (item.quantity < quantity)
      throw new BadRequestException(
        `O item '${item.name}' não está disponível na quantidade solicitada.`,
      );
  }

  private ensureOrderExists(order: Order): Order {
    if (!order) throw new NotFoundException("Pedido não encontrado");
    return order;
  }

  private async getAddress(updateOrderDto: UpdateOrderDto): Promise<string> {
    const address = await this.addressService.create({
      cep: updateOrderDto.cep,
      number: updateOrderDto.number,
      complement: updateOrderDto.complement,
    });
    return address.id;
  }
}
