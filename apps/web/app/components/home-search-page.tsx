"use client";

import {
  Filter,
  Heart,
  Languages,
  LogIn,
  LogOut,
  MapPin,
  MapPinned,
  Search,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  clearStoredSession,
  getServerStoredUserRawSnapshot,
  getStoredUserRawSnapshot,
  subscribeStoredUser,
  type StoredUser,
} from "@lib/auth-session";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";
import {
  buildRestaurantSearchParams,
  INITIAL_SEARCH_FORM,
  type SearchFormState,
} from "@lib/search-params";
import { Card } from "./ui/card";
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";

type ViewerMode = "guest" | "user";

type RestaurantSearchResult = {
  id: number;
  ownerId: number;
  name: string;
  area: string | null;
  address: string;
  workingHours: string | null;
  minBudget: string | null;
  maxBudget: string | null;
  hasAirConditioner: boolean;
  isJapaneseFriendly: boolean;
  cleanlinessLevel: number | null;
  languages: string | null;
  lat: number | null;
  long: number | null;
  imageUrl?: string | null;
};

type HomeCopy = {
  heroTitle: string;
  heroLead: string;
  login: string;
  signup: string;
  logout: string;
  profile: string;
  keywordPlaceholder: string;
  area: string;
  budgetMinPlaceholder: string;
  budgetMaxPlaceholder: string;
  budgetSection: string;
  cuisine: string;
  language: string;
  anyLanguage: string;
  cleanliness: string;
  anyCleanliness: string;
  airConditioner: string;
  japaneseFriendly: string;
  search: string;
  searchOnMap: string;
  mapSearchHint: string;
  recommended: string;
  filterMore: string;
  resultCount: (count: number) => string;
  empty: string;
  guestHint: string;
  userHint: string;
  loading: string;
  nameFallback: string;
  locationFallback: string;
  footerBannerTitle: string;
  footerBannerSubtitle: string;
  filters: {
    areas: Array<{ label: string; value: string }>;
    languages: Array<{ label: string; value: string }>;
    cuisines: Array<{ label: string; value: string }>;
  };
};

