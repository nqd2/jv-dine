"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Bell, Heart } from "lucide-react";

import { NotificationBadge } from "./notification-badge";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";

const COPY: Record<
  Language,
  {
    profile: string;
    favorites: string;
    notifications: string;
  }
> = {
  JP: {
    profile: "プロフィール",
    favorites: "お気に入り",
    notifications: "通知",
  },
  VN: {
    profile: "Hồ sơ",
    favorites: "Yêu thích",
    notifications: "Thông báo",
  },
};

export function UserNavLinks() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];

  return (
    <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-label">
      <Link href="/profile" className="hover:text-primary">
        {copy.profile}
      </Link>
      <Link
        href="/favorites"
        className="inline-flex items-center gap-1 hover:text-primary"
      >
        <Heart className="size-4" aria-hidden />
        {copy.favorites}
      </Link>
      <Link
        href="/notifications"
        className="relative inline-flex items-center gap-1 hover:text-primary"
      >
        <Bell className="size-4" aria-hidden />
        {copy.notifications}
        <NotificationBadge />
      </Link>
    </nav>
  );
}
