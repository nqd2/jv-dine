import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistAuthSession,
  type AuthTokens,
  type StoredUser,
} from "./auth-session";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type AuthResponsePayload = {
  user: StoredUser;
  tokens: AuthTokens & { tokenType?: string; expiresIn?: string };
};

let refreshInFlight: Promise<string | null> | null = null;

export function resolveReturnUrl(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }
  return raw;
}

export async function parseApiError(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }
    if (Array.isArray(body.message)) {
      const joined = body.message
        .filter((m): m is string => typeof m === "string")
        .join(", ");
      if (joined) {
        return joined;
      }
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as AuthResponsePayload;
      const rememberMe =
        typeof window !== "undefined" &&
        window.localStorage.getItem("jvdine-access-token") !== null;
      persistAuthSession(data.user, data.tokens, rememberMe);
      return data.tokens.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function fetchWithAuth(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  const token = getStoredAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(input, { ...init, headers });
  if (res.status !== 401) {
    return res;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    clearStoredSession();
    if (typeof window !== "undefined") {
      const returnUrl = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      );
      window.location.assign(`/login?returnUrl=${returnUrl}`);
    }
    return res;
  }

  headers.set("Authorization", `Bearer ${newToken}`);
  res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    clearStoredSession();
    if (typeof window !== "undefined") {
      const returnUrl = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      );
      window.location.assign(`/login?returnUrl=${returnUrl}`);
    }
  }
  return res;
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return (await res.json()) as T;
}
