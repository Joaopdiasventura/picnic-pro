import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '../../shared/pipes/parse-object-id.pipe';
import { Item } from './entities/item.entity';
import { Message } from '../../shared/interfaces/message';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Message> {
    return this.itemService.create(createItemDto, file);
  }

  @Get(':id')
  public findById(@Param('id', ParseObjectIdPipe) id: string): Promise<Item> {
    return this.itemService.findById(id);
  }

  @Get('findMany/:page')
  public findMany(@Param('page', ParseIntPipe) page: number): Promise<Item[]> {
    return this.itemService.findMany(page < 0 ? 0 : page);
  }

  @Get('findManyByName/:name/:page')
  public findManyByName(
    @Param('name') name: string,
    @Param('page', ParseIntPipe) page: number,
  ): Promise<Item[]> {
    return this.itemService.findManyByName(name, page < 0 ? 0 : page);
  }

  @Get('findManyByCategory/:category/:page')
  public findManyByCategory(
    @Param('category') category: string,
    @Param('page', ParseIntPipe) page: number,
  ): Promise<Item[]> {
    return this.itemService.findManyByCategory(category, page < 0 ? 0 : page);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  public update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Message> {
    return this.itemService.update(id, updateItemDto, file);
  }

  @Delete(':id')
  public delete(@Param('id', ParseObjectIdPipe) id: string): Promise<Message> {
    return this.itemService.delete(id);
  }
}
