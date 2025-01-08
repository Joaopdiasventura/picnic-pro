import { InjectModel } from "@nestjs/mongoose";
import { CreateDiscountDto } from "../dto/create-discount.dto";
import { UpdateDiscountDto } from "../dto/update-discount.dto";
import { Discount } from "../entities/discount.entity";
import { DiscountRepository } from "./discount.repository";
import { Model } from "mongoose";

export class MongoDiscountRepository implements DiscountRepository {
  constructor(
    @InjectModel("Discount") private readonly discountModel: Model<Discount>,
  ) {}

  public async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    return await this.discountModel.create(createDiscountDto);
  }

  public async findById(id: string): Promise<Discount> {
    return await this.discountModel.findById(id).exec();
  }

  public async findMany(page: number): Promise<Discount[]> {
    return await this.discountModel
      .find()
      .skip(10 * page)
      .limit(10)
      .populate({ path: "item", select: "name pictureUrl" })
      .exec();
  }

  public async findManyByItem(item: string, page: number): Promise<Discount[]> {
    return await this.discountModel
      .find({ item })
      .skip(10 * page)
      .limit(10)
      .populate("item")
      .exec();
  }

  public async findAllByItemSorted(item: string): Promise<Discount[]> {
    return await this.discountModel
      .find({ item })
      .sort({ value: -1 })
      .populate("item")
      .exec();
  }

  public async update(
    id: string,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<Discount> {
    return await this.discountModel.findByIdAndUpdate(id, updateDiscountDto);
  }

  public async delete(id: string): Promise<Discount> {
    return await this.discountModel.findByIdAndDelete(id);
  }
}
