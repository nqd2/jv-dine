import type { Language } from "./jvdine-language";
import { fetchWithAuth, parseJsonResponse } from "./api-client";
import { restaurantApiBaseUrl } from "./restaurant-api";

export type MenuApiRecord = {
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

export type MenuPayload = {
  restaurantId: number;
  itemName: string;
  nameVn?: string | null;
  description?: string | null;
  price: number;
  isJapaneseFriendly?: boolean;
  warningTags?: string | null;
  imageUrl?: string | null;
};

export const ALLERGEN_TAG_KEYS = [
  "spicy",
  "mam",
  "peanuts",
  "seafood",
] as const;

export type AllergenTagKey = (typeof ALLERGEN_TAG_KEYS)[number];

/** @deprecated Use ALLERGEN_TAG_KEYS */
export const ALLERGEN_TAGS = ALLERGEN_TAG_KEYS;

const LEGACY_TAG_TO_KEY: Record<string, AllergenTagKey> = {
  辛い: "spicy",
  マム: "mam",
  ピーナッツ: "peanuts",
  シーフード: "seafood",
};

const ALLERGEN_LABELS: Record<Language, Record<AllergenTagKey, string>> = {
  JP: {
    spicy: "辛い",
    mam: "マム",
    peanuts: "ピーナッツ",
    seafood: "シーフード",
  },
  VN: {
    spicy: "Cay",
    mam: "Mắm",
    peanuts: "Đậu phộng",
    seafood: "Hải sản",
  },
};

export function normalizeAllergenTag(raw: string): AllergenTagKey | null {
  const trimmed = raw.trim();
  if ((ALLERGEN_TAG_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as AllergenTagKey;
  }
  return LEGACY_TAG_TO_KEY[trimmed] ?? null;
}

export function getAllergenLabel(
  key: AllergenTagKey,
  language: Language,
): string {
  return ALLERGEN_LABELS[language][key];
}

export function parseWarningTags(raw: string | null): AllergenTagKey[] {
  if (!raw?.trim()) {
    return [];
  }
  const keys = raw
    .split(/[,、/]/)
    .map((t) => normalizeAllergenTag(t))
    .filter((k): k is AllergenTagKey => k !== null);
  return [...new Set(keys)];
}

export function serializeWarningTags(tags: AllergenTagKey[]): string | null {
  const unique = [...new Set(tags.filter(Boolean))];
  return unique.length > 0 ? unique.join(",") : null;
}

export function formatWarningTags(
  raw: string | null,
  language: Language,
): string {
  return parseWarningTags(raw)
    .map((key) => getAllergenLabel(key, language))
    .join(", ");
}

export async function fetchMenusByRestaurant(
  restaurantId: number,
): Promise<MenuApiRecord[]> {
  const res = await fetchWithAuth(
    `${restaurantApiBaseUrl}/menus/restaurant/${restaurantId}`,
    { cache: "no-store" },
  );
  return parseJsonResponse(res);
}

export async function createMenu(payload: MenuPayload): Promise<MenuApiRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/menus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

export async function updateMenu(
  id: number,
  payload: Partial<MenuPayload>,
): Promise<MenuApiRecord> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/menus/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

export async function deleteMenu(id: number): Promise<void> {
  const res = await fetchWithAuth(`${restaurantApiBaseUrl}/menus/${id}`, {
    method: "DELETE",
  });
  await parseJsonResponse(res);
}
