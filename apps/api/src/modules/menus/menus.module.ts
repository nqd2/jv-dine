import { Module } from '@nestjs/common';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MenuOwnerGuard } from './guards/menu-owner.guard';
import { MenusController } from './menus.controller';
import { MenusRepository } from './menus.repository';
import { MenusService } from './menus.service';

@Module({
  imports: [RestaurantsModule],
  controllers: [MenusController],
  providers: [MenusService, MenusRepository, MenuOwnerGuard],
  exports: [MenusService],
})
export class MenusModule {}
