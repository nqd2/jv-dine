import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { RestaurantModel } from './models/restaurant.model';

@Injectable()
export class RestaurantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RestaurantModel[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: { id: 'asc' },
    });

    return restaurants.map((restaurant) => this.toModel(restaurant));
  }

  async findById(id: number): Promise<RestaurantModel | null> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });
    if (!restaurant) {
      return null;
    }

    return this.toModel(restaurant);
  }

  async create(data: CreateRestaurantDto): Promise<RestaurantModel> {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        owner_id: data.ownerId,
        name: data.name,
        address: data.address,
        area: data.area,
        working_hours: data.workingHours,
        min_budget: data.minBudget,
        max_budget: data.maxBudget,
        has_air_conditioner: data.hasAirConditioner,
        is_japanese_friendly: data.isJapaneseFriendly,
        cleanliness_level: data.cleanlinessLevel,
        languages: data.languages,
        lat: data.lat,
        long: data.long,
      },
    });

    return this.toModel(restaurant);
  }

  async update(
    id: number,
    data: UpdateRestaurantDto,
  ): Promise<RestaurantModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const restaurant = await this.prisma.restaurant.update({
      where: { id },
      data: {
        owner_id: data.ownerId,
        name: data.name,
        address: data.address,
        area: data.area,
        working_hours: data.workingHours,
        min_budget: data.minBudget,
        max_budget: data.maxBudget,
        has_air_conditioner: data.hasAirConditioner,
        is_japanese_friendly: data.isJapaneseFriendly,
        cleanliness_level: data.cleanlinessLevel,
        languages: data.languages,
        lat: data.lat,
        long: data.long,
      },
    });

    return this.toModel(restaurant);
  }

  async delete(id: number): Promise<RestaurantModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const restaurant = await this.prisma.restaurant.delete({ where: { id } });
    return this.toModel(restaurant);
  }

  private async exists(id: number): Promise<boolean> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      select: { id: true },
    });
    return restaurant !== null;
  }

  private toModel(restaurant: {
    id: number;
    owner_id: number;
    name: string;
    area: string | null;
    address: string;
    working_hours: string | null;
    min_budget: { toString(): string } | null;
    max_budget: { toString(): string } | null;
    has_air_conditioner: boolean;
    is_japanese_friendly: boolean;
    cleanliness_level: number | null;
    languages: string | null;
    lat: number | null;
    long: number | null;
  }): RestaurantModel {
    return {
      id: restaurant.id,
      ownerId: restaurant.owner_id,
      name: restaurant.name,
      area: restaurant.area,
      address: restaurant.address,
      workingHours: restaurant.working_hours,
      minBudget: restaurant.min_budget?.toString() ?? null,
      maxBudget: restaurant.max_budget?.toString() ?? null,
      hasAirConditioner: restaurant.has_air_conditioner,
      isJapaneseFriendly: restaurant.is_japanese_friendly,
      cleanlinessLevel: restaurant.cleanliness_level,
      languages: restaurant.languages,
      lat: restaurant.lat,
      long: restaurant.long,
    };
  }
}
