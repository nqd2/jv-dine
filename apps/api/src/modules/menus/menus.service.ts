import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FavoritesRepository } from '../favorites/favorites.repository';
import { NotificationsRepository } from '../notifications/notifications.repository';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';
import { MenuModel } from './models/menu.model';
import { MenusRepository } from './menus.repository';

@Injectable()
export class MenusService {
  constructor(
    private readonly menusRepository: MenusRepository,
    private readonly favoritesRepository: FavoritesRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(): Promise<MenuModel[]> {
    return this.menusRepository.findAll();
  }

  findByRestaurantId(restaurantId: number): Promise<MenuModel[]> {
    return this.menusRepository.findByRestaurantId(restaurantId);
  }

  findById(id: number): Promise<MenuModel | null> {
    return this.menusRepository.findById(id);
  }

  async create(data: CreateMenuDto): Promise<MenuModel> {
    const menu = await this.menusRepository.create(data);
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      select: { name: true },
    });
    const label = restaurant?.name ?? `Restaurant #${data.restaurantId}`;
    const userIds = await this.favoritesRepository.findUserIdsByRestaurantId(
      data.restaurantId,
    );
    if (userIds.length > 0) {
      await this.notificationsRepository.createMany(
        userIds.map((userId) => ({
          userId,
          content: `[${label}] 新メニュー: ${menu.itemName} / Món mới: ${menu.itemName}`,
        })),
      );
    }
    return menu;
  }

  update(id: number, data: UpdateMenuDto): Promise<MenuModel | null> {
    return this.menusRepository.update(id, data);
  }

  delete(id: number): Promise<MenuModel | null> {
    return this.menusRepository.delete(id);
  }
}
