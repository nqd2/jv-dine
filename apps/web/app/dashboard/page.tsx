"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Eye, Heart, Star, Tag, UtensilsCrossed } from "lucide-react";

import { Card } from "../components/ui/card";
import { Navbar } from "../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../components/ui/nav-brand";
import {
  clearStoredSession,
  getServerStoredUserRawSnapshot,
  getStoredUserRawSnapshot,
  subscribeStoredUser,
  type StoredUser,
} from "@lib/auth-session";
import {
  fetchRestaurantAnalytics,
  type AnalyticsPeriod,
  type RestaurantAnalytics,
} from "@lib/coupon-api";
import {
  fetchMyRestaurants,
  type RestaurantApiRecord,
} from "@lib/restaurant-api";
import {
  getSelectedRestaurantId,
  setSelectedRestaurantId,
} from "@lib/restaurant-session";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";

const COPY: Record<
  Language,
  {
    crumb: string;
    logout: string;
    badge: string;
    title: string;
    lead: string;
    myStores: string;
    storesLoadError: string;
    storesEmpty: string;
    editStore: string;
    manageMenu: string;
    manageCoupons: string;
    registerStore: string;
    storeAddress: string;
    forbiddenMessage: string;
    kpiViews: string;
    kpiReviews: string;
    kpiRating: string;
    kpiFavorites: string;
    recentReviews: string;
    quickActions: string;
    performance: string;
    week: string;
    month: string;
    year: string;
    analyticsError: string;
    selectStore: string;
  }
