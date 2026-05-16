import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { restaurantApiBaseUrl } from "./restaurant-api";

export type CreateReviewPayload = {
  restaurantId: number;
  rating: number;
  comment?: string | null;
  imageUrl?: string | null;
};

export async function createReview(
  payload: CreateReviewPayload,
): Promise<void> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await parseJsonResponse(res);
}
