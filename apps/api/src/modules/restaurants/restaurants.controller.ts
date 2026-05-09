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
import type { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import type { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async findAll() {
    return await this.restaurantsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const restaurant = await this.restaurantsService.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return restaurant;
  }

  @Post()
  async create(@Body() body: CreateRestaurantDto) {
    return await this.restaurantsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRestaurantDto,
  ) {
    const restaurant = await this.restaurantsService.update(id, body);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return restaurant;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const restaurant = await this.restaurantsService.delete(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return restaurant;
  }
}
