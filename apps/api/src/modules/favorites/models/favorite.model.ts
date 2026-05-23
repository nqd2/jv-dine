import type { RestaurantModel } from '../../restaurants/models/restaurant.model';

export type FavoriteModel = {
  userId: number;
  restaurantId: number;
  createdAt: string;
  restaurant: RestaurantModel;
};

export type FavoriteToggleResult = {
  favorited: boolean;
  restaurantId: number;
};
