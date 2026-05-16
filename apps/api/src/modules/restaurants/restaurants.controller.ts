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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Public } from '../../common/auth/decorators/public.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/auth/auth.types';
import type { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import type { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { RestaurantOwnerGuard } from './guards/restaurant-owner.guard';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Roles('OWNER')
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return await this.restaurantsService.findAll(user.id);
  }

  @Public()
  @Get('search')
  /** Lets browsers/CDN reuse JSON for identical queries; pairs with Redis on the server. */
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  async search(
    @Query('keyword') keyword?: string,
    @Query('area') area?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('cuisine') cuisine?: string,
    @Query('language') language?: string,
    @Query('cleanlinessLevel') cleanlinessLevel?: string,
    @Query('hasAirConditioner') hasAirConditioner?: string,
    @Query('isJapaneseFriendly') isJapaneseFriendly?: string,
    @Query('lat') lat?: string,
    @Query('long') long?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('ratingMin') ratingMin?: string,
  ) {
    return await this.restaurantsService.search({
      keyword,
      area,
      budgetMin,
      budgetMax,
      cuisine,
      language,
      cleanlinessLevel,
      hasAirConditioner,
      isJapaneseFriendly,
      lat,
      long,
      radiusKm,
      ratingMin,
    });
  }

  @Public()
  @Get(':id/detail')
  async findDetailById(@Param('id', ParseIntPipe) id: number) {
    const detail = await this.restaurantsService.findDetailById(id);
    if (!detail) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return detail;
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const restaurant = await this.restaurantsService.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return restaurant;
  }

  @Roles('OWNER')
  @Post()
  async create(
    @Body() body: CreateRestaurantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.restaurantsService.create({
      ...body,
      ownerId: user.id,
    });
  }

  @Roles('OWNER')
  @UseGuards(RestaurantOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRestaurantDto,
  ) {
    const { ownerId: _clientOwnerId, ...safeBody } = body;
    void _clientOwnerId;
    const restaurant = await this.restaurantsService.update(id, safeBody);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return restaurant;
  }

  @Roles('OWNER')
  @UseGuards(RestaurantOwnerGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const restaurant = await this.restaurantsService.delete(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${id} was not found`);
    }
    return restaurant;
  }
}
