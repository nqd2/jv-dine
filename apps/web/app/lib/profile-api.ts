import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { restaurantApiBaseUrl } from "./restaurant-api";

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  allergyInfo: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  reviewCount?: number;
  favoritesCount?: number;
};

export type UpdateProfilePayload = {
  username?: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};

export async function fetchMyProfile(): Promise<UserProfile> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/users/me`, {
    cache: "no-store",
  });
  return parseJsonResponse(res);
}

export async function updateProfile(
  id: number,
  body: UpdateProfilePayload,
): Promise<UserProfile> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}
