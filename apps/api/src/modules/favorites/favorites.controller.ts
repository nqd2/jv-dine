import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/auth/auth.types';
import type { ToggleFavoriteDto } from './dtos/toggle-favorite.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Roles('USER', 'OWNER')
  @Get('me')
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    return await this.favoritesService.findMine(user.id);
  }

  @Roles('USER', 'OWNER')
  @Get('me/ids')
  async findMineIds(@CurrentUser() user: AuthenticatedUser) {
    return await this.favoritesService.findFavoritedIds(user.id);
  }

  @Roles('USER', 'OWNER')
  @Post()
  async toggle(
    @Body() body: ToggleFavoriteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.favoritesService.toggle(user.id, body.restaurantId);
  }
}
