import { Module } from '@nestjs/common';
import { RestaurantOwnerGuard } from './guards/restaurant-owner.guard';
import { RestaurantSearchCacheService } from './restaurant-search-cache.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsRepository } from './restaurants.repository';
import { RestaurantsService } from './restaurants.service';

@Module({
  controllers: [RestaurantsController],
  providers: [
    RestaurantsService,
    RestaurantsRepository,
    RestaurantSearchCacheService,
    RestaurantOwnerGuard,
  ],
  exports: [RestaurantsRepository],
})
export class RestaurantsModule {}
