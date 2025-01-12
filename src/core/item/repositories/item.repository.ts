import { Item } from "../entities/item.entity";
import { CreateItemDto } from "../dto/create-item.dto";
import { UpdateItemDto } from "../dto/update-item.dto";
import { UpdateManyItensDto } from "../dto/update-many-itens.dto";

export interface ItemRepository {
  create(createItemDto: CreateItemDto): Promise<Item>;
  findById(id: string): Promise<Item>;
  findByNameAndCategory(name: string, category: string): Promise<Item>;
  findMany(page: number): Promise<Item[]>;
  findManyByName(name: string, page: number): Promise<Item[]>;
  findManyByCategory(category: string, page: number): Promise<Item[]>;
  update(id: string, updateItemDto: UpdateItemDto): Promise<Item>;
  updateMany(updates: UpdateManyItensDto[]): Promise<void>;
  delete(id: string): Promise<Item>;
}
