import { Injectable } from '@nestjs/common';
import { FavoritesRepository } from '../favorites/favorites.repository';
import { NotificationsRepository } from '../notifications/notifications.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CouponModel, CouponStatsModel } from './models/coupon.model';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';
import { CouponsRepository } from './coupons.repository';

@Injectable()
export class CouponsService {
  constructor(
    private readonly couponsRepository: CouponsRepository,
    private readonly favoritesRepository: FavoritesRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(): Promise<CouponModel[]> {
    return this.couponsRepository.findAll();
  }

  findByRestaurantId(restaurantId: number): Promise<CouponModel[]> {
    return this.couponsRepository.findByRestaurantId(restaurantId);
  }

  getStatsByRestaurantId(restaurantId: number): Promise<CouponStatsModel> {
    return this.couponsRepository.getStatsByRestaurantId(restaurantId);
  }

  findById(id: number): Promise<CouponModel | null> {
    return this.couponsRepository.findById(id);
  }

  async create(data: CreateCouponDto): Promise<CouponModel> {
    const coupon = await this.couponsRepository.create(data);
    await this.notifyFavoritedUsers(
      data.restaurantId,
      `[${await this.restaurantLabel(data.restaurantId)}] 新しいクーポン: ${coupon.code} / Mã giảm giá mới: ${coupon.code}`,
    );
    return coupon;
  }

  update(id: number, data: UpdateCouponDto): Promise<CouponModel | null> {
    return this.couponsRepository.update(id, data);
  }

  delete(id: number): Promise<CouponModel | null> {
    return this.couponsRepository.delete(id);
  }

  private async restaurantLabel(restaurantId: number): Promise<string> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { name: true },
    });
    return restaurant?.name ?? `Restaurant #${restaurantId}`;
  }

  private async notifyFavoritedUsers(
    restaurantId: number,
    content: string,
  ): Promise<void> {
    const userIds =
      await this.favoritesRepository.findUserIdsByRestaurantId(restaurantId);
    if (userIds.length === 0) {
      return;
    }
    await this.notificationsRepository.createMany(
      userIds.map((userId) => ({ userId, content })),
    );
  }
}
