import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type { CreateMenuDto } from './dtos/create-menu.dto';
import type { UpdateMenuDto } from './dtos/update-menu.dto';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  async findAll() {
    return await this.menusService.findAll();
  }

  @Get('restaurant/:restaurantId')
  async findByRestaurantId(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return await this.menusService.findByRestaurantId(restaurantId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const menu = await this.menusService.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu ${id} was not found`);
    }
    return menu;
  }

  @Post()
  async create(@Body() body: CreateMenuDto) {
    return await this.menusService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMenuDto,
  ) {
    const menu = await this.menusService.update(id, body);
    if (!menu) {
      throw new NotFoundException(`Menu ${id} was not found`);
    }
    return menu;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const menu = await this.menusService.delete(id);
    if (!menu) {
      throw new NotFoundException(`Menu ${id} was not found`);
    }
    return menu;
  }
}
