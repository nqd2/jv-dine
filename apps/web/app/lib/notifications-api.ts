import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { restaurantApiBaseUrl } from "./restaurant-api";

export type NotificationRecord = {
  id: number;
  userId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export async function fetchMyNotifications(): Promise<NotificationRecord[]> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/notifications/me`, {
    cache: "no-store",
  });
  return parseJsonResponse(res);
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await fetchWithAuth(
    `${restaurantApiBaseUrl}/notifications/me/unread-count`,
    { cache: "no-store" },
  );
  const data = await parseJsonResponse<{ count: number }>(res);
  return data.count;
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = await fetchWithAuth(
    `${restaurantApiBaseUrl}/notifications/me/read-all`,
    { method: "PATCH" },
  );
  const data = await parseJsonResponse<{ updated: number }>(res);
  return data.updated;
}

export async function markNotificationRead(id: number): Promise<void> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isRead: true }),
  });
  if (!res.ok) {
    throw new Error(`Failed to mark notification read (${res.status})`);
  }
}

/** Extract coupon code from notification content if present. */
export function extractCouponCode(content: string): string | null {
  const match = content.match(/(?:クーポン|Mã giảm giá)[:\s]+([A-Z0-9_-]+)/i);
  return match?.[1] ?? null;
}

/** Extract restaurant id hint from content — fallback null. */
export function extractRestaurantName(content: string): string | null {
  const match = content.match(/^\[([^\]]+)\]/);
  return match?.[1] ?? null;
}
