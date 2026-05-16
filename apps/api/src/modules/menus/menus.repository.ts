import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';
import { MenuModel } from './models/menu.model';

@Injectable()
export class MenusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<MenuModel[]> {
    const menus = await this.prisma.menu.findMany({
      orderBy: { id: 'asc' },
    });

    return menus.map((menu) => this.toModel(menu));
  }

  async findByRestaurantId(restaurantId: number): Promise<MenuModel[]> {
    const menus = await this.prisma.menu.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { id: 'asc' },
    });

    return menus.map((menu) => this.toModel(menu));
  }

  async findById(id: number): Promise<MenuModel | null> {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    return menu ? this.toModel(menu) : null;
  }

  async create(data: CreateMenuDto): Promise<MenuModel> {
    const menu = await this.prisma.menu.create({
      data: {
        restaurant_id: data.restaurantId,
        item_name: data.itemName,
        name_vn: data.nameVn,
        description: data.description,
        price: data.price,
        is_japanese_friendly: data.isJapaneseFriendly ?? false,
        warning_tags: data.warningTags,
        image_url: data.imageUrl,
      },
    });

    return this.toModel(menu);
  }

  async update(id: number, data: UpdateMenuDto): Promise<MenuModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const menu = await this.prisma.menu.update({
      where: { id },
      data: {
        restaurant_id: data.restaurantId,
        item_name: data.itemName,
        name_vn: data.nameVn,
        description: data.description,
        price: data.price,
        is_japanese_friendly: data.isJapaneseFriendly,
        warning_tags: data.warningTags,
        image_url: data.imageUrl,
      },
    });

    return this.toModel(menu);
  }

  async delete(id: number): Promise<MenuModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const menu = await this.prisma.menu.delete({ where: { id } });
    return this.toModel(menu);
  }

  private async exists(id: number): Promise<boolean> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      select: { id: true },
    });
    return menu !== null;
  }

  private toModel(menu: {
    id: number;
    restaurant_id: number;
    item_name: string;
    name_vn: string | null;
    description: string | null;
    price: { toString(): string };
    is_japanese_friendly: boolean;
    warning_tags: string | null;
    image_url: string | null;
  }): MenuModel {
    return {
      id: menu.id,
      restaurantId: menu.restaurant_id,
      itemName: menu.item_name,
      nameVn: menu.name_vn,
      description: menu.description,
      price: menu.price.toString(),
      isJapaneseFriendly: menu.is_japanese_friendly,
      warningTags: menu.warning_tags,
      imageUrl: menu.image_url,
    };
  }
}
