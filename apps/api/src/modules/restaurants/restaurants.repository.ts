import { Injectable } from '@nestjs/common';
import { Prisma, type Restaurant } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import type { SearchRestaurantsParams } from './restaurants.service';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import {
  RestaurantDetailModel,
  RestaurantModel,
} from './models/restaurant.model';

type RatingRow = {
  rating: number;
};

type RestaurantWithRatings = Restaurant & {
  reviews?: RatingRow[];
};

@Injectable()
export class RestaurantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(ownerId?: number): Promise<RestaurantModel[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      where: ownerId !== undefined ? { owner_id: ownerId } : undefined,
      include: { reviews: { select: { rating: true } } },
      orderBy: { id: 'asc' },
    });

    return restaurants.map((restaurant) => this.toModel(restaurant));
  }

  async search(params: SearchRestaurantsParams): Promise<RestaurantModel[]> {
    const where = this.buildSearchWhere(params);
    const restaurants = await this.prisma.restaurant.findMany({
      where,
      include: { reviews: { select: { rating: true } } },
      orderBy: { id: 'asc' },
    });

    return this.applySearchPostFilters(restaurants, params);
  }

  async findById(id: number): Promise<RestaurantModel | null> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { reviews: { select: { rating: true } } },
    });
    if (!restaurant) {
      return null;
    }

    return this.toModel(restaurant);
  }

  async findDetailById(id: number): Promise<RestaurantDetailModel | null> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: { orderBy: { id: 'asc' } },
        reviews: {
          include: { user: { select: { username: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!restaurant) {
      return null;
    }

    const ratingRows = restaurant.reviews.map((review) => ({
      rating: review.rating,
    }));
    const restaurantModel = this.toModel({
      ...restaurant,
      reviews: ratingRows,
    });

    return {
      restaurant: restaurantModel,
      menus: restaurant.menus.map((menu) => ({
        id: menu.id,
        restaurantId: menu.restaurant_id,
        itemName: menu.item_name,
        nameVn: menu.name_vn,
        description: menu.description,
        price: menu.price.toString(),
        isJapaneseFriendly: menu.is_japanese_friendly,
        warningTags: menu.warning_tags,
        imageUrl: menu.image_url,
      })),
      reviews: restaurant.reviews.map((review) => ({
        id: review.id,
        userId: review.user_id,
        userName: review.user.username,
        restaurantId: review.restaurant_id,
        rating: review.rating,
        ratingTaste: review.rating_taste,
        ratingCleanliness: review.rating_cleanliness,
        ratingService: review.rating_service,
        comment: review.comment,
        imageUrl: review.image_url,
        createdAt: review.created_at.toISOString(),
      })),
      ratingSummary: {
        averageRating: restaurantModel.averageRating,
        reviewCount: restaurantModel.reviewCount,
      },
    };
  }

  async create(data: CreateRestaurantDto): Promise<RestaurantModel> {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        owner_id: data.ownerId,
        name: data.name,
        name_vn: data.nameVn ?? null,
        description_ja: data.descriptionJa ?? null,
        description_vn: data.descriptionVn ?? null,
        address: data.address,
        area: data.area,
        phone: data.phone ?? null,
        cuisine: data.cuisine ?? null,
        working_hours: data.workingHours,
        min_budget: data.minBudget,
        max_budget: data.maxBudget,
        has_air_conditioner: data.hasAirConditioner ?? false,
        is_japanese_friendly: data.isJapaneseFriendly ?? false,
        has_wifi: data.hasWifi ?? false,
        has_parking: data.hasParking ?? false,
        has_english_support: data.hasEnglishSupport ?? false,
        accepts_cards: data.acceptsCards ?? false,
        has_delivery: data.hasDelivery ?? false,
        accepts_reservations: data.acceptsReservations ?? false,
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
        name_vn: data.nameVn,
        description_ja: data.descriptionJa,
        description_vn: data.descriptionVn,
        address: data.address,
        area: data.area,
        phone: data.phone,
        cuisine: data.cuisine,
        working_hours: data.workingHours,
        min_budget: data.minBudget,
        max_budget: data.maxBudget,
        has_air_conditioner: data.hasAirConditioner,
        is_japanese_friendly: data.isJapaneseFriendly,
        has_wifi: data.hasWifi,
        has_parking: data.hasParking,
        has_english_support: data.hasEnglishSupport,
        accepts_cards: data.acceptsCards,
        has_delivery: data.hasDelivery,
        accepts_reservations: data.acceptsReservations,
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
          { name_vn: { contains: keyword, mode: 'insensitive' } },
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

    const cuisine = this.normalizeString(params.cuisine);
    if (cuisine !== null) {
      and.push({ cuisine: { contains: cuisine, mode: 'insensitive' } });
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

    const budgetMin = this.parseBudgetDecimal(params.budgetMin);
    if (budgetMin !== null) {
      and.push({ max_budget: { gte: budgetMin } });
    }

    const budgetMax = this.parseBudgetDecimal(params.budgetMax);
    if (budgetMax !== null) {
      and.push({ min_budget: { lte: budgetMax } });
    }

    const lat = this.parseNumber(params.lat);
    const long = this.parseNumber(params.long);
    const radiusKm = this.parseNumber(params.radiusKm) ?? 2;
    if (lat !== null && long !== null) {
      and.push({ lat: { not: null } });
      and.push({ long: { not: null } });
      const latDelta = radiusKm / 111;
      const longDelta =
        radiusKm / (111 * Math.max(Math.cos(this.degreesToRadians(lat)), 0.01));
      and.push({ lat: { gte: lat - latDelta, lte: lat + latDelta } });
      and.push({ long: { gte: long - longDelta, lte: long + longDelta } });
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

  private parseBudgetDecimal(value: string | undefined): Prisma.Decimal | null {
    const parsed = this.parseNumber(value);
    if (parsed === null) {
      return null;
    }

    const budgetInVnd = Math.abs(parsed) < 10_000 ? parsed * 1_000 : parsed;
    return new Prisma.Decimal(budgetInVnd);
  }

  private applySearchPostFilters(
    restaurants: RestaurantWithRatings[],
    params: SearchRestaurantsParams,
  ): RestaurantModel[] {
    const lat = this.parseNumber(params.lat);
    const long = this.parseNumber(params.long);
    const radiusKm = this.parseNumber(params.radiusKm) ?? 2;
    const ratingMin = this.parseNumber(params.ratingMin);

    return restaurants
      .map((restaurant) =>
        this.toModel(
          restaurant,
          lat !== null && long !== null
            ? this.distanceKm(lat, long, restaurant.lat, restaurant.long)
            : null,
        ),
      )
      .filter((restaurant) => {
        if (ratingMin !== null) {
          const rating = restaurant.averageRating ?? 0;
          if (rating < ratingMin) {
            return false;
          }
        }

        if (lat !== null && long !== null) {
          return (
            restaurant.distanceKm !== null && restaurant.distanceKm <= radiusKm
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) {
          return a.id - b.id;
        }
        return (
          (a.distanceKm ?? Number.POSITIVE_INFINITY) -
          (b.distanceKm ?? Number.POSITIVE_INFINITY)
        );
      });
  }

  private distanceKm(
    originLat: number,
    originLong: number,
    lat: number | null,
    long: number | null,
  ): number | null {
    if (lat === null || long === null) {
      return null;
    }

    const earthRadiusKm = 6371;
    const latDelta = this.degreesToRadians(lat - originLat);
    const longDelta = this.degreesToRadians(long - originLong);
    const a =
      Math.sin(latDelta / 2) ** 2 +
      Math.cos(this.degreesToRadians(originLat)) *
        Math.cos(this.degreesToRadians(lat)) *
        Math.sin(longDelta / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  }

  private degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private averageRating(reviews: RatingRow[] | undefined): number | null {
    if (!reviews || reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }

  private toModel(
    restaurant: RestaurantWithRatings,
    distanceKm: number | null = null,
  ): RestaurantModel {
    const averageRating = this.averageRating(restaurant.reviews);

    return {
      id: restaurant.id,
      ownerId: restaurant.owner_id,
      name: restaurant.name,
      nameVn: restaurant.name_vn,
      descriptionJa: restaurant.description_ja,
      descriptionVn: restaurant.description_vn,
      area: restaurant.area,
      address: restaurant.address,
      phone: restaurant.phone,
      cuisine: restaurant.cuisine,
      workingHours: restaurant.working_hours,
      minBudget: restaurant.min_budget?.toString() ?? null,
      maxBudget: restaurant.max_budget?.toString() ?? null,
      hasAirConditioner: restaurant.has_air_conditioner,
      isJapaneseFriendly: restaurant.is_japanese_friendly,
      hasWifi: restaurant.has_wifi,
      hasParking: restaurant.has_parking,
      hasEnglishSupport: restaurant.has_english_support,
      acceptsCards: restaurant.accepts_cards,
      hasDelivery: restaurant.has_delivery,
      acceptsReservations: restaurant.accepts_reservations,
      cleanlinessLevel: restaurant.cleanliness_level,
      languages: restaurant.languages,
      lat: restaurant.lat,
      long: restaurant.long,
      imageUrl: restaurant.image_url,
      averageRating,
      reviewCount: restaurant.reviews?.length ?? 0,
      distanceKm,
    };
  }
}
