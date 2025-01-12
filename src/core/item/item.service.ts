import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { UpdateManyItensDto } from "./dto/update-many-itens.dto";
import { ItemRepository } from "./repositories/item.repository";
import { ImageService } from "../../shared/services/image/image.service";
import { Message } from "../../shared/interfaces/message";
import { Item } from "./entities/item.entity";

@Injectable()
export class ItemService {
  constructor(
    @Inject("ItemRepository") private readonly itemRepository: ItemRepository,
    private readonly imageService: ImageService,
  ) {}

  public async create(
    createItemDto: CreateItemDto,
    file: Express.Multer.File,
  ): Promise<Message> {
    if (!file) throw new BadRequestException("Envie uma imagem para o item");
    await this.throwIfItemExist(createItemDto.name, createItemDto.category);

    createItemDto.pictureUrl = await this.imageService.upload(file);

    await this.itemRepository.create(createItemDto);
    return { message: "Item adicionado com sucesso" };
  }

  public async findById(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) throw new NotFoundException("Item não encontrado");
    return item;
  }

  public async findMany(page: number): Promise<Item[]> {
    return await this.itemRepository.findMany(page);
  }

  public async findManyByName(name: string, page: number): Promise<Item[]> {
    return await this.itemRepository.findManyByName(name, page);
  }

  public async findManyByCategory(
    category: string,
    page: number,
  ): Promise<Item[]> {
    return await this.itemRepository.findManyByCategory(category, page);
  }

  public async update(
    id: string,
    updateItemDto: UpdateItemDto,
    file?: Express.Multer.File,
  ): Promise<Message> {
    const { name, category, pictureUrl } = await this.findById(id);

    if (updateItemDto.name && updateItemDto.name != name)
      await this.throwIfItemExist(
        updateItemDto.name,
        updateItemDto.category || category,
      );

    if (updateItemDto.category && updateItemDto.category != category)
      await this.throwIfItemExist(
        updateItemDto.name || name,
        updateItemDto.category,
      );

    if (file) {
      await this.imageService.delete(pictureUrl);
      updateItemDto.pictureUrl = await this.imageService.upload(file);
    }

    await this.itemRepository.update(id, updateItemDto);
    return { message: "Item atualizado com sucesso" };
  }

  public async updateMany(
    updateManyItensDto: UpdateManyItensDto[],
  ): Promise<void> {
    return await this.itemRepository.updateMany(updateManyItensDto);
  }

  public async delete(id: string): Promise<Message> {
    const { pictureUrl } = await this.findById(id);

    await this.imageService.delete(pictureUrl);
    await this.itemRepository.delete(id);

    return { message: "Item removido com sucesso" };
  }

  private async throwIfItemExist(
    name: string,
    category: string,
  ): Promise<void> {
    const item = await this.itemRepository.findByNameAndCategory(
      name,
      category,
    );

    if (item) throw new BadRequestException("Esse item já existe");
  }
}
