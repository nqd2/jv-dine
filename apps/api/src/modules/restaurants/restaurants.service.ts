import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { RestaurantModel } from './models/restaurant.model';
import { RestaurantsRepository } from './restaurants.repository';

@Injectable()
export class RestaurantsService {
  constructor(private readonly restaurantsRepository: RestaurantsRepository) {}

  findAll(): Promise<RestaurantModel[]> {
    return this.restaurantsRepository.findAll();
  }

  findById(id: number): Promise<RestaurantModel | null> {
    return this.restaurantsRepository.findById(id);
  }

  create(data: CreateRestaurantDto): Promise<RestaurantModel> {
    return this.restaurantsRepository.create(data);
  }

  update(
    id: number,
    data: UpdateRestaurantDto,
  ): Promise<RestaurantModel | null> {
    return this.restaurantsRepository.update(id, data);
  }

  delete(id: number): Promise<RestaurantModel | null> {
    return this.restaurantsRepository.delete(id);
  }
}
