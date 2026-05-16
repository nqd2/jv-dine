import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { getStoredAccessToken } from "./auth-session";
import type { GeoSearchParams } from "./search-params";
import {
  buildRestaurantSearchParams,
  type SearchFormState,
} from "./search-params";

export type RestaurantApiRecord = {
  id: number;
  ownerId: number;
  name: string;
  nameVn: string | null;
  descriptionJa: string | null;
  descriptionVn: string | null;
  address: string;
  phone: string | null;
  cuisine: string | null;
  workingHours: string | null;
  minBudget: string | null;
  maxBudget: string | null;
  hasAirConditioner: boolean;
  isJapaneseFriendly: boolean;
  hasWifi: boolean;
  hasParking: boolean;
  hasEnglishSupport: boolean;
  acceptsCards: boolean;
  hasDelivery: boolean;
  acceptsReservations: boolean;
  lat: number | null;
  long: number | null;
  imageUrl: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  distanceKm?: number | null;
};

export type MenuItemRecord = {
  id: number;
  restaurantId: number;
  itemName: string;
  nameVn: string | null;
  description: string | null;
  price: string;
  isJapaneseFriendly: boolean;
  warningTags: string | null;
  imageUrl: string | null;
};

export type ReviewItemRecord = {
  id: number;
  userId: number;
  userName: string | null;
  restaurantId: number;
  rating: number;
  ratingTaste: number | null;
  ratingCleanliness: number | null;
  ratingService: number | null;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type RestaurantDetailRecord = {
  restaurant: RestaurantApiRecord;
  menus: MenuItemRecord[];
  reviews: ReviewItemRecord[];
  ratingSummary: {
    averageRating: number | null;
    reviewCount: number;
  };
};

export type RestaurantSearchResult = RestaurantApiRecord & {
  area?: string | null;
  cleanlinessLevel?: number | null;
  languages?: string | null;
};

export type RestaurantCreatePayload = Omit<
  RestaurantApiRecord,
  "id" | "ownerId" | "averageRating" | "reviewCount" | "distanceKm"
>;

export const restaurantApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export function restaurantAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/json" };
  const token = getStoredAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchMyRestaurants(): Promise<RestaurantApiRecord[]> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/restaurants`, {
    cache: "no-store",
  });
  const data = await parseJsonResponse<RestaurantApiRecord[]>(res);
  if (!Array.isArray(data)) {
    throw new Error("Invalid restaurants response");
  }
  return data;
}

export async function fetchRestaurant(id: number): Promise<RestaurantApiRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/restaurants/${id}`, {
    cache: "no-store",
  });
  return parseJsonResponse(res);
}

export async function fetchRestaurantDetail(
  id: number,
): Promise<RestaurantDetailRecord> {
  const res = await fetch(`${restaurantApiBaseUrl}/restaurants/${id}/detail`, {
    cache: "no-store",
  });
  return parseJsonResponse(res);
}

export async function searchRestaurants(
  form: SearchFormState,
  geo?: GeoSearchParams,
): Promise<RestaurantSearchResult[]> {
  const query = buildRestaurantSearchParams(form, geo);
  const res = await fetch(
    `${restaurantApiBaseUrl}/restaurants/search?${query.toString()}`,
    { cache: "no-store" },
  );
  return parseJsonResponse(res);
}

export async function createRestaurant(
  body: Partial<RestaurantCreatePayload> & { name: string; address: string },
): Promise<RestaurantApiRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/restaurants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

export async function updateRestaurant(
  id: number,
  body: Partial<RestaurantCreatePayload>,
): Promise<RestaurantApiRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/restaurants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}