const HOME_COPY: Record<Language, HomeCopy> = {
  JP: {
    heroTitle: "ハノイのベトナム料理店を探そう",
    heroLead:
      "エリアや予算、料理のひとことを選んで検索できます。ログインなくても始められます。",
    login: "ログイン",
    signup: "登録",
    logout: "ログアウト",
    profile: "プロフィール",
    keywordPlaceholder: "レストラン、料理を検索",
    area: "エリア",
    budgetSection: "予算",
    budgetMinPlaceholder: "最低価格 (kVND)",
    budgetMaxPlaceholder: "最高価格 (kVND)",
    cuisine: "料理",
    language: "言語",
    anyLanguage: "指定なし",
    cleanliness: "清潔さ",
    anyCleanliness: "指定なし",
    airConditioner: "エアコンあり",
    japaneseFriendly: "日本人向け",
    search: "検索",
    searchOnMap: "地図で検索",
    mapSearchHint: "地図検索画面へ",
    recommended: "おすすめのレストラン",
    filterMore: "フィルター",
    resultCount: (count) => `${count}件の候補`,
    empty: "見つかりませんでした",
    guestHint:
      "レビューやお気に入りにはログインが必要です（現在は検索のみ）。",
    userHint: "ログイン中の状態で検索できます。",
    loading: "検索中...",
    nameFallback: "名称未設定",
    locationFallback: "エリア未設定",
    footerBannerTitle: "もっと条件で絞り込みますか？",
    footerBannerSubtitle:
      "ログインするとおすすめや保存機能を順次ご利用いただけるようになります。",
    filters: {
      areas: [
        { label: "すべて", value: "" },
        { label: "Ba Dinh", value: "Ba Đình" },
        { label: "Hoan Kiem", value: "Hoàn Kiếm" },
        { label: "Hai Ba Trung", value: "Hai Bà Trưng" },
        { label: "Dong Da", value: "Đống Đa" },
        { label: "Cau Giay", value: "Cầu Giấy" },
      ],
      cuisines: [
        { label: "指定なし", value: "" },
        { label: "Phở", value: "Phở" },
        { label: "Bún chả", value: "Bún chả" },
        { label: "Pizza / 西洋料理", value: "Pizza" },
        { label: "日本食に近い", value: "Nhật" },
      ],
      languages: [
        { label: "日本語", value: "Tiếng Nhật" },
        { label: "ベトナム語", value: "Tiếng Việt" },
        { label: "英語", value: "Tiếng Anh" },
      ],
    },
  },
  VN: {
    heroTitle: "Khám phá nhà hàng Việt Nam tại Hà Nội",
    heroLead:
      "Chọn khu vực, ngân sách và gợi ý món để lọc nhanh. Bạn không cần đăng nhập để tìm kiếm.",
    login: "Đăng nhập",
    signup: "Đăng ký",
    logout: "Đăng xuất",
    profile: "Hồ sơ",
    keywordPlaceholder: "Tên quán, loại món",
    area: "Khu vực",
    budgetSection: "Ngân sách",
    budgetMinPlaceholder: "Tối thiểu (kVND)",
    budgetMaxPlaceholder: "Tối đa (kVND)",
    cuisine: "Ẩm thực",
    language: "Ngôn ngữ",
    anyLanguage: "Không chọn",
    cleanliness: "Độ sạch",
    anyCleanliness: "Không chọn",
    airConditioner: "Có điều hòa",
    japaneseFriendly: "Phù hợp khách Nhật",
    search: "Tìm kiếm",
    searchOnMap: "Tìm trên bản đồ",
    mapSearchHint: "Mở tìm trên bản đồ",
    recommended: "Gợi ý nhà hàng",
    filterMore: "Bộ lọc thêm",
    resultCount: (count) => `${count} kết quả`,
    empty: "Không tìm thấy nhà hàng phù hợp",
    guestHint:
      "Đăng nhập để dùng thêm đánh giá và lưu yêu thích (đang làm tiếp).",
    userHint: "Đang đăng nhập — tiếp tục khám phá danh sách.",
    loading: "Đang tải…",
    nameFallback: "Chưa cập nhật",
    locationFallback: "Chưa có quận",
    footerBannerTitle: "Cần thêm điều kiện lọc?",
    footerBannerSubtitle:
      "Dùng \"Bộ lọc thêm\" cho ngôn ngữ nhân viên, độ sạch và tiện nghi.",
    filters: {
      areas: [
        { label: "Tất cả", value: "" },
        { label: "Ba Đình", value: "Ba Đình" },
        { label: "Hoàn Kiếm", value: "Hoàn Kiếm" },
        { label: "Hai Bà Trưng", value: "Hai Bà Trưng" },
        { label: "Đống Đa", value: "Đống Đa" },
        { label: "Cầu Giấy", value: "Cầu Giấy" },
      ],
      cuisines: [
        { label: "Không chọn", value: "" },
        { label: "Phở", value: "Phở" },
        { label: "Bún chả", value: "Bún chả" },
        { label: "Pizza / Tây", value: "Pizza" },
        { label: "Món Nhật / gần Nhật", value: "Nhật" },
      ],
      languages: [
        { label: "Tiếng Nhật", value: "Tiếng Nhật" },
        { label: "Tiếng Việt", value: "Tiếng Việt" },
        { label: "Tiếng Anh", value: "Tiếng Anh" },
      ],
    },
  },
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const INITIAL_FORM_STATE = INITIAL_SEARCH_FORM;

function mergedKeyword(nextForm: SearchFormState): string {
  return [nextForm.keyword, nextForm.cuisine]
    .map((fragment) => fragment.trim())
    .filter(Boolean)
    .join(" ");
}

async function fetchRestaurantResults(nextForm: SearchFormState) {
  const query = new URLSearchParams();
  appendQuery(query, "keyword", mergedKeyword(nextForm));
  appendQuery(query, "area", nextForm.area);
  appendQuery(query, "budgetMin", nextForm.budgetMin);
  appendQuery(query, "budgetMax", nextForm.budgetMax);
  appendQuery(query, "language", nextForm.language);
  appendQuery(query, "cleanlinessLevel", nextForm.cleanlinessLevel);
  if (nextForm.hasAirConditioner) {
    query.set("hasAirConditioner", "true");
  }
  if (nextForm.isJapaneseFriendly) {
    query.set("isJapaneseFriendly", "true");
  }

  const response = await fetch(
    `${apiBaseUrl}/restaurants/search?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }

  const data = (await response.json()) as RestaurantSearchResult[];
  return Array.isArray(data) ? data : [];
}

export function HomeSearchPage({ mode }: { mode: ViewerMode }) {
  const router = useRouter();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = HOME_COPY[language];
  const [form, setForm] = useState<SearchFormState>(INITIAL_FORM_STATE);
  const [results, setResults] = useState<RestaurantSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      setError("");

      try {
        setResults(await fetchRestaurantResults(INITIAL_FORM_STATE));
      } catch {
        setError(copy.empty);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [language, copy.empty]);

  async function runSearch(nextForm: SearchFormState) {
    setIsLoading(true);
    setError("");

    try {
      setResults(await fetchRestaurantResults(nextForm));
    } catch {
      setError(copy.empty);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(form);
  }

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-muted-surface text-foreground">
      <Navbar
        start={
          <SiteLogoLanguageCluster
            logoHref={mode === "guest" ? "/" : "/home"}
          />
        }
        end={
          mode === "guest" ? (
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
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full bg-muted-surface px-3 py-2 font-semibold text-label">
                {copy.profile}: {currentUser?.username ?? currentUser?.email ?? "User"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-primary transition-colors hover:bg-rose-50 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
              >
                <LogOut aria-hidden className="size-4" />
                {copy.logout}
              </button>
            </div>
          )
        }
      />

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-6 sm:px-8 sm:pt-8 lg:pb-28">
        <section className="overflow-hidden rounded-[14px] bg-gradient-to-r from-primary to-[color:var(--color-hero-gradient-end)] px-7 pb-11 pt-11 text-white shadow-card sm:px-10">
          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-[15px]">
            {copy.heroLead}
          </p>
        </section>

        <Card
          id="home-search-panel"
          className="relative mt-6 rounded-[10px] border border-black/[0.06] bg-white px-5 py-7 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] sm:mt-8 sm:px-6 lg:py-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="relative min-h-[50px] min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-subtitle" />
                <input
                  value={form.keyword}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      keyword: event.target.value,
                    }))
                  }
                  placeholder={copy.keywordPlaceholder}
                  className="h-[50px] w-full rounded-[10px] border border-border-input bg-white pl-11 pr-4 text-base text-title outline-none transition-[border-color,box-shadow] placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                title={copy.mapSearchHint}
                onClick={() => {
                  const q = buildRestaurantSearchParams(form).toString();
                  router.push(q ? `/map?${q}` : "/map");
                }}
                className="inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-base font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 sm:min-w-[200px]"
              >
                <MapPinned aria-hidden className="size-5" />
                {copy.searchOnMap}
              </button>
            </div>

            <div className="mt-1 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <SelectField
                label={copy.area}
                value={form.area}
                onChange={(value) =>
                  setForm((current) => ({ ...current, area: value }))
                }
                options={copy.filters.areas}
              />
              <div>
                <span className="mb-2 block text-sm font-medium text-label">
                  {copy.budgetSection}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={form.budgetMin}
                    inputMode="numeric"
                    placeholder={copy.budgetMinPlaceholder}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        budgetMin: event.target.value,
                      }))
                    }
                    className="h-[38px] w-full rounded-[10px] border border-border-input bg-white px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                  />
                  <input
                    value={form.budgetMax}
                    inputMode="numeric"
                    placeholder={copy.budgetMaxPlaceholder}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        budgetMax: event.target.value,
                      }))
                    }
                    className="h-[38px] w-full rounded-[10px] border border-border-input bg-white px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                  />
                </div>
              </div>
              <SelectField
                label={copy.cuisine}
                value={form.cuisine}
                onChange={(value) =>
                  setForm((current) => ({ ...current, cuisine: value }))
                }
                options={copy.filters.cuisines}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <button
                type="button"
                aria-expanded={filtersOpen}
                onClick={() =>
                  setFiltersOpen((opened) => {
                    const next = !opened;
                    if (typeof document !== "undefined" && next) {
                      queueMicrotask(() =>
                        document
                          .getElementById("home-search-panel")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          }),
                      );
                    }
                    return next;
                  })
                }
                className="inline-flex h-[42px] w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border-input bg-white px-4 text-base font-medium text-title transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 sm:w-auto"
              >
                <Filter aria-hidden className="size-4" />
                {copy.filterMore}
              </button>
              <button
                type="submit"
                className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[10px] bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 sm:w-auto sm:max-w-md sm:flex-1"
              >
                <Search aria-hidden className="size-4" />
                {copy.search}
              </button>
            </div>

            {filtersOpen ? (
              <div className="space-y-4 border-t border-border-input pt-5">
                <SelectField
                  label={copy.language}
                  value={form.language}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, language: value }))
                  }
                  options={[
                    { label: copy.anyLanguage, value: "" },
                    ...copy.filters.languages,
                  ]}
                />
                <SelectField
                  label={copy.cleanliness}
                  value={form.cleanlinessLevel}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      cleanlinessLevel: value,
                    }))
                  }
                  options={[
                    { label: copy.anyCleanliness, value: "" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" },
                  ]}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleField
                    checked={form.hasAirConditioner}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        hasAirConditioner: checked,
                      }))
                    }
                    icon={<Wind aria-hidden className="size-4 text-primary" />}
                    label={copy.airConditioner}
                  />
                  <ToggleField
                    checked={form.isJapaneseFriendly}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        isJapaneseFriendly: checked,
                      }))
                    }
                    icon={<Languages aria-hidden className="size-4 text-primary" />}
                    label={copy.japaneseFriendly}
                  />
                </div>
              </div>
            ) : null}
          </form>
        </Card>

        <section className="mt-14 sm:mt-16">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-transparent pb-2">
            <h2 className="text-2xl font-bold text-title">{copy.recommended}</h2>
            <button
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => {
                setFiltersOpen(true);
                if (typeof document !== "undefined") {
                  queueMicrotask(() =>
                    document
                      .getElementById("home-search-panel")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                  );
                }
              }}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-border-input bg-white px-4 text-base font-medium text-title transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
            >
              <Filter aria-hidden className="size-4" />
              {copy.filterMore}
            </button>
          </div>
          <p className="mt-2 text-sm text-subtitle">
            {isLoading ? copy.loading : copy.resultCount(results.length)}
          </p>

          {error ? (
            <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-[10px] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
                >
                  <div className="h-48 bg-muted-surface" />
                  <div className="space-y-2 p-4">
                    <div className="h-5 rounded bg-muted-surface/80" />
                    <div className="h-4 rounded bg-muted-surface/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card className="mt-8 border border-dashed border-border-input bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-title">{copy.empty}</p>
              <p className="mt-2 text-sm leading-6 text-subtitle">
                {copy.heroLead}
              </p>
            </Card>
          ) : (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.id}`}
                  className="block"
                >
                  <article
                  className="overflow-hidden rounded-[10px] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative isolate h-48 bg-muted-surface">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name || copy.nameFallback}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted-surface text-sm text-caption">
                        {copy.nameFallback}
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Save"
                      className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      <Heart
                        aria-hidden
                        strokeWidth={1.75}
                        className="size-5 text-title"
                      />
                    </button>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="text-lg font-bold leading-7 text-title">
                        {restaurant.name || copy.nameFallback}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-subtitle">
                        {restaurantSubtitle(restaurant)}
                      </p>
                    </div>
                    <p className="flex items-start gap-2 text-sm leading-5 text-subtitle">
                      <MapPin
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-subtitle"
                      />
                      <span>{restaurant.area ?? copy.locationFallback}</span>
                    </p>
                    <div className="flex items-center justify-between gap-2 border-t border-border-input/60 pt-3 text-sm text-subtitle">
                      <span className="tabular-nums text-label">
                        {restaurant.workingHours ?? ""}
                      </span>
                      <span className="font-semibold tabular-nums text-caption">
                        {formatBudgetBar(restaurant, language)}
                      </span>
                    </div>
                  </div>
                </article></Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16 rounded-[10px] bg-[var(--color-banner-blue)] px-8 py-10 lg:py-14">
          <h3 className="text-xl font-bold text-title">
            {copy.footerBannerTitle}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-subtitle">
            {copy.footerBannerSubtitle}
          </p>
        </section>
      </main>
    </div>
  );
}

