import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RestaurantsRepository } from '../restaurants/restaurants.repository';
import type {
  FavoriteModel,
  FavoriteToggleResult,
} from './models/favorite.model';

@Injectable()
export class FavoritesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly restaurantsRepository: RestaurantsRepository,
  ) {}

  async findByUserId(userId: number): Promise<FavoriteModel[]> {
    const rows = await this.prisma.userFavorite.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        restaurant: {
          include: { reviews: { select: { rating: true } } },
        },
      },
    });

    return rows.map((row) => ({
      userId: row.user_id,
      restaurantId: row.restaurant_id,
      createdAt: row.created_at.toISOString(),
      restaurant: this.restaurantsRepository.mapRestaurant(row.restaurant),
    }));
  }

  async isFavorited(userId: number, restaurantId: number): Promise<boolean> {
    const row = await this.prisma.userFavorite.findUnique({
      where: {
        user_id_restaurant_id: { user_id: userId, restaurant_id: restaurantId },
      },
    });
    return row !== null;
  }

  async findFavoritedRestaurantIds(userId: number): Promise<number[]> {
    const rows = await this.prisma.userFavorite.findMany({
      where: { user_id: userId },
      select: { restaurant_id: true },
    });
    return rows.map((r) => r.restaurant_id);
  }

  async countByUserId(userId: number): Promise<number> {
    return this.prisma.userFavorite.count({ where: { user_id: userId } });
  }

  async countByRestaurantId(restaurantId: number): Promise<number> {
    return this.prisma.userFavorite.count({
      where: { restaurant_id: restaurantId },
    });
  }

  async findUserIdsByRestaurantId(restaurantId: number): Promise<number[]> {
    const rows = await this.prisma.userFavorite.findMany({
      where: { restaurant_id: restaurantId },
      select: { user_id: true },
    });
    return rows.map((r) => r.user_id);
  }

  async toggle(
    userId: number,
    restaurantId: number,
  ): Promise<FavoriteToggleResult> {
    const existing = await this.prisma.userFavorite.findUnique({
      where: {
        user_id_restaurant_id: { user_id: userId, restaurant_id: restaurantId },
      },
    });

    if (existing) {
      await this.prisma.userFavorite.delete({
        where: {
          user_id_restaurant_id: {
            user_id: userId,
            restaurant_id: restaurantId,
          },
        },
      });
      return { favorited: false, restaurantId };
    }

    await this.prisma.userFavorite.create({
      data: { user_id: userId, restaurant_id: restaurantId },
    });
    return { favorited: true, restaurantId };
  }
}
