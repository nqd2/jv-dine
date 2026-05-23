import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { restaurantApiBaseUrl } from "./restaurant-api";

export type CouponRecord = {
  id: number;
  restaurantId: number;
  code: string;
  discountRate: number;
  nameJa: string | null;
  nameVn: string | null;
  descriptionJa: string | null;
  descriptionVn: string | null;
  discountType: string;
  discountValue: number;
  startDate: string | null;
  expiryDate: string;
  usageLimit: number | null;
  status: string;
  viewsCount: number;
  usagesCount: number;
};

export type CouponStats = {
  total: number;
  active: number;
  paused: number;
  totalViews: number;
  totalUsages: number;
};

export type CreateCouponPayload = {
  restaurantId: number;
  code: string;
  nameJa: string;
  nameVn: string;
  descriptionJa?: string;
  descriptionVn?: string;
  discountType: "percentage" | "amount";
  discountValue: number;
  startDate?: string;
  expiryDate: string;
  usageLimit?: number | null;
};

export async function fetchCouponsByRestaurant(
  restaurantId: number,
): Promise<CouponRecord[]> {
  const res = await fetchWithAuth(
    `${restaurantApiBaseUrl}/coupons/restaurant/${restaurantId}`,
    { cache: "no-store" },
  );
  return parseJsonResponse(res);
}

export async function fetchCouponStats(
  restaurantId: number,
): Promise<CouponStats> {
  const res = await fetchWithAuth(
    `${restaurantApiBaseUrl}/coupons/restaurant/${restaurantId}/stats`,
    { cache: "no-store" },
  );
  return parseJsonResponse(res);
}

export async function createCoupon(
  body: CreateCouponPayload,
): Promise<CouponRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

export async function updateCouponStatus(
  id: number,
  status: "active" | "paused",
): Promise<CouponRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/coupons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parseJsonResponse(res);
}

export async function deleteCoupon(id: number): Promise<void> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/coupons/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Delete failed (${res.status})`);
  }
}

export type AnalyticsPeriod = "week" | "month" | "year";

export type RestaurantAnalytics = {
  viewsCount: number;
  reviewsCount: number;
  averageRating: number | null;
  favoritesCount: number;
  chartPoints: Array<{
    date: string;
    reviewCount: number;
    avgTaste: number | null;
    avgCleanliness: number | null;
    avgService: number | null;
  }>;
  recentReviews: Array<{
    id: number;
    userName: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
  viewsDeltaPercent: number;
  reviewsDeltaPercent: number;
  ratingDeltaPercent: number;
  favoritesDeltaPercent: number;
};

export async function fetchRestaurantAnalytics(
  restaurantId: number,
  period: AnalyticsPeriod,
): Promise<RestaurantAnalytics> {
  const res = await fetchWithAuth(
    `${restaurantApiBaseUrl}/restaurants/${restaurantId}/analytics?period=${period}`,
    { cache: "no-store" },
  );
  return parseJsonResponse(res);
}

export async function recordRestaurantView(restaurantId: number): Promise<void> {
  await fetch(`${restaurantApiBaseUrl}/restaurants/${restaurantId}/view`, {
    method: "POST",
  });
}
