"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

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
  fetchMyRestaurants,
  type RestaurantApiRecord,
} from "@lib/restaurant-api";
import { setSelectedRestaurantId } from "@lib/restaurant-session";
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
    metrics: Array<[string, string]>;
    myStores: string;
    storesLoadError: string;
    storesEmpty: string;
    editStore: string;
    manageMenu: string;
    registerStore: string;
    storeAddress: string;
    forbiddenMessage: string;
  }
> = {
  JP: {
    crumb: "ダッシュボード",
    logout: "ログアウト",
    badge: "Owner",
    title: "店舗ダッシュボード",
    lead: "店舗、メニュー、予約状況をまとめて確認する管理画面です。",
    metrics: [
      ["本日の予約", "0"],
      ["公開メニュー", "0"],
      ["未対応リクエスト", "0"],
    ],
    myStores: "自分の店舗",
    storesLoadError: "店舗一覧の取得に失敗しました。",
    storesEmpty: "まだ店舗が登録されていません。",
    editStore: "店舗情報を編集",
    manageMenu: "メニュー管理",
    registerStore: "店舗を登録",
    storeAddress: "住所",
    forbiddenMessage:
      "この店舗を編集する権限がありません。ダッシュボードから自分の店舗を選択してください。",
  },
  VN: {
    crumb: "Bảng điều khiển",
    logout: "Đăng xuất",
    badge: "Chủ quán",
    title: "Trang chủ cửa hàng",
    lead:
      "Màn hình theo dõi cửa hàng, menu và yêu cầu chờ — dữ liệu mẫu cho MVP.",
    metrics: [
      ["Đặt hôm nay", "0"],
      ["Món đang bán", "0"],
      ["Yêu cầu chưa xử lý", "0"],
    ],
    myStores: "Cửa hàng của bạn",
    storesLoadError: "Không tải được danh sách quán.",
    storesEmpty: "Chưa có cửa hàng nào.",
    editStore: "Sửa thông tin quán",
    manageMenu: "Quản lý thực đơn",
    registerStore: "Đăng ký quán mới",
    storeAddress: "Địa chỉ",
    forbiddenMessage:
      "Bạn không có quyền sửa quán này. Hãy chọn quán của bạn từ bảng điều khiển.",
  },
};

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

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {copy.metrics.map(([label, value]) => (
              <Card key={label} className="px-5 py-5">
                <p className="text-sm font-medium text-subtitle">{label}</p>
                <p className="mt-3 text-3xl font-bold tabular-nums text-title">
                  {value}
                </p>
              </Card>
            ))}
          </div>

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
                      <Card className="flex h-full flex-col px-5 py-5">
                        <p className="font-semibold text-title">{r.name}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-subtitle">
                          {copy.storeAddress}: {r.address}
                        </p>
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
