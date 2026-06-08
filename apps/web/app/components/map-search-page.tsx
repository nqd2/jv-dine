"use client";

import dynamic from "next/dynamic";
import { Filter, LogIn, LogOut, MapPin, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, useRef } from "react";

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

const MapSearchMap = dynamic(
  () => import("./map-search-map").then((mod) => mod.MapSearchMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted-surface" />
    ),
  },
);

const DEFAULT_CENTER = { lat: 21.0285, lng: 105.8542 };
const RADIUS_OPTIONS = ["1", "2", "5", "10"] as const;

type FilterState = {
  areas: string[];
  minBudget: string;
  maxBudget: string;
  cuisines: string[];
};

const INITIAL_FILTERS: FilterState = {
  areas: [],
  minBudget: "",
  maxBudget: "",
  cuisines: [],
};

type CopyType = {
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
  filterTitle: string;
  area: string;
  budget: string;
  minBudget: string;
  maxBudget: string;
  cuisine: string;
  reset: string;
  apply: string;
  restaurantCount: (count: number) => string;
  areas: Record<string, string>;
  cuisines: Record<string, string>;
};

const COPY: Record<Language, CopyType> = {
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
    filterTitle: "フィルター",
    area: "エリア",
    budget: "予算 (VND)",
    minBudget: "最低価格",
    maxBudget: "最高価格",
    cuisine: "料理",
    reset: "リセット",
    apply: "適用",
    restaurantCount: (count) => `${count}件のレストラン`,
    areas: {
      "Hoàn Kiếm": "ホアンキエム",
      "Ba Đình": "バーディン",
      "Hai Bà Trưng": "ハイバーチュン",
      "Đống Đa": "ドンダー",
      "Tây Hồ": "タイホー",
      "Cầu Giấy": "カウザイ",
    },
    cuisines: {
      "Vietnamese": "ベトナム料理",
      "Seafood": "海鮮",
      "Vegetarian": "ベジタリアン",
      "Thai": "タイ料理",
    },
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
    filterTitle: "Bộ lọc",
    area: "Khu vực",
    budget: "Ngân sách (VND)",
    minBudget: "Thấp nhất",
    maxBudget: "Cao nhất",
    cuisine: "Ẩm thực",
    reset: "Đặt lại",
    apply: "Áp dụng",
    restaurantCount: (count) => `${count} nhà hàng`,
    areas: {
      "Hoàn Kiếm": "Hoàn Kiếm",
      "Ba Đình": "Ba Đình",
      "Hai Bà Trưng": "Hai Bà Trưng",
      "Đống Đa": "Đống Đa",
      "Tây Hồ": "Tây Hồ",
      "Cầu Giấy": "Cầu Giấy",
    },
    cuisines: {
      "Vietnamese": "Món Việt Nam",
      "Seafood": "Hải sản",
      "Vegetarian": "Món chay",
      "Thai": "Món Thái",
    },
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

  // Filters State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterState>(INITIAL_FILTERS);

  const dialogRef = useRef<HTMLDialogElement>(null);

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

  // Dialog backdrop-click and Esc listener logic for compatibility (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      setIsFilterModalOpen(false);
    };
    dialog.addEventListener("close", handleClose);

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isDialogContent) {
        dialog.close();
      }
    };
    dialog.addEventListener("click", handleBackdropClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, []);

  // Sync open state with HTML5 dialog Ref
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isFilterModalOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isFilterModalOpen]);

  // Auto-scroll selected card in the sidebar list when marker is clicked on the map
  useEffect(() => {
    if (selectedId !== null) {
      const cardEl = document.getElementById(`restaurant-card-${selectedId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedId]);

  // Client-side filtering logic
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // 1. Area matching (OR matching)
      if (activeFilters.areas.length > 0) {
        if (!r.area) return false;
        const match = activeFilters.areas.some(
          (a) => r.area?.toLowerCase() === a.toLowerCase()
        );
        if (!match) return false;
      }

      // 2. Budget min matching
      if (activeFilters.minBudget) {
        const minVal = Number(activeFilters.minBudget);
        const minInVnd = minVal < 10000 ? minVal * 1000 : minVal;
        if (r.maxBudget && Number(r.maxBudget) < minInVnd) {
          return false;
        }
      }

      // 3. Budget max matching
      if (activeFilters.maxBudget) {
        const maxVal = Number(activeFilters.maxBudget);
        const maxInVnd = maxVal < 10000 ? maxVal * 1000 : maxVal;
        if (r.minBudget && Number(r.minBudget) > maxInVnd) {
          return false;
        }
      }

      // 4. Cuisine matching (OR matching)
      if (activeFilters.cuisines.length > 0) {
        if (!r.cuisine) return false;
        const cuisineText = r.cuisine.toLowerCase();
        const match = activeFilters.cuisines.some((c) => {
          if (c === "Vietnamese") {
            return (
              cuisineText.includes("phở") ||
              cuisineText.includes("bún") ||
              cuisineText.includes("việt") ||
              cuisineText.includes("viet")
            );
          }
          if (c === "Seafood") {
            return (
              cuisineText.includes("hải sản") ||
              cuisineText.includes("seafood") ||
              cuisineText.includes("海鮮")
            );
          }
          if (c === "Vegetarian") {
            return (
              cuisineText.includes("chay") ||
              cuisineText.includes("vegetarian") ||
              cuisineText.includes("ベジ")
            );
          }
          if (c === "Thai") {
            return (
              cuisineText.includes("thái") ||
              cuisineText.includes("thai") ||
              cuisineText.includes("タイ")
            );
          }
          return cuisineText.includes(c.toLowerCase());
        });
        if (!match) return false;
      }

      return true;
    });
  }, [results, activeFilters]);

  // Form checkboxed triggers in Modal popup
  const toggleArea = (area: string) => {
    setTempFilters((prev) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area],
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setTempFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const setMinBudget = (val: string) => {
    setTempFilters((prev) => ({ ...prev, minBudget: val }));
  };

  const setMaxBudget = (val: string) => {
    setTempFilters((prev) => ({ ...prev, maxBudget: val }));
  };

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground overflow-hidden">
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

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Scrollable Sidebar */}
        <div className="w-full md:w-[380px] shrink-0 border-r border-border-input/60 bg-white flex flex-col h-[50%] md:h-full overflow-hidden shadow-sm z-10">
          {/* Search controls */}
          <div className="p-4 border-b border-border-input/60 space-y-3 bg-white">
            <h1 className="text-xl font-bold text-title">{copy.title}</h1>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-caption pointer-events-none" />
              <PlaceAutocompleteInput
                id="map-place-input"
                value={placeQuery}
                placeholder={copy.placePlaceholder}
                className="h-10 w-full rounded-lg border border-border-input bg-white pl-9 pr-3 text-sm outline-none placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-caption pointer-events-none" />
                <input
                  className="h-10 w-full rounded-lg border border-border-input bg-white pl-9 pr-3 text-sm outline-none placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                  placeholder="Keyword"
                  value={form.keyword}
                  onChange={(ev) => setForm({ ...form, keyword: ev.target.value })}
                />
              </div>
              <div className="w-[100px] shrink-0">
                <select
                  value={radiusKm}
                  onChange={(ev) => setRadiusKm(ev.target.value)}
                  className="h-10 w-full rounded-lg border border-border-input bg-white px-2 text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r} {copy.km}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Count and Filter Button header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-input/60 bg-white">
            <span className="text-sm font-semibold text-subtitle">
              {copy.restaurantCount(filteredResults.length)}
            </span>
            <button
              type="button"
              onClick={() => {
                setTempFilters(activeFilters);
                setIsFilterModalOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-input bg-white px-3 text-xs font-semibold text-title hover:bg-muted-surface transition-colors"
            >
              <Filter className="size-3.5 text-caption" aria-hidden />
              {copy.filters}
            </button>
          </div>

          {/* Scrollable list of cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6f7f9]">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-24 bg-white rounded-xl border border-black/[0.06] animate-pulse" />
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-10 text-center text-subtitle">
                {copy.empty}
              </div>
            ) : (
              filteredResults.map((r) => (
                <div
                  key={r.id}
                  id={`restaurant-card-${r.id}`}
                  onClick={() => {
                    setSelectedId(r.id);
                    if (r.lat !== null && r.long !== null) {
                      setCenter({ lat: r.lat, lng: r.long });
                    }
                  }}
                  className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedId === r.id
                      ? "ring-2 ring-primary bg-[#BEE3BA] border-emerald-500 shadow-sm"
                      : "bg-white border-black/[0.06] hover:shadow-md hover:border-black/[0.12]"
                  }`}
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted-surface shrink-0">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-caption font-semibold bg-muted-surface">
                        JVDine
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-title truncate">{r.name}</h3>
                      <p className="text-xs text-subtitle flex items-start gap-1 mt-1">
                        <MapPin className="size-3.5 mt-0.5 shrink-0 text-caption" />
                        <span className="truncate">{r.address}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-caption font-medium">
                        {r.cuisine || ""}
                      </span>
                      <Link
                        href={`/restaurants/${r.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {copy.viewDetail}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Map Area */}
        <div className="flex-1 h-[50%] md:h-full relative z-0">
          <MapSearchMap
            center={center}
            results={filteredResults}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            viewDetailLabel={copy.viewDetail}
            kmLabel={copy.km}
          />
        </div>
      </main>

      {/* Filter Modal Dialog Popup */}
      <dialog
        ref={dialogRef}
        closedby="any"
        className="rounded-2xl border-0 p-0 shadow-modal max-w-md w-[90%] outline-none overflow-hidden bg-white animate-in fade-in zoom-in-95 duration-200 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-input/60">
          <h2 className="text-base font-bold text-title">{copy.filterTitle}</h2>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(false)}
            className="p-1.5 rounded-full text-subtitle hover:bg-muted-surface transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Area Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-title">{copy.area}</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Hoàn Kiếm", "Ba Đình", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", "Cầu Giấy"].map((area) => (
                <label
                  key={area}
                  className="flex items-center gap-2 text-sm text-label cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.areas.includes(area)}
                    onChange={() => toggleArea(area)}
                    className="rounded text-primary focus:ring-primary size-4"
                  />
                  {language === "JP" ? copy.areas[area] || area : area}
                </label>
              ))}
            </div>
          </div>

          {/* Budget Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-title">{copy.budget}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-caption mb-1">
                  {copy.minBudget} (kVND)
                </label>
                <input
                  type="number"
                  value={tempFilters.minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border-input bg-white px-3 text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-caption mb-1">
                  {copy.maxBudget} (kVND)
                </label>
                <input
                  type="number"
                  value={tempFilters.maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border-input bg-white px-3 text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Cuisine Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-title">{copy.cuisine}</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Vietnamese", "Seafood", "Vegetarian", "Thai"].map((cuisine) => (
                <label
                  key={cuisine}
                  className="flex items-center gap-2 text-sm text-label cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.cuisines.includes(cuisine)}
                    onChange={() => toggleCuisine(cuisine)}
                    className="rounded text-primary focus:ring-primary size-4"
                  />
                  {language === "JP" ? copy.cuisines[cuisine] || cuisine : copy.cuisines[cuisine] || cuisine}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border-input/60 bg-muted-surface">
          <button
            type="button"
            onClick={() => setTempFilters(INITIAL_FILTERS)}
            className="px-4 py-2 text-sm font-semibold text-subtitle hover:text-title transition-colors"
          >
            {copy.reset}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveFilters(tempFilters);
              setIsFilterModalOpen(false);
            }}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors"
          >
            {copy.apply}
          </button>
        </div>
      </dialog>
    </div>
  );
}

