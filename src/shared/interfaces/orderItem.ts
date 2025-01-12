import { Item } from "../../core/item/entities/item.entity";

export interface OrderItem {
  item: string | Item;

  quantity: number;
}
