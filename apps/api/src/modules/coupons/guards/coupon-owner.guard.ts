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
import { CouponsRepository } from '../coupons.repository';

@Injectable()
export class CouponOwnerGuard implements CanActivate {
  constructor(
    private readonly couponsRepository: CouponsRepository,
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

    const couponIdParam = request.params.id;
    if (couponIdParam) {
      const couponId = Number(couponIdParam);
      if (!Number.isInteger(couponId) || couponId <= 0) {
        throw new NotFoundException('Coupon was not found');
      }

      const coupon = await this.couponsRepository.findById(couponId);
      if (!coupon) {
        throw new NotFoundException(`Coupon ${couponId} was not found`);
      }

      await this.assertRestaurantOwnedByUser(coupon.restaurantId, user.id);
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
