import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type {
  FavoriteModel,
  FavoriteToggleResult,
} from './models/favorite.model';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly prisma: PrismaService,
  ) {}

  findMine(userId: number): Promise<FavoriteModel[]> {
    return this.favoritesRepository.findByUserId(userId);
  }

  findFavoritedIds(userId: number): Promise<number[]> {
    return this.favoritesRepository.findFavoritedRestaurantIds(userId);
  }

  countByUserId(userId: number): Promise<number> {
    return this.favoritesRepository.countByUserId(userId);
  }

  async toggle(
    userId: number,
    restaurantId: number,
  ): Promise<FavoriteToggleResult> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} was not found`);
    }
    return this.favoritesRepository.toggle(userId, restaurantId);
  }
}
