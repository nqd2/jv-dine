"use client";

import {
  Copy,
  Pause,
  Play,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { Card } from "../../../components/ui/card";
import { Navbar } from "../../../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../../../components/ui/nav-brand";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  deleteCoupon,
  fetchCouponsByRestaurant,
  fetchCouponStats,
  updateCouponStatus,
  type CouponRecord,
  type CouponStats,
} from "@lib/coupon-api";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";
import { getSelectedRestaurantId } from "@lib/restaurant-session";

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    create: string;
    total: string;
    active: string;
    paused: string;
    views: string;
    usages: string;
    empty: string;
    loadError: string;
    pause: string;
    resume: string;
    delete: string;
    period: string;
    statusActive: string;
    statusPaused: string;
    statusExpired: string;
    copied: string;
  }
> = {
  JP: {
    title: "キャンペーン管理",
    subtitle: "作成したプロモーションを管理・分析",
    create: "新規作成",
    total: "総数",
    active: "実施中",
    paused: "一時停止",
    views: "総閲覧数",
    usages: "総利用数",
    empty: "クーポンがありません",
    loadError: "読み込みに失敗しました",
    pause: "一時停止",
    resume: "再開",
    delete: "削除",
    period: "期間",
    statusActive: "実施中",
    statusPaused: "一時停止",
    statusExpired: "終了",
    copied: "コピーしました",
  },
  VN: {
    title: "Quản lý mã giảm giá",
    subtitle: "Quản lý và phân tích các khuyến mãi đã tạo",
    create: "Tạo mới",
    total: "Tổng số",
    active: "Đang chạy",
    paused: "Tạm dừng",
    views: "Lượt xem",
    usages: "Lượt dùng",
    empty: "Chưa có coupon",
    loadError: "Không tải được",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    delete: "Xóa",
    period: "Thời gian",
    statusActive: "Đang chạy",
    statusPaused: "Tạm dừng",
    statusExpired: "Kết thúc",
    copied: "Đã sao chép",
  },
};

function discountLabel(c: CouponRecord): string {
  if (c.discountType === "amount") {
    return `${c.discountValue.toLocaleString()} VND`;
  }
  return `${c.discountValue}%`;
}

function statusLabel(c: CouponRecord, copy: (typeof COPY)["JP"]): string {
  if (c.status === "paused") {
    return copy.statusPaused;
  }
  if (new Date(c.expiryDate) < new Date()) {
    return copy.statusExpired;
  }
  return copy.statusActive;
}

export default function CouponManagePage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];
  const restaurantId = getSelectedRestaurantId();

  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "idle" | "error">(
    "loading",
  );

  const load = useCallback(async () => {
    if (!restaurantId) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    try {
      const [list, s] = await Promise.all([
        fetchCouponsByRestaurant(restaurantId),
        fetchCouponStats(restaurantId),
      ]);
      setCoupons(list);
      setStats(s);
      setLoadState("idle");
    } catch {
      setLoadState("error");
    }
  }, [restaurantId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!restaurantId) {
    return (
      <div className="min-h-dvh p-10 text-center">
        <Link href="/dashboard" className="text-primary">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/dashboard" />}
        end={
          <Link href="/dashboard" className="text-sm font-semibold text-primary">
            Dashboard
          </Link>
        }
      />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-title">{copy.title}</h1>
            <p className="mt-1 text-sm text-subtitle">{copy.subtitle}</p>
          </div>
          <Link
            href="/dashboard/restaurant/coupons/new"
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-primary-glow"
          >
            <Plus className="size-4" aria-hidden />
            {copy.create}
          </Link>
        </div>

        {stats ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                [copy.total, stats.total],
                [copy.active, stats.active],
                [copy.paused, stats.paused],
                [copy.views, stats.totalViews],
                [copy.usages, stats.totalUsages],
              ] as const
            ).map(([label, value]) => (
              <Card key={label} className="px-4 py-4">
                <p className="text-xs text-subtitle">{label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-title">
                  {value}
                </p>
              </Card>
            ))}
          </div>
        ) : null}

        {loadState === "loading" ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="px-4 py-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-3 h-7 w-20" />
                </Card>
              ))}
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i}>
                  <Card className="p-5">
                    <div className="flex items-start gap-2">
                      <Skeleton className="mt-1 size-5 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="mt-3 h-6 w-20" />
                    <Skeleton className="mt-2 h-4 w-24" />
                    <Skeleton className="mt-2 h-3 w-40" />
                    <Skeleton className="mt-3 h-2 w-full" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-9 w-24 rounded-lg" />
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {loadState === "error" ? (
          <p className="mt-8 font-semibold text-rose-700">{copy.loadError}</p>
        ) : null}
        {loadState === "idle" && coupons.length === 0 ? (
          <p className="mt-8 text-subtitle">{copy.empty}</p>
        ) : null}

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {coupons.map((c) => {
            const usagePct =
              c.usageLimit && c.usageLimit > 0
                ? Math.min(100, (c.usagesCount / c.usageLimit) * 100)
                : null;
            return (
              <li key={c.id}>
                <Card className="relative p-5">
                  <span className="absolute right-4 top-4 rounded-full bg-muted-surface px-2 py-0.5 text-xs font-semibold text-label">
                    {statusLabel(c, copy)}
                  </span>
                  <div className="flex items-start gap-2">
                    <Tag className="mt-1 size-5 text-primary" aria-hidden />
                    <div>
                      <h2 className="font-bold text-title">
                        {c.nameJa ?? c.code}
                      </h2>
                      {c.nameVn ? (
                        <p className="text-sm text-subtitle">{c.nameVn}</p>
                      ) : null}
                    </div>
                  </div>
                  {c.descriptionJa || c.descriptionVn ? (
                    <p className="mt-2 text-sm text-subtitle">
                      {language === "JP" ? c.descriptionJa : c.descriptionVn}
                    </p>
                  ) : null}
                  <p className="mt-3 text-lg font-bold text-primary">
                    {discountLabel(c)}
                  </p>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(c.code)}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-label"
                  >
                    <Copy className="size-3.5" aria-hidden />
                    {c.code}
                  </button>
                  <p className="mt-2 text-xs text-subtitle">
                    {copy.period}:{" "}
                    {c.startDate
                      ? new Date(c.startDate).toLocaleDateString()
                      : "—"}{" "}
                    – {new Date(c.expiryDate).toLocaleDateString()}
                  </p>
                  {usagePct !== null ? (
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-muted-surface">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-subtitle">
                        {c.usagesCount}/{c.usageLimit}
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.status === "active" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void updateCouponStatus(c.id, "paused").then(() =>
                            load(),
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
                      >
                        <Pause className="size-4" aria-hidden />
                        {copy.pause}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void updateCouponStatus(c.id, "active").then(() =>
                            load(),
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"
                      >
                        <Play className="size-4" aria-hidden />
                        {copy.resume}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        void deleteCoupon(c.id).then(() => load())
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      {copy.delete}
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
