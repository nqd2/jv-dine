import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../common/auth/auth.types';
import { RestaurantsRepository } from '../restaurants.repository';

@Injectable()
export class RestaurantOwnerGuard implements CanActivate {
  constructor(private readonly restaurantsRepository: RestaurantsRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params: { id?: string };
    }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Restaurant owner access required');
    }

    const idParam = request.params.id;
    if (!idParam) {
      return true;
    }

    const restaurantId = Number(idParam);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      throw new NotFoundException('Restaurant was not found');
    }

    const restaurant = await this.restaurantsRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant ${restaurantId} was not found`);
    }

    if (restaurant.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return true;
  }
}
