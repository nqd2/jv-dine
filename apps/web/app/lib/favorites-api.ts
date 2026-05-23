import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { restaurantApiBaseUrl } from "./restaurant-api";
import type { RestaurantApiRecord } from "./restaurant-api";

export type FavoriteRecord = {
  userId: number;
  restaurantId: number;
  createdAt: string;
  restaurant: RestaurantApiRecord;
};

export type FavoriteToggleResult = {
  favorited: boolean;
  restaurantId: number;
};

export async function fetchMyFavorites(): Promise<FavoriteRecord[]> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/favorites/me`, {
    cache: "no-store",
  });
  return parseJsonResponse(res);
}

export async function fetchMyFavoriteIds(): Promise<number[]> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/favorites/me/ids`, {
    cache: "no-store",
  });
  return parseJsonResponse(res);
}

export async function toggleFavorite(
  restaurantId: number,
): Promise<FavoriteToggleResult> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restaurantId }),
  });
  return parseJsonResponse(res);
}
