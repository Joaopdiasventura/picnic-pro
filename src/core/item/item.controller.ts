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

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.itemService.create(createItemDto, file);
  }

  @Get(':id')
  public findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.itemService.findById(id);
  }

  @Get('findMany/:page')
  public findMany(@Param('page', ParseIntPipe) page: number) {
    return this.itemService.findMany(page);
  }

  @Get('findManyByName/:name/:page')
  public findManyByName(
    @Param('name') name: string,
    @Param('page', ParseIntPipe) page: number,
  ) {
    return this.itemService.findManyByName(name, page);
  }

  @Get('findManyByCategory/:category/:page')
  public findManyByCategory(
    @Param('category') category: string,
    @Param('page', ParseIntPipe) page: number,
  ) {
    return this.itemService.findManyByCategory(category, page);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  public update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.itemService.update(id, updateItemDto, file);
  }

  @Delete(':id')
  public remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.itemService.remove(id);
  }
}
