export type StoredUser = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
};

const ACCESS_TOKEN_KEY = "jvdine-access-token";
const REFRESH_TOKEN_KEY = "jvdine-refresh-token";
const USER_KEY = "jvdine-user";
const SESSION_EVENT = "jvdine-session-change";

function getStoragePairs(): Storage[] {
  if (typeof window === "undefined") {
    return [];
  }

  return [window.localStorage, window.sessionStorage];
}

/** String snapshot cho `useSyncExternalStore` — cùng nội dung storage ⇒ cùng giá trị so sánh được, không tạo object mới mỗi render. */
export function getStoredUserRawSnapshot(): string {
  for (const storage of getStoragePairs()) {
    const raw = storage.getItem(USER_KEY);
    if (raw) {
      return raw;
    }
  }
  return "";
}

export function getServerStoredUserRawSnapshot(): string {
  return "";
}

/** Đọc user đã parse (imperative). Không dùng trực tiếp làm `getSnapshot` của useSyncExternalStore. */
export function getStoredUser(): StoredUser | null {
  const raw = getStoredUserRawSnapshot();
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    for (const storage of getStoragePairs()) {
      if (storage.getItem(USER_KEY)) {
        storage.removeItem(USER_KEY);
      }
    }
    return null;
  }
}

/** Gọi sau khi code gán token/user vào storage (cùng tab không có sự kiện `storage`). */
export function notifyStoredSessionUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

export function clearStoredSession() {
  for (const storage of getStoragePairs()) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_KEY);
  }

  notifyStoredSessionUpdated();
}

export function subscribeStoredUser(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
  };
}
