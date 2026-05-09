import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';
import { MenuModel } from './models/menu.model';
import { MenusRepository } from './menus.repository';

@Injectable()
export class MenusService {
  constructor(private readonly menusRepository: MenusRepository) {}

  findAll(): Promise<MenuModel[]> {
    return this.menusRepository.findAll();
  }

  findByRestaurantId(restaurantId: number): Promise<MenuModel[]> {
    return this.menusRepository.findByRestaurantId(restaurantId);
  }

  findById(id: number): Promise<MenuModel | null> {
    return this.menusRepository.findById(id);
  }

  create(data: CreateMenuDto): Promise<MenuModel> {
    return this.menusRepository.create(data);
  }

  update(id: number, data: UpdateMenuDto): Promise<MenuModel | null> {
    return this.menusRepository.update(id, data);
  }

  delete(id: number): Promise<MenuModel | null> {
    return this.menusRepository.delete(id);
  }
}
