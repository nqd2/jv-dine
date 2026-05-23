"use client";

import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { FavoriteButton } from "../components/favorite-button";
import { Card } from "../components/ui/card";
import { Navbar } from "../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../components/ui/nav-brand";
import { UserNavLinks } from "../components/user-nav-links";
import { fetchMyFavorites, type FavoriteRecord } from "@lib/favorites-api";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";

const COPY: Record<
  Language,
  {
    title: string;
    slogan: string;
    empty: string;
    loadError: string;
    locationFallback: string;
  }
> = {
  JP: {
    title: "お気に入り一覧",
    slogan: "保存したレストランをすぐに見つけましょう",
    empty: "お気に入りのレストランはまだありません",
    loadError: "読み込みに失敗しました",
    locationFallback: "未設定",
  },
  VN: {
    title: "Danh sách yêu thích",
    slogan: "Tìm lại nhanh các nhà hàng bạn đã lưu",
    empty: "Chưa có nhà hàng yêu thích",
    loadError: "Không tải được danh sách",
    locationFallback: "Chưa có",
  },
};

function formatBudget(min: string | null, max: string | null): string {
  if (min && max) {
    return `${Number(min).toLocaleString()} – ${Number(max).toLocaleString()} VND`;
  }
  if (min) {
    return `≥ ${Number(min).toLocaleString()} VND`;
  }
  if (max) {
    return `≤ ${Number(max).toLocaleString()} VND`;
  }
  return "—";
}

export default function FavoritesPage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];
  const [items, setItems] = useState<FavoriteRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "idle" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMyFavorites();
        if (!cancelled) {
          setItems(data);
          setLoadState("idle");
        }
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/home" />}
        end={<UserNavLinks />}
      />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <Heart className="size-8 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-title">{copy.title}</h1>
            <p className="text-sm text-subtitle">{copy.slogan}</p>
          </div>
        </div>

        {loadState === "loading" ? (
          <p className="mt-8 text-subtitle">…</p>
        ) : null}
        {loadState === "error" ? (
          <p className="mt-8 font-semibold text-rose-700">{copy.loadError}</p>
        ) : null}
        {loadState === "idle" && items.length === 0 ? (
          <p className="mt-8 text-subtitle">{copy.empty}</p>
        ) : null}

        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {items.map(({ restaurantId, restaurant: r }) => (
            <li key={restaurantId}>
              <Card className="overflow-hidden p-0">
                <Link href={`/restaurants/${r.id}`} className="block">
                  <div className="relative h-44 bg-muted-surface">
                    {r.imageUrl ? (
                      <Image
                        src={r.imageUrl}
                        alt={r.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                    <FavoriteButton
                      restaurantId={r.id}
                      initialFavorited
                      returnUrl="/favorites"
                      onToggle={(favorited) => {
                        if (!favorited) {
                          setItems((prev) =>
                            prev.filter((x) => x.restaurantId !== r.id),
                          );
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    <h2 className="text-lg font-bold text-title">{r.name}</h2>
                    {r.cuisine ? (
                      <p className="text-sm text-subtitle">{r.cuisine}</p>
                    ) : null}
                    <p className="flex items-start gap-2 text-sm text-subtitle">
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {r.address || copy.locationFallback}
                    </p>
                    <p className="text-sm font-semibold tabular-nums text-caption">
                      {formatBudget(r.minBudget, r.maxBudget)}
                    </p>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
