"use client";

import {
  Bell,
  Calendar,
  ChevronRight,
  Heart,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { ImageUploadField } from "../components/ui/image-upload-field";
import { Navbar } from "../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../components/ui/nav-brand";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { clearStoredSession, getStoredUser } from "@lib/auth-session";
import {
  fetchMyProfile,
  updateProfile,
  type UserProfile,
} from "@lib/profile-api";
import { resolveImageUrlForSubmit } from "@lib/upload-api";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";

const COPY: Record<
  Language,
  {
    edit: string;
    save: string;
    cancel: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    joined: string;
    reviews: string;
    favorites: string;
    likes: string;
    settings: string;
    favoritesSetting: string;
    favoritesSettingDesc: string;
    notificationsSetting: string;
    notificationsSettingDesc: string;
    privacySetting: string;
    privacySettingDesc: string;
    passwordSetting: string;
    passwordSettingDesc: string;
    loadError: string;
    username: string;
    logout: string;
    locationUnset: string;
    phoneUnset: string;
    bioUnset: string;
  }
> = {
  JP: {
    edit: "編集",
    save: "保存",
    cancel: "キャンセル",
    email: "メール",
    phone: "電話番号",
    location: "場所",
    bio: "自己紹介",
    joined: "参加日",
    reviews: "レビュー",
    favorites: "お気に入り",
    likes: "いいね",
    settings: "設定",
    favoritesSetting: "お気に入り",
    favoritesSettingDesc: "お気に入りのレストランを見る",
    notificationsSetting: "キャンペーン通知",
    notificationsSettingDesc: "レストランのキャンペーン情報",
    privacySetting: "プライバシー",
    privacySettingDesc: "プライバシー設定を管理",
    passwordSetting: "パスワード変更",
    passwordSettingDesc: "アカウントのパスワードを変更",
    loadError: "読み込みに失敗しました",
    username: "ユーザー名",
    logout: "ログアウト",
    locationUnset: "未設定",
    phoneUnset: "未設定",
    bioUnset: "",
  },
  VN: {
    edit: "Chỉnh sửa",
    save: "Lưu",
    cancel: "Hủy",
    email: "Email",
    phone: "Số điện thoại",
    location: "Nơi ở",
    bio: "Giới thiệu",
    joined: "Ngày tham gia",
    reviews: "Đánh giá",
    favorites: "Yêu thích",
    likes: "Thích",
    settings: "Cài đặt",
    favoritesSetting: "Danh sách yêu thích",
    favoritesSettingDesc: "Xem nhà hàng đã lưu",
    notificationsSetting: "Thông báo khuyến mãi",
    notificationsSettingDesc: "Thông tin ưu đãi từ quán",
    privacySetting: "Quyền riêng tư",
    privacySettingDesc: "Quản lý cài đặt riêng tư",
    passwordSetting: "Đổi mật khẩu",
    passwordSettingDesc: "Thay đổi mật khẩu tài khoản",
    loadError: "Không tải được",
    username: "Tên",
    logout: "Đăng xuất",
    locationUnset: "Chưa thiết lập",
    phoneUnset: "Chưa thiết lập",
    bioUnset: "",
  },
};

function formatJoinedDate(iso: string, language: Language): string {
  const d = new Date(iso);
  if (language === "JP") {
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  }
  return d.toLocaleDateString("vi-VN");
}

function avatarInitial(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) {
    return "?";
  }
  return trimmed.charAt(0).toUpperCase();
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[10px] bg-muted-surface px-4 py-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-subtitle" aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-medium text-label">{label}</p>
        <p className="mt-0.5 break-all text-sm text-title">{value}</p>
      </div>
    </div>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold tabular-nums text-title">{value}</p>
      <p className="mt-1 text-sm text-subtitle">{label}</p>
    </div>
  );
}

