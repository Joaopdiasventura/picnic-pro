import { Discount } from "../entities/discount.entity";
import { CreateDiscountDto } from "./../dto/create-discount.dto";
import { UpdateDiscountDto } from "./../dto/update-discount.dto";

export interface DiscountRepository {
  create(createDiscountDto: CreateDiscountDto): Promise<Discount>;
  findById(id: string): Promise<Discount>;
  findMany(page: number): Promise<Discount[]>;
  findManyByItem(item: string, page: number): Promise<Discount[]>;
  findAllByItemSorted(item: string): Promise<Discount[]>;
  update(id: string, updateDiscountDto: UpdateDiscountDto): Promise<Discount>;
  delete(id: string): Promise<Discount>;
}
