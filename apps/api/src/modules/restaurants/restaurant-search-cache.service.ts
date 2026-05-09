import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import type { SearchRestaurantsParams } from './restaurants.service';

/** Response cache for GET /restaurants/search (Upstash REST). Optional if env vars omitted. */
const CACHE_VERSION = 'v1';

@Injectable()
export class RestaurantSearchCacheService {
  private readonly log = new Logger(RestaurantSearchCacheService.name);
  private readonly redis: Redis | null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('UPSTASH_REDIS_REST_URL')?.trim();
    const token = this.config.get<string>('UPSTASH_REDIS_REST_TOKEN')?.trim();
    if (url && token) {
      this.redis = new Redis({ url, token });
      this.log.debug('Restaurant search: Upstash Redis cache enabled');
    } else {
      this.redis = null;
    }
  }

  keyFor(params: SearchRestaurantsParams): string {
    const norm = {
      kw: (params.keyword ?? '').trim(),
      ar: (params.area ?? '').trim(),
      bmin: (params.budgetMin ?? '').trim(),
      bmax: (params.budgetMax ?? '').trim(),
      lang: (params.language ?? '').trim(),
      cln: (params.cleanlinessLevel ?? '').trim(),
      ac: (params.hasAirConditioner ?? '').trim(),
      jp: (params.isJapaneseFriendly ?? '').trim(),
    };
    return `jv:rest:${CACHE_VERSION}:${JSON.stringify(norm)}`;
  }

  async getParsed<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const raw = await this.redis.get<string>(key);
      if (raw === null || raw === undefined || raw === '') return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.log.warn(`cache get failed: ${String(error)}`);
      return null;
    }
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (error) {
      this.log.warn(`cache set failed: ${String(error)}`);
    }
  }
}
