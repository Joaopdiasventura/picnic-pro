import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from '../item.service';
import { ItemRepository } from '../repositories/item.repository';
import { ImageService } from '../../../shared/services/image/image.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '../entities/item.entity';

describe('ItemService', () => {
  let service: ItemService;
  let itemRepository: ItemRepository;
  let imageService: ImageService;

  beforeEach(async () => {
    const mockItemRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findManyByName: jest.fn(),
      findManyByCategory: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByNameAndCategory: jest.fn(),
    };

    const mockImageService = {
      upload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        { provide: 'ItemRepository', useValue: mockItemRepository },
        { provide: ImageService, useValue: mockImageService },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    itemRepository = module.get<ItemRepository>('ItemRepository');
    imageService = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an item successfully', async () => {
      const createItemDto: CreateItemDto = {
        name: 'Test Item',
        category: 'Test Category',
        price: 100,
        quantity: 10,
      };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;

      jest.spyOn(imageService, 'upload').mockResolvedValue('test-url');
      jest.spyOn(itemRepository, 'create').mockResolvedValue(undefined);

      const result = await service.create(createItemDto, file);

      expect(imageService.upload).toHaveBeenCalledWith(file);
      expect(itemRepository.create).toHaveBeenCalledWith({
        ...createItemDto,
        pictureUrl: 'test-url',
      });
      expect(result).toEqual({ message: 'Item adicionado com sucesso' });
    });

    it('should throw an error if no file is provided', async () => {
      const createItemDto: CreateItemDto = {
        name: 'Test Item',
        category: 'Test Category',
        price: 100,
        quantity: 10,
      };

      await expect(service.create(createItemDto, null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the item already exists', async () => {
      const createItemDto: CreateItemDto = {
        name: 'Test Item',
        category: 'Test Category',
        price: 100,
        quantity: 10,
      };

      const file = { buffer: Buffer.from('test') } as Express.Multer.File;

      const item = {
        id: '1',
        name: 'Test Item',
        category: 'Test Category',
        pictureUrl: 'https://example.com/image.jpg',
        price: 100,
        quantity: 10,
      } as Item;

      jest
        .spyOn(itemRepository, 'findByNameAndCategory')
        .mockResolvedValue(item);

      await expect(service.create(createItemDto, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should return an item if found', async () => {
      const item = {
        id: '1',
        name: 'Test Item',
        category: 'Test Category',
        pictureUrl: 'https://example.com/image.jpg',
        price: 100,
        quantity: 10,
      } as Item;

      jest.spyOn(itemRepository, 'findById').mockResolvedValue(item);

      const result = await service.findById('1');

      expect(itemRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException if the item is not found', async () => {
      jest.spyOn(itemRepository, 'findById').mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an item successfully', async () => {
      const id = '1';
      const updateItemDto: UpdateItemDto = { name: 'Updated Name' };
      const existingItem = {
        id: '1',
        name: 'Test Item',
        category: 'Test Category',
        pictureUrl: 'https://example.com/image.jpg',
        price: 100,
        quantity: 10,
      } as Item;

      jest.spyOn(service, 'findById').mockResolvedValue(existingItem);
      jest.spyOn(itemRepository, 'update').mockResolvedValue(undefined);

      const result = await service.update(id, updateItemDto, null);

      expect(itemRepository.update).toHaveBeenCalledWith(id, updateItemDto);
      expect(result).toEqual({ message: 'Item atualizado com sucesso' });
    });

    it('should throw an error if the updated name already exists', async () => {
      const id = '1';
      const updateItemDto: UpdateItemDto = { name: 'Existing Name' };
      const existingItem = {
        id: '1',
        name: 'Test Item',
        category: 'Test Category',
        pictureUrl: 'https://example.com/image.jpg',
        price: 100,
        quantity: 10,
      } as Item;

      jest.spyOn(service, 'findById').mockResolvedValue(existingItem);
      jest
        .spyOn(itemRepository, 'findByNameAndCategory')
        .mockResolvedValue(existingItem);

      await expect(service.update(id, updateItemDto, null)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an item successfully', async () => {
      const id = '1';
      const existingItem = {
        id: '1',
        name: 'Test Item',
        category: 'Test Category',
        pictureUrl: 'https://example.com/image.jpg',
        price: 100,
        quantity: 10,
      } as Item;

      jest.spyOn(service, 'findById').mockResolvedValue(existingItem);
      jest.spyOn(imageService, 'delete').mockResolvedValue(undefined);
      jest.spyOn(itemRepository, 'delete').mockResolvedValue(undefined);

      const result = await service.delete(id);

      expect(imageService.delete).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
      );
      expect(itemRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'Item removido com sucesso' });
    });

    it('should throw NotFoundException if the item does not exist', async () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