function SettingsRow({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Heart;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-[10px] border border-border-input bg-white px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted-surface/50"
    >
      <Icon className="size-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-title">{title}</p>
        <p className="mt-0.5 text-sm text-subtitle">{description}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-caption" aria-hidden />
    </Link>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];
  const sessionUser = getStoredUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "idle" | "error">(
    "loading",
  );
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setUsername(data.username);
      setPhone(data.phone ?? "");
      setLocation(data.location ?? "");
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatarUrl ?? "");
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

  const handleSave = async () => {
    if (!profile) {
      return;
    }
    setSaving(true);
    try {
      const resolvedAvatar = await resolveImageUrlForSubmit(
        avatarUrl,
        avatarFile,
      );
      const updated = await updateProfile(profile.id, {
        username: username.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: resolvedAvatar,
      });
      setProfile(updated);
      setAvatarUrl(updated.avatarUrl ?? "");
      setAvatarFile(null);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  if (!sessionUser) {
    return (
      <div className="min-h-dvh bg-background p-10 text-center">
        <Link href="/login?returnUrl=/profile" className="text-primary">
          Login
        </Link>
      </div>
    );
  }

  const displayAvatarUrl = editing ? avatarUrl : (profile?.avatarUrl ?? "");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/home" />}
        end={
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-label transition-colors hover:bg-muted-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
          >
            <LogOut className="size-4" aria-hidden />
            {copy.logout}
          </button>
        }
      />

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        {loadState === "loading" ? (
          <Card className="overflow-hidden">
            <div className="h-28 animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-300" />
            <div className="px-6 pb-6">
              <div className="-mt-14 flex items-start gap-5">
                <Skeleton className="size-[7.5rem] shrink-0 rounded-full border-4 border-white" />
                <div className="w-full space-y-3 pt-16">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border-input pt-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : null}
        {loadState === "error" ? (
          <p className="text-center font-semibold text-rose-700">
            {copy.loadError}
          </p>
        ) : null}

        {profile && loadState === "idle" ? (
          <>
            <Card className="overflow-hidden">
              <div
                className="h-28 bg-gradient-to-r from-primary to-[color:var(--color-hero-gradient-end)]"
                aria-hidden
              />

              <div className="px-6 pb-6 pt-0">
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                    <div className="relative size-[7.5rem] shrink-0 overflow-hidden rounded-full border-4 border-white bg-muted-surface shadow-card">
                      {displayAvatarUrl ? (
                        <Image
                          src={displayAvatarUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-3xl font-bold text-subtitle">
                          {avatarInitial(profile.username)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 pt-2 sm:pt-14">
                      <h1 className="text-2xl font-bold leading-tight text-title">
                        {profile.username}
                      </h1>
                      {(editing ? bio : profile.bio) ? (
                        <p className="mt-2.5 text-sm leading-relaxed text-subtitle">
                          {editing ? bio : profile.bio}
                        </p>
                      ) : null}
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-caption">
                        <Calendar className="size-4 shrink-0" aria-hidden />
                        {copy.joined}:{" "}
                        {formatJoinedDate(profile.createdAt, language)}
                      </p>
                    </div>
                  </div>

                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex shrink-0 items-center gap-2 self-start rounded-[10px] bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-primary-glow transition-colors hover:bg-primary-hover sm:mt-14"
                    >
                      <Pencil className="size-4" aria-hidden />
                      {copy.edit}
                    </button>
                  ) : null}
                </div>

                {editing ? (
                  <div className="mt-6 space-y-4 border-t border-border-input pt-6">
                    <label className="block text-sm font-medium text-label">
                      {copy.username}
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full rounded-[10px] border border-border-input px-3 py-2.5 text-title outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                      />
                    </label>
                    <ImageUploadField
                      remoteUrl={avatarUrl}
                      pendingFile={avatarFile}
                      onPendingFileChange={setAvatarFile}
                      label="Avatar"
                      hint="Upload profile photo"
                      typesHint="PNG, JPG, WEBP — max 10MB"
                      browseLabel="Browse"
                    />
                    <label className="block text-sm font-medium text-label">
                      {copy.phone}
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-[10px] border border-border-input px-3 py-2.5 text-title outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                      />
                    </label>
                    <label className="block text-sm font-medium text-label">
                      {copy.location}
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1 w-full rounded-[10px] border border-border-input px-3 py-2.5 text-title outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                      />
                    </label>
                    <label className="block text-sm font-medium text-label">
                      {copy.bio}
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-[10px] border border-border-input px-3 py-2.5 text-title outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleSave()}
                        className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {copy.save}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setUsername(profile.username);
                          setPhone(profile.phone ?? "");
                          setLocation(profile.location ?? "");
                          setBio(profile.bio ?? "");
                          setAvatarUrl(profile.avatarUrl ?? "");
                          setAvatarFile(null);
                        }}
                        className="rounded-[10px] border border-border-input px-5 py-2.5 text-sm font-medium text-label"
                      >
                        {copy.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <InfoRow
                      icon={Mail}
                      label={copy.email}
                      value={profile.email}
                    />
                    <InfoRow
                      icon={Phone}
                      label={copy.phone}
                      value={profile.phone ?? copy.phoneUnset}
                    />
                    <InfoRow
                      icon={MapPin}
                      label={copy.location}
                      value={profile.location ?? copy.locationUnset}
                    />
                  </div>
                )}

                {!editing ? (
                  <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border-input pt-8">
                    <StatBlock
                      value={profile.reviewCount ?? 0}
                      label={copy.reviews}
                    />
                    <StatBlock
                      value={profile.favoritesCount ?? 0}
                      label={copy.favorites}
                    />
                    <StatBlock value={0} label={copy.likes} />
                  </div>
                ) : null}
              </div>
            </Card>

            {!editing ? (
              <Card className="mt-6 p-6">
                <h2 className="text-lg font-bold text-title">{copy.settings}</h2>
                <div className="mt-4 space-y-3">
                  <SettingsRow
                    href="/favorites"
                    icon={Heart}
                    title={copy.favoritesSetting}
                    description={copy.favoritesSettingDesc}
                  />
                  <SettingsRow
                    href="/notifications"
                    icon={Bell}
                    title={copy.notificationsSetting}
                    description={copy.notificationsSettingDesc}
                  />
                  <SettingsRow
                    href="/profile"
                    icon={Shield}
                    title={copy.privacySetting}
                    description={copy.privacySettingDesc}
                  />
                  <SettingsRow
                    href="/forgot-password"
                    icon={KeyRound}
                    title={copy.passwordSetting}
                    description={copy.passwordSettingDesc}
                  />
                </div>
              </Card>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
