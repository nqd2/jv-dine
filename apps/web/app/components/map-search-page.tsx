"use client";

import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { Filter, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

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
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";
import { Card } from "./ui/card";

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
  },
};

function MapSearchInner({
  language,
  form,
  setForm,
  center,
  setCenter,
  radiusKm,
  setRadiusKm,
  mapId,
}: {
  language: Language;
  form: SearchFormState;
  setForm: (f: SearchFormState) => void;
  center: { lat: number; lng: number };
  setCenter: (c: { lat: number; lng: number }) => void;
  radiusKm: string;
  setRadiusKm: (v: string) => void;
  mapId: string;
}) {
  const copy = COPY[language];
  const map = useMap();
  const [results, setResults] = useState<RestaurantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const selectedRestaurant =
    results.find((restaurant) => restaurant.id === selectedId) ?? null;

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
        if (signal?.aborted) {
          return;
        }
        setResults([]);
      } finally {
        if (signal?.aborted) {
          return;
        }
        setLoading(false);
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

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return;
    }
    const el = document.getElementById("map-place-input") as HTMLInputElement | null;
    if (!el || !window.google?.maps?.places) {
      return;
    }
    const ac = new google.maps.places.Autocomplete(el, {
      componentRestrictions: { country: "vn" },
      fields: ["geometry"],
    });
    const listener = ac.addListener("place_changed", () => {
      const loc = ac.getPlace().geometry?.location;
      if (loc) {
        const next = { lat: loc.lat(), lng: loc.lng() };
        setCenter(next);
        map?.panTo(next);
      }
    });
    return () => listener.remove();
  }, [map, setCenter]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-label">
              {copy.placePlaceholder}
            </label>
            <input
              id="map-place-input"
              className="h-[50px] w-full rounded-lg border border-border-input px-3"
              placeholder={copy.placePlaceholder}
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
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI
        >
          {results.map((r) =>
            r.lat !== null && r.long !== null ? (
              <AdvancedMarker
                key={r.id}
                position={{ lat: r.lat, lng: r.long }}
                onClick={() => setSelectedId(r.id)}
              />
            ) : null,
          )}
          {selectedRestaurant &&
          selectedRestaurant.lat !== null &&
          selectedRestaurant.long !== null ? (
            <InfoWindow
              position={{
                lat: selectedRestaurant.lat,
                lng: selectedRestaurant.long,
              }}
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="max-w-52">
                <p className="font-semibold text-title">
                  {selectedRestaurant.name}
                </p>
                <p className="mt-1 text-xs text-subtitle">
                  {selectedRestaurant.address}
                </p>
                {selectedRestaurant.distanceKm != null ? (
                  <p className="mt-1 text-xs text-caption">
                    {selectedRestaurant.distanceKm.toFixed(1)} {copy.km}
                  </p>
                ) : null}
                <Link
                  href={`/restaurants/${selectedRestaurant.id}`}
                  className="mt-2 inline-flex rounded bg-primary px-3 py-1.5 text-xs font-medium text-white"
                >
                  {copy.viewDetail}
                </Link>
              </div>
            </InfoWindow>
          ) : null}
        </Map>
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
  );
}

export function MapSearchPage() {
  const searchParams = useSearchParams();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];

  const [form, setForm] = useState<SearchFormState>(() =>
    searchParams
      ? searchFormFromQuery(new URLSearchParams(searchParams.toString()))
      : INITIAL_SEARCH_FORM,
  );
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState("2");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "";
  const missingConfig = !apiKey || !mapId;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/" />}
        end={
          <Link href="/" className="text-sm font-semibold text-primary">
            {copy.home}
          </Link>
        }
      />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="mb-6 text-2xl font-bold text-title">{copy.title}</h1>
        {!missingConfig ? (
          <APIProvider apiKey={apiKey} libraries={["places"]}>
            <MapSearchInner
              language={language}
              form={form}
              setForm={setForm}
              center={center}
              setCenter={setCenter}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              mapId={mapId}
            />
          </APIProvider>
        ) : (
          <p className="text-rose-700">
            Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or
            NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
          </p>
        )}
      </main>
    </div>
  );
}
