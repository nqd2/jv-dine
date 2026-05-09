import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
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

  @Get('search')
  /** Lets browsers/CDN reuse JSON for identical queries; pairs with Redis on the server. */
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  async search(
    @Query('keyword') keyword?: string,
    @Query('area') area?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('language') language?: string,
    @Query('cleanlinessLevel') cleanlinessLevel?: string,
    @Query('hasAirConditioner') hasAirConditioner?: string,
    @Query('isJapaneseFriendly') isJapaneseFriendly?: string,
  ) {
    return await this.restaurantsService.search({
      keyword,
      area,
      budgetMin,
      budgetMax,
      language,
      cleanlinessLevel,
      hasAirConditioner,
      isJapaneseFriendly,
    });
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
