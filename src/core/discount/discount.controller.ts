import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { ParseObjectIdPipe } from "../../shared/pipes/parse-object-id.pipe";
import { Discount } from "./entities/discount.entity";
import { Message } from "../../shared/interfaces/message";
import { DiscountReturn } from "../../shared/interfaces/discountReturn";

@Controller("discount")
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  public create(
    @Body() createDiscountDto: CreateDiscountDto,
  ): Promise<Message> {
    return this.discountService.create(createDiscountDto);
  }

  @Get(":id")
  public findById(
    @Param("id", ParseObjectIdPipe) id: string,
  ): Promise<Discount> {
    return this.discountService.findById(id);
  }

  @Get("findMany/:page")
  public findMany(
    @Param("page", ParseIntPipe) page: number,
  ): Promise<Discount[]> {
    return this.discountService.findMany(page < 0 ? 0 : page);
  }

  @Get("findManyByItem/:item/:page")
  public findManyByItem(
    @Param("item", ParseObjectIdPipe) item: string,
    @Param("page", ParseIntPipe) page: number,
  ): Promise<Discount[]> {
    return this.discountService.findManyByItem(item, page < 0 ? 0 : page);
  }

  @Get("applyDiscount/:item/:quantity")
  public applyDiscount(
    @Param("item", ParseObjectIdPipe) item: string,
    @Param("quantity", ParseIntPipe) quantity: number,
  ): Promise<DiscountReturn> {
    return this.discountService.applyDiscount(item, quantity);
  }

  @Patch(":id")
  public update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ): Promise<Message> {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(":id")
  public delete(@Param("id", ParseObjectIdPipe) id: string): Promise<Message> {
    return this.discountService.delete(id);
  }
}
