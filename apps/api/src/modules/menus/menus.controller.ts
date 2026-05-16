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
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../common/auth/decorators/public.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { CreateMenuDto } from './dtos/create-menu.dto';
import type { UpdateMenuDto } from './dtos/update-menu.dto';
import { MenuOwnerGuard } from './guards/menu-owner.guard';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.menusService.findAll();
  }

  @Public()
  @Get('restaurant/:restaurantId')
  async findByRestaurantId(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return await this.menusService.findByRestaurantId(restaurantId);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const menu = await this.menusService.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu ${id} was not found`);
    }
    return menu;
  }

  @Roles('OWNER')
  @UseGuards(MenuOwnerGuard)
  @Post()
  async create(@Body() body: CreateMenuDto) {
    return await this.menusService.create(body);
  }

  @Roles('OWNER')
  @UseGuards(MenuOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMenuDto,
  ) {
    const { restaurantId: _restaurantId, ...safeBody } = body;
    void _restaurantId;
    const menu = await this.menusService.update(id, safeBody);
    if (!menu) {
      throw new NotFoundException(`Menu ${id} was not found`);
    }
    return menu;
  }

  @Roles('OWNER')
  @UseGuards(MenuOwnerGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const menu = await this.menusService.delete(id);
    if (!menu) {
      throw new NotFoundException(`Menu ${id} was not found`);
    }
    return menu;
  }
}
