import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/auth.types';
import { RestaurantsRepository } from '../../restaurants/restaurants.repository';
import { MenusRepository } from '../menus.repository';

@Injectable()
export class MenuOwnerGuard implements CanActivate {
  constructor(
    private readonly menusRepository: MenusRepository,
    private readonly restaurantsRepository: RestaurantsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params: { id?: string };
      body?: { restaurantId?: number };
    }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Restaurant owner access required');
    }

    const menuIdParam = request.params.id;
    if (menuIdParam) {
      const menuId = Number(menuIdParam);
      if (!Number.isInteger(menuId) || menuId <= 0) {
        throw new NotFoundException('Menu was not found');
      }

      const menu = await this.menusRepository.findById(menuId);
      if (!menu) {
        throw new NotFoundException(`Menu ${menuId} was not found`);
      }

      await this.assertRestaurantOwnedByUser(menu.restaurantId, user.id);
      return true;
    }

    const restaurantId = request.body?.restaurantId;
    if (restaurantId === undefined || restaurantId === null) {
      throw new BadRequestException('restaurantId is required');
    }

    await this.assertRestaurantOwnedByUser(restaurantId, user.id);
    return true;
  }

  private async assertRestaurantOwnedByUser(
    restaurantId: number,
    userId: number,
  ): Promise<void> {
    const restaurant = await this.restaurantsRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} was not found`);
    }
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }
  }
}
