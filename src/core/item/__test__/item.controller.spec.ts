import { Test, TestingModule } from "@nestjs/testing";
import { ItemController } from "../item.controller";
import { ItemService } from "../item.service";
import { CreateItemDto } from "../dto/create-item.dto";
import { UpdateItemDto } from "../dto/update-item.dto";
import { Item } from "../entities/item.entity";

describe("ItemController", () => {
  let controller: ItemController;
  let service: ItemService;

  beforeEach(async () => {
    const mockItemService = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findManyByName: jest.fn(),
      findManyByCategory: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [{ provide: ItemService, useValue: mockItemService }],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    service = module.get<ItemService>(ItemService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service.create with correct parameters", async () => {
      const createItemDto: CreateItemDto = {
        name: "Test Item",
        category: "Test Category",
        price: 100,
        quantity: 10,
      };
      const file = { buffer: Buffer.from("test") } as Express.Multer.File;

      jest.spyOn(service, "create").mockResolvedValue({ message: "Success" });

      const result = await controller.create(createItemDto, file);

      expect(service.create).toHaveBeenCalledWith(createItemDto, file);
      expect(result).toEqual({ message: "Success" });
    });
  });

  describe("findById", () => {
    it("should call service.findById with correct id", async () => {
      const id = "1";

      jest.spyOn(service, "findById").mockResolvedValue({
        id,
        name: "Test Item",
        category: "Test Category",
        pictureUrl: "https://example.com/image.jpg",
        price: 100,
        quantity: 10,
      } as Item);

      const result = await controller.findById(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        id: "1",
        name: "Test Item",
        category: "Test Category",
        pictureUrl: "https://example.com/image.jpg",
        price: 100,
        quantity: 10,
      } as Item);
    });
  });

  describe("findMany", () => {
    it("should call service.findMany with correct page", async () => {
      const page = 1;

      jest.spyOn(service, "findMany").mockResolvedValue([
        {
          id: "1",
          name: "Test Item",
          category: "Test Category",
          pictureUrl: "https://example.com/image.jpg",
          price: 100,
          quantity: 10,
        } as Item,
      ]);

      const result = await controller.findMany(page);

      expect(service.findMany).toHaveBeenCalledWith(page);
      expect(result).toEqual([
        {
          id: "1",
          name: "Test Item",
          category: "Test Category",
          pictureUrl: "https://example.com/image.jpg",
          price: 100,
          quantity: 10,
        } as Item,
      ]);
    });
  });

  describe("findManyByName", () => {
    it("should call service.findManyByName with correct parameters", async () => {
      const name = "Test";
      const page = 1;

      jest.spyOn(service, "findManyByName").mockResolvedValue([
        {
          id: "1",
          name,
          category: "Test Category",
          pictureUrl: "https://example.com/image.jpg",
          price: 100,
          quantity: 10,
        } as Item,
      ]);

      const result = await controller.findManyByName(name, page);

      expect(service.findManyByName).toHaveBeenCalledWith(name, page);
      expect(result).toEqual([
        {
          id: "1",
          name,
          category: "Test Category",
          pictureUrl: "https://example.com/image.jpg",
          price: 100,
          quantity: 10,
        } as Item,
      ]);
    });
  });

  describe("findManyByCategory", () => {
    it("should call service.findManyByCategory with correct parameters", async () => {
      const category = "Category";
      const page = 1;

      jest.spyOn(service, "findManyByCategory").mockResolvedValue([
        {
          id: "1",
          name: "Test Item",
          category,
          pictureUrl: "https://example.com/image.jpg",
          price: 100,
          quantity: 10,
        } as Item,
      ]);

      const result = await controller.findManyByCategory(category, page);

      expect(service.findManyByCategory).toHaveBeenCalledWith(category, page);
      expect(result).toEqual([
        {
          id: "1",
          name: "Test Item",
          category,
          pictureUrl: "https://example.com/image.jpg",
          price: 100,
          quantity: 10,
        } as Item,
      ]);
    });
  });

  describe("update", () => {
    it("should call service.update with correct parameters", async () => {
      const id = "1";
      const updateItemDto: UpdateItemDto = { name: "Updated Name" };
      const file = { buffer: Buffer.from("test") } as Express.Multer.File;

      jest
        .spyOn(service, "update")
        .mockResolvedValue({ message: "Updated successfully" });

      const result = await controller.update(id, updateItemDto, file);

      expect(service.update).toHaveBeenCalledWith(id, updateItemDto, file);
      expect(result).toEqual({ message: "Updated successfully" });
    });
  });

  describe("delete", () => {
    it("should call service.delete with correct id", async () => {
      const id = "1";

      jest
        .spyOn(service, "delete")
        .mockResolvedValue({ message: "Deleted successfully" });

      const result = await controller.delete(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: "Deleted successfully" });
    });
  });
});
