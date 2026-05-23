"use client";

import dynamic from "next/dynamic";
import { Filter, LogIn, LogOut, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  clearStoredSession,
  getServerStoredUserRawSnapshot,
  getStoredUserRawSnapshot,
  subscribeStoredUser,
  type StoredUser,
} from "@lib/auth-session";
import {
  searchRestaurants,
  type RestaurantSearchResult,
} from "@lib/restaurant-api";
import {
  INITIAL_SEARCH_FORM,
  searchFormFromQuery,
  type SearchFormState,
} from "@lib/search-params";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";
import { PlaceAutocompleteInput } from "./ui/place-autocomplete-input";
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";
import { UserNavLinks } from "./user-nav-links";
import { Card } from "./ui/card";

const MapSearchMap = dynamic(
  () => import("./map-search-map").then((mod) => mod.MapSearchMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full animate-pulse bg-muted-surface" />
    ),
  },
);

const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 };
const RADIUS_OPTIONS = ["1", "2", "5", "10"] as const;

const COPY: Record<
  Language,
  {
    title: string;
    placePlaceholder: string;
    radius: string;
    search: string;
    filters: string;
    viewDetail: string;
    empty: string;
    home: string;
    km: string;
    login: string;
    signup: string;
    logout: string;
  }
> = {
  JP: {
    title: "地図で検索",
    placePlaceholder: "滞在予定の場所",
    radius: "半径",
    search: "検索",
    filters: "フィルター",
    viewDetail: "詳細を見る",
    empty: "周辺に店舗が見つかりません",
    home: "ホーム",
    km: "km",
    login: "ログイン",
    signup: "登録",
    logout: "ログアウト",
  },
  VN: {
    title: "Tìm trên bản đồ",
    placePlaceholder: "Bạn sẽ ở đâu?",
    radius: "Bán kính",
    search: "Tìm",
    filters: "Bộ lọc",
    viewDetail: "Xem chi tiết",
    empty: "Không có quán trong bán kính",
    home: "Trang chủ",
    km: "km",
    login: "Đăng nhập",
    signup: "Đăng ký",
    logout: "Đăng xuất",
  },
};

export function MapSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];

  const userSnapshot = useSyncExternalStore(
    subscribeStoredUser,
    getStoredUserRawSnapshot,
    getServerStoredUserRawSnapshot,
  );
  const currentUser = useMemo((): StoredUser | null => {
    if (!userSnapshot) {
      return null;
    }
    try {
      return JSON.parse(userSnapshot) as StoredUser;
    } catch {
      return null;
    }
  }, [userSnapshot]);

  const [form, setForm] = useState<SearchFormState>(() =>
    searchParams
      ? searchFormFromQuery(new URLSearchParams(searchParams.toString()))
      : INITIAL_SEARCH_FORM,
  );
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [placeQuery, setPlaceQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState("2");
  const [results, setResults] = useState<RestaurantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const runSearch = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const rows = await searchRestaurants(form, {
          lat: String(center.lat),
          long: String(center.lng),
          radiusKm,
        });
        if (signal?.aborted) {
          return;
        }
        setResults(rows);
      } catch {
        if (!signal?.aborted) {
          setResults([]);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [center.lat, center.lng, form, radiusKm],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void runSearch(controller.signal);
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [runSearch]);

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={
          <SiteLogoLanguageCluster
            logoHref={currentUser ? "/home" : "/"}
          />
        }
        end={
          currentUser ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <UserNavLinks />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-primary transition-colors hover:bg-rose-50 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
              >
                <LogOut aria-hidden className="size-4" />
                {copy.logout}
              </button>
            </div>
          ) : (
            <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold sm:gap-4">
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-base font-normal text-label transition-colors hover:bg-muted-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
              >
                <LogIn aria-hidden className="size-4" />
                {copy.login}
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-5 text-base font-normal text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
              >
                {copy.signup}
              </Link>
            </nav>
          )
        }
      />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="mb-6 text-2xl font-bold text-title">{copy.title}</h1>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-label">
                  {copy.placePlaceholder}
                </label>
                <PlaceAutocompleteInput
                  id="map-place-input"
                  value={placeQuery}
                  placeholder={copy.placePlaceholder}
                  className="h-[50px] w-full rounded-lg border border-border-input px-3"
                  onChange={(address, coords) => {
                    setPlaceQuery(address);
                    if (coords.lat !== null && coords.lng !== null) {
                      setCenter({ lat: coords.lat, lng: coords.lng });
                    }
                  }}
                  onSelect={(sel) => {
                    setPlaceQuery(sel.address);
                    setCenter({ lat: sel.lat, lng: sel.lng });
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-label">
                  {copy.radius}
                </label>
                <select
                  value={radiusKm}
                  onChange={(ev) => setRadiusKm(ev.target.value)}
                  className="h-[50px] rounded-lg border border-border-input px-3"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r} {copy.km}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="inline-flex h-[50px] items-center gap-2 rounded-lg border border-border-input px-4"
              >
                <Filter className="size-4" aria-hidden />
                {copy.filters}
              </button>
              <button
                type="button"
                onClick={() => void runSearch()}
                className="inline-flex h-[50px] items-center gap-2 rounded-lg bg-primary px-5 text-white"
              >
                <Search className="size-4" aria-hidden />
                {copy.search}
              </button>
            </div>
            {showFilters ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  className="h-11 rounded-lg border border-border-input px-3"
                  placeholder="Keyword"
                  value={form.keyword}
                  onChange={(ev) => setForm({ ...form, keyword: ev.target.value })}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isJapaneseFriendly}
                    onChange={(ev) =>
                      setForm({ ...form, isJapaneseFriendly: ev.target.checked })
                    }
                  />
                  日本人向け / Phù hợp khách Nhật
                </label>
              </div>
            ) : null}
          </Card>

          <div className="sticky top-0 z-10 h-[320px] overflow-hidden rounded-[10px] border border-border-input">
            <MapSearchMap
              center={center}
              results={results}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              viewDetailLabel={copy.viewDetail}
              kmLabel={copy.km}
            />
          </div>

          {loading ? <p className="text-subtitle">…</p> : null}
          {!loading && results.length === 0 ? (
            <p className="text-subtitle">{copy.empty}</p>
          ) : null}
          <ul className="grid gap-4 sm:grid-cols-2">
            {results.map((r) => (
              <li key={r.id}>
                <Card
                  className={[
                    "p-4 transition-shadow",
                    selectedId === r.id ? "ring-2 ring-primary" : "",
                  ].join(" ")}
                >
                  <p className="font-bold text-title">{r.name}</p>
                  <p className="mt-1 flex items-start gap-1 text-sm text-subtitle">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {r.address}
                  </p>
                  {r.distanceKm != null ? (
                    <p className="mt-1 text-xs text-caption">
                      {r.distanceKm.toFixed(1)} {copy.km}
                    </p>
                  ) : null}
                  <Link
                    href={`/restaurants/${r.id}`}
                    className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                  >
                    {copy.viewDetail}
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