> = {
  JP: {
    crumb: "ダッシュボード",
    logout: "ログアウト",
    badge: "Owner",
    title: "Dashboard",
    lead: "店舗のパフォーマンスとレビューを確認",
    myStores: "自分の店舗",
    storesLoadError: "店舗一覧の取得に失敗しました。",
    storesEmpty: "まだ店舗が登録されていません。",
    editStore: "店舗情報を編集",
    manageMenu: "メニュー管理",
    manageCoupons: "クーポン管理",
    registerStore: "店舗を登録",
    storeAddress: "住所",
    forbiddenMessage:
      "この店舗を編集する権限がありません。ダッシュボードから自分の店舗を選択してください。",
    kpiViews: "総閲覧数",
    kpiReviews: "レビュー数",
    kpiRating: "平均評価",
    kpiFavorites: "お気に入り数",
    recentReviews: "最近のレビュー",
    quickActions: "クイックアクション",
    performance: "パフォーマンス",
    week: "週",
    month: "月",
    year: "年",
    analyticsError: "分析データの取得に失敗しました",
    selectStore: "店舗を選択してください",
  },
  VN: {
    crumb: "Bảng điều khiển",
    logout: "Đăng xuất",
    badge: "Chủ quán",
    title: "Dashboard",
    lead: "Theo dõi hiệu suất và đánh giá cửa hàng",
    myStores: "Cửa hàng của bạn",
    storesLoadError: "Không tải được danh sách quán.",
    storesEmpty: "Chưa có cửa hàng nào.",
    editStore: "Sửa thông tin quán",
    manageMenu: "Quản lý thực đơn",
    manageCoupons: "Quản lý coupon",
    registerStore: "Đăng ký quán mới",
    storeAddress: "Địa chỉ",
    forbiddenMessage:
      "Bạn không có quyền sửa quán này. Hãy chọn quán của bạn từ bảng điều khiển.",
    kpiViews: "Lượt xem",
    kpiReviews: "Số đánh giá",
    kpiRating: "Điểm TB",
    kpiFavorites: "Yêu thích",
    recentReviews: "Đánh giá gần đây",
    quickActions: "Thao tác nhanh",
    performance: "Hiệu suất",
    week: "Tuần",
    month: "Tháng",
    year: "Năm",
    analyticsError: "Không tải được phân tích",
    selectStore: "Chọn cửa hàng",
  },
};

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) {
    return null;
  }
  const positive = value > 0;
  return (
    <span
      className={[
        "text-xs font-semibold",
        positive ? "text-emerald-600" : "text-rose-600",
      ].join(" ")}
    >
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

function AnalyticsChart({
  points,
}: {
  points: RestaurantAnalytics["chartPoints"];
}) {
  const maxReviews = Math.max(1, ...points.map((p) => p.reviewCount));
  const w = 320;
  const h = 120;
  const step = w / Math.max(points.length - 1, 1);

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - (p.reviewCount / maxReviews) * (h - 8) - 4;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-32 w-full text-primary"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={coords.join(" ")}
      />
      {points.map((p, i) => (
        <circle
          key={p.date}
          cx={i * step}
          cy={h - (p.reviewCount / maxReviews) * (h - 8) - 4}
          r="3"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageContent />
    </Suspense>
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showForbidden = searchParams.get("error") === "forbidden";

  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];

  const userJson = useSyncExternalStore(
    subscribeStoredUser,
    getStoredUserRawSnapshot,
    getServerStoredUserRawSnapshot,
  );
  const currentUser = useMemo((): StoredUser | null => {
    if (!userJson) {
      return null;
    }
    try {
      return JSON.parse(userJson) as StoredUser;
    } catch {
      return null;
    }
  }, [userJson]);

  const [myRestaurants, setMyRestaurants] = useState<RestaurantApiRecord[]>(
    [],
  );
  const [storesLoad, setStoresLoad] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(
    null,
  );
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null);
  const [analyticsLoad, setAnalyticsLoad] = useState<
    "idle" | "loading" | "error"
  >("idle");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      if (!currentUser) {
        setMyRestaurants([]);
        setStoresLoad("idle");
        return;
      }

      setStoresLoad("loading");
      try {
        const mine = await fetchMyRestaurants();
        if (cancelled) {
          return;
        }
        setMyRestaurants(mine);
        setStoresLoad("idle");
        const selected = getSelectedRestaurantId();
        const initial =
          selected && mine.some((r) => r.id === selected)
            ? selected
            : (mine[0]?.id ?? null);
        setActiveRestaurantId(initial);
        if (initial) {
          setSelectedRestaurantId(initial);
        }
      } catch {
        if (!cancelled) {
          setStoresLoad("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const loadAnalytics = useCallback(async () => {
    if (!activeRestaurantId) {
      setAnalytics(null);
      return;
    }
    setAnalyticsLoad("loading");
    try {
      const data = await fetchRestaurantAnalytics(activeRestaurantId, period);
      setAnalytics(data);
      setAnalyticsLoad("idle");
    } catch {
      setAnalyticsLoad("error");
    }
  }, [activeRestaurantId, period]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const kpis = analytics
    ? [
        {
          label: copy.kpiViews,
          value: String(analytics.viewsCount),
          delta: analytics.viewsDeltaPercent,
          icon: Eye,
        },
        {
          label: copy.kpiReviews,
          value: String(analytics.reviewsCount),
          delta: analytics.reviewsDeltaPercent,
          icon: Star,
        },
        {
          label: copy.kpiRating,
          value:
            analytics.averageRating != null
              ? analytics.averageRating.toFixed(1)
              : "—",
          delta: analytics.ratingDeltaPercent,
          icon: Star,
        },
        {
          label: copy.kpiFavorites,
          value: String(analytics.favoritesCount),
          delta: analytics.favoritesDeltaPercent,
          icon: Heart,
        },
      ]
    : [];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/dashboard" />}
        end={
          <nav
            aria-label={copy.crumb}
            className="flex flex-wrap items-center gap-4 text-sm font-semibold text-label"
          >
            <span className="text-title">{copy.crumb}</span>
            <button
              type="button"
              onClick={() => {
                clearStoredSession();
                router.push("/login");
              }}
              className="inline-flex h-10 items-center rounded-[10px] px-4 text-base font-normal text-primary transition-colors hover:bg-muted-surface hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
            >
              {copy.logout}
            </button>
          </nav>
        }
      />
      <main className="bg-muted-surface">
        <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
          <p className="text-sm font-bold text-primary">{copy.badge}</p>
          <h1 className="mt-2 text-balance text-3xl font-bold text-title">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-subtitle">
            {copy.lead}
          </p>

          {showForbidden ? (
            <p
              role="alert"
              className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950"
            >
              {copy.forbiddenMessage}
            </p>
          ) : null}

          {activeRestaurantId && analytics ? (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map(({ label, value, delta, icon: Icon }) => (
                  <Card key={label} className="px-5 py-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-subtitle">
                        {label}
                      </p>
                      <Icon className="size-4 text-primary" aria-hidden />
                    </div>
                    <p className="mt-3 text-3xl font-bold tabular-nums text-title">
                      {value}
                    </p>
                    <DeltaBadge value={delta} />
                  </Card>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-title">{copy.recentReviews}</h2>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {analytics.recentReviews.length === 0 ? (
                      <li className="text-sm text-subtitle">—</li>
                    ) : (
                      analytics.recentReviews.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-lg border border-border-input/60 p-3"
                        >
                          <p className="text-sm font-semibold text-title">
                            {r.userName}{" "}
                            <span className="text-amber-600">★ {r.rating}</span>
                          </p>
                          {r.comment ? (
                            <p className="mt-1 line-clamp-2 text-sm text-subtitle">
                              {r.comment}
                            </p>
                          ) : null}
                        </li>
                      ))
                    )}
                  </ul>
                </Card>

                <Card className="p-5">
                  <h2 className="font-bold text-title">{copy.quickActions}</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRestaurantId(activeRestaurantId);
                        router.push("/dashboard/restaurant/edit");
                      }}
                      className="rounded-[10px] bg-primary px-4 py-3 text-sm font-medium text-white"
                    >
                      {copy.editStore}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRestaurantId(activeRestaurantId);
                        router.push("/dashboard/restaurant/coupons");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
                    >
                      <Tag className="size-4" aria-hidden />
                      {copy.manageCoupons}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRestaurantId(activeRestaurantId);
                        router.push("/dashboard/restaurant/menu");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-amber-600 px-4 py-3 text-sm font-medium text-white"
                    >
                      <UtensilsCrossed className="size-4" aria-hidden />
                      {copy.manageMenu}
                    </button>
                  </div>
                </Card>
              </div>

              <Card className="mt-8 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-title">{copy.performance}</h2>
                  <div className="flex gap-2">
                    {(
                      [
                        ["week", copy.week],
                        ["month", copy.month],
                        ["year", copy.year],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPeriod(id)}
                        className={[
                          "rounded-lg px-3 py-1.5 text-sm font-medium",
                          period === id
                            ? "bg-primary text-white"
                            : "border border-border-input text-label",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {analyticsLoad === "error" ? (
                  <p className="mt-4 text-sm text-rose-700">
                    {copy.analyticsError}
                  </p>
                ) : (
                  <div className="mt-4">
                    <AnalyticsChart points={analytics.chartPoints} />
                  </div>
                )}
              </Card>
            </>
          ) : storesLoad === "idle" && myRestaurants.length > 0 ? (
            <p className="mt-8 text-subtitle">{copy.selectStore}</p>
          ) : null}

          {currentUser ? (
            <div className="mt-8">
              <Link
                href="/dashboard/restaurant/new"
                className="inline-flex h-[50px] items-center rounded-[10px] bg-primary px-6 text-base font-medium text-white shadow-primary-glow transition-colors hover:bg-primary-hover"
              >
                {copy.registerStore}
              </Link>
            </div>
          ) : null}

          {currentUser ? (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-title">{copy.myStores}</h2>
              {storesLoad === "loading" ? (
                <p className="mt-3 text-sm text-subtitle">…</p>
              ) : null}
              {storesLoad === "error" ? (
                <p className="mt-3 text-sm font-semibold text-rose-700">
                  {copy.storesLoadError}
                </p>
              ) : null}
              {storesLoad === "idle" && myRestaurants.length === 0 ? (
                <p className="mt-3 text-sm text-subtitle">{copy.storesEmpty}</p>
              ) : null}
              {storesLoad === "idle" && myRestaurants.length > 0 ? (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {myRestaurants.map((r) => (
                    <li key={r.id}>
                      <Card
                        className={[
                          "flex h-full flex-col px-5 py-5",
                          activeRestaurantId === r.id
                            ? "ring-2 ring-primary"
                            : "",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRestaurantId(r.id);
                            setActiveRestaurantId(r.id);
                          }}
                          className="text-left"
                        >
                          <p className="font-semibold text-title">{r.name}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-subtitle">
                            {copy.storeAddress}: {r.address}
                          </p>
                        </button>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRestaurantId(r.id);
                              router.push("/dashboard/restaurant/edit");
                            }}
                            className="inline-flex items-center rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary-glow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
                          >
                            {copy.editStore}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRestaurantId(r.id);
                              router.push("/dashboard/restaurant/menu");
                            }}
                            className="inline-flex items-center rounded-[10px] border border-border-input bg-white px-4 py-2 text-sm font-medium text-label transition-colors hover:border-primary hover:text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
                          >
                            {copy.manageMenu}
                          </button>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
