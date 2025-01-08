import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountRepository } from './repositories/discount.repository';
import { ItemService } from '../item/item.service';
import { Message } from '../../shared/interfaces/message';
import { Discount } from './entities/discount.entity';
import { DiscountReturn } from '../../shared/interfaces/discountReturn';

@Injectable()
export class DiscountService {
  constructor(
    @Inject('DiscountRepository')
    private readonly discountRepository: DiscountRepository,
    private readonly itemService: ItemService,
  ) {}

  public async create(createDiscountDto: CreateDiscountDto): Promise<Message> {
    await this.findItem(createDiscountDto.item);
    await this.discountRepository.create(createDiscountDto);
    return { message: 'Desconto adicionado com sucesso' };
  }

  public async findById(id: string): Promise<Discount> {
    const discount = await this.discountRepository.findById(id);
    if (!discount) throw new NotFoundException('Desconto não encontrado');
    return discount;
  }

  public async findMany(page: number): Promise<Discount[]> {
    return this.discountRepository.findMany(page);
  }

  public async findManyByItem(item: string, page: number): Promise<Discount[]> {
    await this.findItem(item);
    return this.discountRepository.findManyByItem(item, page);
  }

  public async applyDiscount(
    item: string,
    quantity: number,
  ): Promise<DiscountReturn> {
    if (quantity < 1)
      throw new BadRequestException('Quantidade de itens inválida');

    const { price } = await this.findItem(item);

    const discounts = await this.discountRepository.findAllByItemSorted(item);

    const maxDiscount = (() => {
      for (const discount of discounts) {
        const [operator, ruleQuantity] = discount.rule.split(' ');
        const parsedQuantity = parseInt(ruleQuantity, 10);

        const isValidRule =
          (operator == '>' && quantity > parsedQuantity) ||
          (operator == '<' && quantity < parsedQuantity);

        if (isValidRule)
          return Math.round((discount.value / 100) * price * 100) / 100;
      }
      return 0;
    })();

    return { value: maxDiscount * quantity };
  }

  public async update(
    id: string,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<Message> {
    const { item } = await this.findById(id);

    if (updateDiscountDto.item && updateDiscountDto.item != item)
      await this.findById(updateDiscountDto.item);

    updateDiscountDto.lastChange = new Date();
    await this.discountRepository.update(id, updateDiscountDto);

    return { message: 'Desconto atualizado com sucesso' };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.discountRepository.delete(id);
    return { message: 'Desconto removido com sucesso' };
  }

  private async findItem(item: string) {
    return await this.itemService.findById(item);
  }
}
