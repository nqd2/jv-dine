import { Module } from '@nestjs/common';
import { FavoritesModule } from '../favorites/favorites.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MenuOwnerGuard } from './guards/menu-owner.guard';
import { MenusController } from './menus.controller';
import { MenusRepository } from './menus.repository';
import { MenusService } from './menus.service';

@Module({
  imports: [RestaurantsModule, FavoritesModule, NotificationsModule],
  controllers: [MenusController],
  providers: [MenusService, MenusRepository, MenuOwnerGuard],
  exports: [MenusService],
})
export class MenusModule {}
