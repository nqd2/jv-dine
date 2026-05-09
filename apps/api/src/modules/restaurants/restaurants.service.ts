import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { RestaurantModel } from './models/restaurant.model';
import { RestaurantSearchCacheService } from './restaurant-search-cache.service';
import { RestaurantsRepository } from './restaurants.repository';

export type SearchRestaurantsParams = {
  keyword?: string;
  area?: string;
  budgetMin?: string;
  budgetMax?: string;
  language?: string;
  cleanlinessLevel?: string;
  hasAirConditioner?: string;
  isJapaneseFriendly?: string;
};

@Injectable()
export class RestaurantsService {
  /** Short TTL keeps DB updates visible within ~1 minute while cutting repeat load. */
  private static readonly SEARCH_CACHE_TTL_SEC = 60;

  constructor(
    private readonly restaurantsRepository: RestaurantsRepository,
    private readonly restaurantSearchCache: RestaurantSearchCacheService,
  ) {}

  findAll(): Promise<RestaurantModel[]> {
    return this.restaurantsRepository.findAll();
  }

  async search(params: SearchRestaurantsParams): Promise<RestaurantModel[]> {
    const key = this.restaurantSearchCache.keyFor(params);
    const cached =
      await this.restaurantSearchCache.getParsed<RestaurantModel[]>(key);
    if (cached) {
      return cached;
    }
    const rows = await this.restaurantsRepository.search(params);
    await this.restaurantSearchCache.setJson(
      key,
      rows,
      RestaurantsService.SEARCH_CACHE_TTL_SEC,
    );
    return rows;
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
