import { InjectModel } from "@nestjs/mongoose";
import { CreateItemDto } from "../dto/create-item.dto";
import { UpdateItemDto } from "../dto/update-item.dto";
import { Item } from "../entities/item.entity";
import { ItemRepository } from "./item.repository";
import { Model } from "mongoose";
import { UpdateManyItensDto } from "../dto/update-many-itens.dto";

export class MongoItemRepository implements ItemRepository {
  constructor(@InjectModel("Item") private readonly itemModel: Model<Item>) {}

  public async create(createItemDto: CreateItemDto): Promise<Item> {
    return await this.itemModel.create(createItemDto);
  }

  public async findById(id: string): Promise<Item> {
    return await this.itemModel.findById(id).exec();
  }

  public async findByNameAndCategory(
    name: string,
    category: string,
  ): Promise<Item> {
    return await this.itemModel.findOne({ name, category }).exec();
  }

  public async findMany(page: number): Promise<Item[]> {
    return await this.itemModel
      .find()
      .skip(10 * page)
      .limit(10)
      .exec();
  }

  public async findManyByName(name: string, page: number): Promise<Item[]> {
    return await this.itemModel
      .find({ name: { $regex: name, $options: "i" } })
      .skip(10 * page)
      .limit(10)
      .exec();
  }

  public async findManyByCategory(
    category: string,
    page: number,
  ): Promise<Item[]> {
    return await this.itemModel
      .find({ category })
      .skip(10 * page)
      .limit(10)
      .exec();
  }

  public async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    return await this.itemModel.findByIdAndUpdate(id, updateItemDto);
  }

  public async updateMany(updates: UpdateManyItensDto[]): Promise<void> {
    const bulkOperations = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { quantity: update.quantity } },
      },
    }));
    await this.itemModel.bulkWrite(bulkOperations);
  }

  public async delete(id: string): Promise<Item> {
    return await this.itemModel.findByIdAndDelete(id);
  }
}
