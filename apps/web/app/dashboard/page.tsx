"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Card } from "../components/ui/card";
import { Navbar } from "../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../components/ui/nav-brand";
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
  },
};

export default function DashboardPage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];

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
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-[10px] px-4 text-base font-normal text-primary transition-colors hover:bg-muted-surface hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
            >
              {copy.logout}
            </Link>
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
        </section>
      </main>
    </div>
  );
}
