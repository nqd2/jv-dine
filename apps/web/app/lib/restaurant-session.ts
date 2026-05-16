const SELECTED_RESTAURANT_KEY = "jvdine-selected-restaurant-id";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage;
}

export function setSelectedRestaurantId(id: number): void {
  const storage = getSessionStorage();
  if (!storage || !Number.isInteger(id) || id <= 0) {
    return;
  }
  storage.setItem(SELECTED_RESTAURANT_KEY, String(id));
}

export function getSelectedRestaurantId(): number | null {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(SELECTED_RESTAURANT_KEY);
  if (!raw) {
    return null;
  }
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    storage.removeItem(SELECTED_RESTAURANT_KEY);
    return null;
  }
  return id;
}

export function clearSelectedRestaurantId(): void {
  const storage = getSessionStorage();
  storage?.removeItem(SELECTED_RESTAURANT_KEY);
}
