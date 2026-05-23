import { Module } from '@nestjs/common';
import { FavoritesModule } from '../favorites/favorites.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { CouponsController } from './coupons.controller';
import { CouponsRepository } from './coupons.repository';
import { CouponsService } from './coupons.service';
import { CouponOwnerGuard } from './guards/coupon-owner.guard';

@Module({
  imports: [RestaurantsModule, FavoritesModule, NotificationsModule],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository, CouponOwnerGuard],
  exports: [CouponsService],
})
export class CouponsModule {}
