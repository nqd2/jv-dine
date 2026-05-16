"use client";

import { Flame, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { getStoredUser } from "@lib/auth-session";
import { getAllergenLabel, parseWarningTags } from "@lib/menu-api";
import {
  fetchRestaurantDetail,
  type RestaurantDetailRecord,
} from "@lib/restaurant-api";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";
import { ReviewWriteModal } from "./review-write-modal";
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";
import { Card } from "./ui/card";

type TabId = "menu" | "reviews" | "details";

const COPY: Record<
  Language,
  {
    home: string;
    writeReview: string;
    tabMenu: string;
    tabReviews: string;
    tabDetails: string;
    japaneseBadge: string;
    loadError: string;
    reviewsEmpty: string;
    ratingCount: (avg: string, count: number) => string;
  }
> = {
  JP: {
    home: "ホーム",
    writeReview: "レビューを書く",
    tabMenu: "メニュー",
    tabReviews: "レビュー",
    tabDetails: "詳細情報",
    japaneseBadge: "日本人向け",
    loadError: "読み込みに失敗しました",
    reviewsEmpty: "レビューはまだありません",
    ratingCount: (avg, count) => `${avg} (${count}件)`,
  },
  VN: {
    home: "Trang chủ",
    writeReview: "Viết đánh giá",
    tabMenu: "Thực đơn",
    tabReviews: "Đánh giá",
    tabDetails: "Chi tiết",
    japaneseBadge: "Hợp khẩu vị Nhật",
    loadError: "Không tải được",
    reviewsEmpty: "Chưa có đánh giá",
    ratingCount: (avg, count) => `${avg} (${count} lượt)`,
  },
};

export function RestaurantDetailPage({ restaurantId }: { restaurantId: string }) {
  const searchParams = useSearchParams();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];
  const numericId = Number(restaurantId);
  const initialTab = (searchParams.get("tab") as TabId) || "menu";

  const [detail, setDetail] = useState<RestaurantDetailRecord | null>(null);
  const [tab, setTab] = useState<TabId>(initialTab);
  const [loadState, setLoadState] = useState<"loading" | "idle" | "error">("loading");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    try {
      const data = await fetchRestaurantDetail(numericId);
      setDetail(data);
      setLoadState("idle");
    } catch {
      setLoadState("error");
    }
  }, [numericId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const r = detail?.restaurant;
  const avg = detail?.ratingSummary.averageRating;
  const avgLabel = avg != null ? avg.toFixed(1) : "—";

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
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-6">
        {loadState === "loading" ? <p className="text-subtitle">…</p> : null}
        {loadState === "error" || !r ? (
          loadState === "error" ? (
            <p className="font-semibold text-rose-700">{copy.loadError}</p>
          ) : null
        ) : (
          <>
            <div className="relative mb-6 h-48 overflow-hidden rounded-[10px] bg-muted-surface">
              {r.imageUrl ? (
                <Image src={r.imageUrl} alt="" fill className="object-cover" unoptimized />
              ) : null}
            </div>
            <h1 className="text-2xl font-bold text-title">{r.name}</h1>
            {r.nameVn ? <p className="text-subtitle">{r.nameVn}</p> : null}
            <button
              type="button"
              onClick={() => {
                if (!getStoredUser()) {
                  window.location.href = `/login?returnUrl=${encodeURIComponent(`/restaurants/${numericId}`)}`;
                  return;
                }
                setShowReviewModal(true);
              }}
              className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              {copy.writeReview}
            </button>
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              {copy.ratingCount(avgLabel, detail.ratingSummary.reviewCount)}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-subtitle">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {r.address}
            </p>

            <div className="mt-6 flex gap-6 border-b border-border-input">
              {(
                [
                  ["menu", copy.tabMenu],
                  ["reviews", copy.tabReviews],
                  ["details", copy.tabDetails],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={[
                    "pb-3 text-sm font-semibold",
                    tab === id
                      ? "border-b-2 border-primary text-primary"
                      : "text-subtitle",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === "menu" ? (
                <ul className="space-y-4">
                  {detail.menus.map((menu) => {
                    const tags = parseWarningTags(menu.warningTags);
                    const spicy = tags.includes("spicy");
                    return (
                      <li key={menu.id}>
                        <Card className="p-4">
                          <div className="flex gap-4">
                            {menu.imageUrl ? (
                              <div className="shrink-0">
                                <Image
                                  src={menu.imageUrl}
                                  alt=""
                                  width={80}
                                  height={80}
                                  className="rounded-lg object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : null}
                            <div className="flex-1">
                              <p className="flex items-center gap-2 font-bold text-title">
                                {menu.itemName}
                                {spicy ? (
                                  <Flame className="size-4 text-rose-600" aria-hidden />
                                ) : null}
                              </p>
                              {menu.nameVn ? (
                                <p className="text-sm text-subtitle">{menu.nameVn}</p>
                              ) : null}
                              {menu.description ? (
                                <p className="mt-1 text-sm text-subtitle">{menu.description}</p>
                              ) : null}
                              <p className="mt-2 font-semibold tabular-nums text-caption">
                                {menu.price} VND
                              </p>
                              {tags.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                                    >
                                      {getAllergenLabel(tag, language)}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {menu.isJapaneseFriendly ? (
                                <span className="mt-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {copy.japaneseBadge}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {tab === "reviews" ? (
                <ul className="space-y-4">
                  {detail.reviews.length === 0 ? (
                    <p className="text-subtitle">{copy.reviewsEmpty}</p>
                  ) : (
                    detail.reviews.map((rev) => (
                      <li key={rev.id}>
                        <Card className="p-4">
                          <p className="font-semibold text-title">{rev.userName ?? "User"}</p>
                          <p className="flex items-center gap-1 text-sm text-amber-600">
                            <Star className="size-4 fill-amber-400" aria-hidden />
                            {rev.rating}
                            <span className="text-caption text-subtitle">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                          {rev.comment ? (
                            <p className="mt-2 text-sm text-subtitle">{rev.comment}</p>
                          ) : null}
                          {rev.imageUrl ? (
                            <div className="relative mt-3 h-40 w-full max-w-xs">
                              <Image
                                src={rev.imageUrl}
                                alt=""
                                fill
                                className="rounded-lg object-cover"
                                unoptimized
                              />
                            </div>
                          ) : null}
                        </Card>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}

              {tab === "details" ? (
                <Card className="space-y-3 p-4 text-sm text-subtitle">
                  {r.descriptionJa ? <p>{r.descriptionJa}</p> : null}
                  {r.descriptionVn ? <p>{r.descriptionVn}</p> : null}
                  {r.phone ? <p>Tel: {r.phone}</p> : null}
                  {r.workingHours ? <p>{r.workingHours}</p> : null}
                  {r.cuisine ? <p>{r.cuisine}</p> : null}
                </Card>
              ) : null}
            </div>
          </>
        )}
      </main>
      {showReviewModal ? (
        <ReviewWriteModal
          restaurantId={numericId}
          language={language}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => void load()}
        />
      ) : null}
    </div>
  );
}
