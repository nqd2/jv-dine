import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import {
  RestaurantDetailModel,
  RestaurantModel,
} from './models/restaurant.model';
import { RestaurantSearchCacheService } from './restaurant-search-cache.service';
import { RestaurantsRepository } from './restaurants.repository';

export type SearchRestaurantsParams = {
  keyword?: string;
  area?: string;
  budgetMin?: string;
  budgetMax?: string;
  cuisine?: string;
  language?: string;
  cleanlinessLevel?: string;
  hasAirConditioner?: string;
  isJapaneseFriendly?: string;
  lat?: string;
  long?: string;
  radiusKm?: string;
  ratingMin?: string;
};

@Injectable()
export class RestaurantsService {
  /** Short TTL keeps DB updates visible within ~1 minute while cutting repeat load. */
  private static readonly SEARCH_CACHE_TTL_SEC = 60;

  constructor(
    private readonly restaurantsRepository: RestaurantsRepository,
    private readonly restaurantSearchCache: RestaurantSearchCacheService,
  ) {}

  findAll(ownerId?: number): Promise<RestaurantModel[]> {
    return this.restaurantsRepository.findAll(ownerId);
  }

  async search(params: SearchRestaurantsParams): Promise<RestaurantModel[]> {
    this.assertValidSearchParams(params);
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

  findDetailById(id: number): Promise<RestaurantDetailModel | null> {
    return this.restaurantsRepository.findDetailById(id);
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

  private assertValidSearchParams(params: SearchRestaurantsParams): void {
    const lat = this.normalized(params.lat);
    const long = this.normalized(params.long);
    const radiusKm = this.normalized(params.radiusKm);

    if (lat !== null || long !== null || radiusKm !== null) {
      this.assertNumberInRange(lat, 'lat', -90, 90);
      this.assertNumberInRange(long, 'long', -180, 180);
      if (radiusKm !== null) {
        this.assertNumberInRange(radiusKm, 'radiusKm', 0.1, 50);
      }
    }

    const ratingMin = this.normalized(params.ratingMin);
    if (ratingMin !== null) {
      this.assertNumberInRange(ratingMin, 'ratingMin', 1, 5);
    }
  }

  private normalized(value: string | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private assertNumberInRange(
    value: string | null,
    name: string,
    min: number,
    max: number,
  ): void {
    if (value === null) {
      throw new BadRequestException(`${name} is required`);
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      throw new BadRequestException(
        `${name} must be between ${min} and ${max}`,
      );
    }
  }
}