function appendQuery(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed !== "") {
    params.set(key, trimmed);
  }
}

function truncateLine(value: string, maxChars: number): string {
  const t = value.trim();
  if (t.length <= maxChars) return t;
  const clip = Math.max(0, maxChars - 1);
  return `${t.slice(0, clip)}\u2026`;
}

/** Second line under the card title — Figma uses a lighter descriptor under the JP name. */
function restaurantSubtitle(restaurant: RestaurantSearchResult): string {
  if (restaurant.languages?.trim()) return restaurant.languages.trim();
  return truncateLine(restaurant.address, 80);
}

/** Right-aligned badge like \"200–500k VND\" in the Figma card footer. */
function formatBudgetBar(
  restaurant: RestaurantSearchResult,
  language: Language,
): string {
  const minRaw = restaurant.minBudget;
  const maxRaw = restaurant.maxBudget;
  const toK = (s: string) => Math.round(Number(s) / 1000);
  const minOk = minRaw !== null && minRaw !== "" && !Number.isNaN(Number(minRaw));
  const maxOk = maxRaw !== null && maxRaw !== "" && !Number.isNaN(Number(maxRaw));

  if (!minOk && !maxOk) {
    return language === "JP" ? "予算未定" : "Chưa rõ giá";
  }
  if (minOk && maxOk) return `${toK(minRaw as string)}-${toK(maxRaw as string)}k VND`;
  if (maxOk) return `${toK(maxRaw as string)}k+ VND`;
  return `${toK(minRaw as string)}k~ VND`;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium leading-5 text-label">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[41px] w-full rounded-[10px] border border-border-input bg-white px-3 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value || "empty"}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  checked,
  onChange,
  icon,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-input bg-white px-3 py-3 text-sm font-medium text-title">
      {icon}
      <span className="flex-1">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-border-input accent-primary"
      />
    </label>
  );
}

