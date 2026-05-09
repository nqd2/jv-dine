import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import type { SearchRestaurantsParams } from './restaurants.service';
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

  async search(params: SearchRestaurantsParams): Promise<RestaurantModel[]> {
    const where = this.buildSearchWhere(params);
    const restaurants = await this.prisma.restaurant.findMany({
      where,
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
        image_url: data.imageUrl ?? null,
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
        image_url: data.imageUrl,
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

  private buildSearchWhere(
    params: SearchRestaurantsParams,
  ): Prisma.RestaurantWhereInput {
    const where: Prisma.RestaurantWhereInput = {};
    const and: Prisma.RestaurantWhereInput[] = [];

    const keyword = this.normalizeString(params.keyword);
    if (keyword !== null) {
      and.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          {
            menus: {
              some: { item_name: { contains: keyword, mode: 'insensitive' } },
            },
          },
        ],
      });
    }

    const area = this.normalizeString(params.area);
    if (area !== null) {
      and.push({ area: { equals: area, mode: 'insensitive' } });
    }

    const language = this.normalizeString(params.language);
    if (language !== null) {
      and.push({ languages: { contains: language, mode: 'insensitive' } });
    }

    const cleanlinessLevel = this.parseNumber(params.cleanlinessLevel);
    if (cleanlinessLevel !== null) {
      and.push({ cleanliness_level: { gte: cleanlinessLevel } });
    }

    const hasAirConditioner = this.parseBoolean(params.hasAirConditioner);
    if (hasAirConditioner !== null) {
      and.push({ has_air_conditioner: hasAirConditioner });
    }

    const isJapaneseFriendly = this.parseBoolean(params.isJapaneseFriendly);
    if (isJapaneseFriendly !== null) {
      and.push({ is_japanese_friendly: isJapaneseFriendly });
    }

    const budgetMin = this.parseDecimal(params.budgetMin);
    if (budgetMin !== null) {
      and.push({ min_budget: { gte: budgetMin } });
    }

    const budgetMax = this.parseDecimal(params.budgetMax);
    if (budgetMax !== null) {
      and.push({ max_budget: { lte: budgetMax } });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    return where;
  }

  private normalizeString(value: string | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private parseBoolean(value: string | undefined): boolean | null {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return null;
  }

  private parseNumber(value: string | undefined): number | null {
    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseDecimal(value: string | undefined): Prisma.Decimal | null {
    const parsed = this.parseNumber(value);
    return parsed !== null ? new Prisma.Decimal(parsed) : null;
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
    image_url: string | null;
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
      imageUrl: restaurant.image_url,
    };
  }
}
