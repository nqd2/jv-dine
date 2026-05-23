"use client";

import { Bell, Copy, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { Navbar } from "../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../components/ui/nav-brand";
import { UserNavLinks } from "../components/user-nav-links";
import { Card } from "../components/ui/card";
import {
  extractCouponCode,
  fetchMyNotifications,
  markAllNotificationsRead,
  type NotificationRecord,
} from "@lib/notifications-api";
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
    markAll: string;
    empty: string;
    loadError: string;
    newLabel: string;
    copyCode: string;
    copied: string;
    viewDetail: string;
  }
> = {
  JP: {
    title: "キャンペーン通知",
    markAll: "すべて既読",
    empty: "通知はありません",
    loadError: "読み込みに失敗しました",
    newLabel: "新着",
    copyCode: "コードをコピー",
    copied: "コピーしました",
    viewDetail: "詳細を見る",
  },
  VN: {
    title: "Thông báo khuyến mãi",
    markAll: "Đánh dấu tất cả đã đọc",
    empty: "Chưa có thông báo",
    loadError: "Không tải được",
    newLabel: "Mới",
    copyCode: "Sao chép mã",
    copied: "Đã sao chép",
    viewDetail: "Xem chi tiết",
  },
};

function formatDate(iso: string, language: Language): string {
  return new Date(iso).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN");
}

export default function NotificationsPage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "idle" | "error">(
    "loading",
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const data = await fetchMyNotifications();
      setItems(data);
      setLoadState("idle");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleCopy = async (id: number, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/home" />}
        end={<UserNavLinks />}
      />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="size-8 text-primary" aria-hidden />
            <h1 className="text-2xl font-bold text-title">{copy.title}</h1>
          </div>
          {items.some((n) => !n.isRead) ? (
            <button
              type="button"
              onClick={() => void handleMarkAll()}
              className="inline-flex items-center gap-2 rounded-[10px] border border-border-input px-4 py-2 text-sm font-medium text-label hover:border-primary hover:text-primary"
            >
              <CheckCheck className="size-4" aria-hidden />
              {copy.markAll}
            </button>
          ) : null}
        </div>

        {loadState === "loading" ? <p className="mt-8 text-subtitle">…</p> : null}
        {loadState === "error" ? (
          <p className="mt-8 font-semibold text-rose-700">{copy.loadError}</p>
        ) : null}
        {loadState === "idle" && items.length === 0 ? (
          <p className="mt-8 text-subtitle">{copy.empty}</p>
        ) : null}

        <ul className="mt-8 space-y-4">
          {items.map((n) => {
            const code = extractCouponCode(n.content);
            return (
              <li key={n.id}>
                <Card
                  className={[
                    "p-5",
                    !n.isRead ? "border-primary/30 bg-primary/5" : "",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1">
                      {!n.isRead ? (
                        <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">
                          {copy.newLabel}
                        </span>
                      ) : null}
                      <p className="whitespace-pre-wrap text-sm leading-6 text-title">
                        {n.content}
                      </p>
                      <p className="mt-2 text-xs text-subtitle">
                        {formatDate(n.createdAt, language)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {code ? (
                      <button
                        type="button"
                        onClick={() => void handleCopy(n.id, code)}
                        className="inline-flex items-center gap-2 rounded-lg bg-muted-surface px-3 py-1.5 text-sm font-medium text-label"
                      >
                        <Copy className="size-4" aria-hidden />
                        {copiedId === n.id ? copy.copied : `${copy.copyCode}: ${code}`}
                      </button>
                    ) : null}
                    <Link
                      href="/home"
                      className="inline-flex items-center rounded-lg border border-border-input px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted-surface"
                    >
                      {copy.viewDetail}
                    </Link>
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
