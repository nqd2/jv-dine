"use client";

import {
  Clock,
  LogOut,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
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
import type { RestaurantApiRecord } from "@lib/restaurant-api";
import {
  fetchMyRestaurants,
  restaurantApiBaseUrl,
  restaurantAuthHeaders,
} from "@lib/restaurant-api";
import {
  clearSelectedRestaurantId,
  getSelectedRestaurantId,
  setSelectedRestaurantId,
} from "@lib/restaurant-session";
import { resolveImageUrlForSubmit } from "@lib/upload-api";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  type Language,
  subscribeLanguage,
} from "@lib/jvdine-language";
import { PlacesAddressField } from "./places-address-field";
import { ImageUploadField } from "./ui/image-upload-field";
import { Card } from "./ui/card";
import {
  FormErrorAlert,
  FormField,
  InputWithLeading,
  textFieldClasses,
  textareaFieldClasses,
} from "./ui/form";
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";

type PriceTierId =
  | ""
  | "under100k"
  | "100k-250k"
  | "250k-500k"
  | "500k-1m"
  | "1m-plus";

const PRICE_TIER_BY_ID: Record<
  Exclude<PriceTierId, "">,
  { min: number | null; max: number | null }
> = {
  under100k: { min: null, max: 100_000 },
  "100k-250k": { min: 100_000, max: 250_000 },
  "250k-500k": { min: 250_000, max: 500_000 },
  "500k-1m": { min: 500_000, max: 1_000_000 },
  "1m-plus": { min: 1_000_000, max: null },
};

function parseBudgetNum(s: string | null): number | null {
  if (s === null || s === "") {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function inferPriceTierId(
  minBudget: string | null,
  maxBudget: string | null,
): PriceTierId {
  const min = parseBudgetNum(minBudget);
  const max = parseBudgetNum(maxBudget);
  const entries = Object.entries(PRICE_TIER_BY_ID) as [
    keyof typeof PRICE_TIER_BY_ID,
    { min: number | null; max: number | null },
  ][];
  for (const [id, range] of entries) {
    if (range.min === min && range.max === max) {
      return id;
    }
  }
  return "";
}

const CUISINE_VALUES = [
  "",
  "pho",
  "buffet",
  "japanese",
  "korean",
  "western",
  "vietnamese",
  "other",
] as const;

type Copy = {
  navDashboard: string;
  navEdit: string;
  navCampaign: string;
  navLogout: string;
  title: string;
  titleCreate: string;
  subtitle: string;
  tabBasic: string;
  tabMenu: string;
  tabMenuSoon: string;
  nameJa: string;
  nameVn: string;
  descJa: string;
  descVn: string;
  address: string;
  phone: string;
  hours: string;
  priceTier: string;
  cuisine: string;
  image: string;
  imageHint: string;
  imageTypes: string;
  browseLabel: string;
  facilities: string;
  facAc: string;
  facWifi: string;
  facParking: string;
  facEnglish: string;
  facJapanese: string;
  facCard: string;
  facDelivery: string;
  facReserve: string;
  cancel: string;
  cancelConfirm: string;
  save: string;
  loadError: string;
  saveError: string;
  saveSuccess: string;
  priceTierOptions: Record<PriceTierId, string>;
  cuisineOptions: Record<(typeof CUISINE_VALUES)[number], string>;
};

const COPY: Record<Language, Copy> = {
  JP: {
    navDashboard: "ダッシュボード",
    navEdit: "店舗編集",
    navCampaign: "キャンペーン",
    navLogout: "ログアウト",
    title: "店舗情報を編集",
    titleCreate: "店舗登録",
    subtitle: "店舗の詳細情報を更新できます",
    tabBasic: "基本情報",
    tabMenu: "メニュー",
    tabMenuSoon: "準備中",
    nameJa: "店舗名（日本語）",
    nameVn: "店舗名（ベトナム語）",
    descJa: "説明（日本語）/ Mô tả (tiếng Nhật)",
    descVn: "説明（ベトナム語）",
    address: "住所",
    phone: "電話番号",
    hours: "営業時間",
    priceTier: "価格帯",
    cuisine: "料理",
    image: "店舗の写真",
    imageHint: "ドラッグ＆ドロップ、貼り付け、または下のボタンで選択",
    imageTypes: "PNG, JPG, WEBP · 最大10MB（保存時にアップロード）",
    browseLabel: "フォルダを開く",
    facilities: "設備",
    facAc: "エアコン",
    facWifi: "WiFi",
    facParking: "駐車場",
    facEnglish: "英語対応",
    facJapanese: "日本語対応",
    facCard: "カード可",
    facDelivery: "配達",
    facReserve: "予約可",
    cancel: "キャンセル / Hủy",
    cancelConfirm: "未保存の変更があります。キャンセルしますか？",
    save: "保存 / Lưu",
    loadError: "店舗情報の読み込みに失敗しました。",
    saveError: "保存に失敗しました。",
    saveSuccess: "保存しました。",
    priceTierOptions: {
      "": "選択してください",
      under100k: "〜10万 VND",
      "100k-250k": "10万〜25万 VND",
      "250k-500k": "25万〜50万 VND",
      "500k-1m": "50万〜100万 VND",
      "1m-plus": "100万 VND〜",
    },
    cuisineOptions: {
      "": "選択してください",
      pho: "フォー / Phở",
      buffet: "ビュッフェ",
      japanese: "日本料理",
      korean: "韓国料理",
      western: "洋食",
      vietnamese: "ベトナム料理",
      other: "その他",
    },
  },
  VN: {
    navDashboard: "Bảng điều khiển",
    navEdit: "Sửa cửa hàng",
    navCampaign: "Chiến dịch",
    navLogout: "Đăng xuất",
    title: "Chỉnh sửa thông tin quán",
    titleCreate: "Đăng ký quán mới",
    subtitle: "Cập nhật chi tiết hiển thị cho khách.",
    tabBasic: "Thông tin cơ bản",
    tabMenu: "Thực đơn",
    tabMenuSoon: "Sắp có",
    nameJa: "Tên quán (tiếng Nhật)",
    nameVn: "Tên quán (tiếng Việt)",
    descJa: "Mô tả (tiếng Nhật)",
    descVn: "Mô tả (tiếng Việt)",
    address: "Địa chỉ",
    phone: "Số điện thoại",
    hours: "Giờ mở cửa",
    priceTier: "Mức giá",
    cuisine: "Ẩm thực",
    image: "Ảnh cửa hàng",
    imageHint: "Kéo thả, dán (Ctrl+V), hoặc bấm nút bên dưới",
    imageTypes: "PNG, JPG, WEBP · tối đa 10MB (tải lên khi Lưu)",
    browseLabel: "Mở thư mục",
    facilities: "Tiện ích",
    facAc: "Điều hòa",
    facWifi: "WiFi",
    facParking: "Bãi đỗ xe",
    facEnglish: "Hỗ trợ tiếng Anh",
    facJapanese: "Hỗ trợ tiếng Nhật",
    facCard: "Thẻ",
    facDelivery: "Giao hàng",
    facReserve: "Đặt bàn",
    cancel: "Hủy",
    cancelConfirm: "Bạn có thay đổi chưa lưu. Hủy chỉnh sửa?",
    save: "Lưu",
    loadError: "Không tải được thông tin quán.",
    saveError: "Lưu thất bại.",
    saveSuccess: "Đã lưu.",
    priceTierOptions: {
      "": "Chọn mức giá",
      under100k: "Dưới 100k VND",
      "100k-250k": "100k – 250k VND",
      "250k-500k": "250k – 500k VND",
      "500k-1m": "500k – 1M VND",
      "1m-plus": "Trên 1M VND",
    },
    cuisineOptions: {
      "": "Chọn loại",
      pho: "Phở",
      buffet: "Buffet",
      japanese: "Nhật",
      korean: "Hàn",
      western: "Tây",
      vietnamese: "Việt",
      other: "Khác",
    },
  },
};

function selectClasses(rest: string) {
  return [
    textFieldClasses.replace("h-[50px]", "h-[49px]"),
    "appearance-none bg-white pr-9",
    rest,
  ]
    .join(" ")
    .trim();
}

function resolveRestaurantIdFromProp(
  restaurantIdProp?: string,
): number | null {
  if (!restaurantIdProp) {
    return null;
  }
  const id = Number(restaurantIdProp);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export function RestaurantEditPage({
  mode = "edit",
  restaurantId: restaurantIdProp,
}: {
  mode?: "edit" | "create";
  restaurantId?: string;
}) {
  const router = useRouter();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];

  const isCreate = mode === "create";

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    isCreate ? "idle" : "loading",
  );
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const canMutate =
    currentUser !== null && (isCreate || (restaurantId !== null && loadState === "idle"));
  const fieldsDisabled = isSaving || loadState !== "idle";

  const [name, setName] = useState("");
  const [nameVn, setNameVn] = useState("");
  const [descriptionJa, setDescriptionJa] = useState("");
  const [descriptionVn, setDescriptionVn] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [priceTierId, setPriceTierId] = useState<PriceTierId>("");
  const [cuisine, setCuisine] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [hasAirConditioner, setHasAirConditioner] = useState(false);
  const [isJapaneseFriendly, setIsJapaneseFriendly] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasEnglishSupport, setHasEnglishSupport] = useState(false);
  const [acceptsCards, setAcceptsCards] = useState(false);
  const [hasDelivery, setHasDelivery] = useState(false);
  const [acceptsReservations, setAcceptsReservations] = useState(false);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const hydrate = useCallback((r: RestaurantApiRecord) => {
    setName(r.name);
    setNameVn(r.nameVn ?? "");
    setDescriptionJa(r.descriptionJa ?? "");
    setDescriptionVn(r.descriptionVn ?? "");
    setAddress(r.address);
    setLat(r.lat ?? null);
    setLong(r.long ?? null);
    setIsDirty(false);
    setPhone(r.phone ?? "");
    setWorkingHours(r.workingHours ?? "");
    setPriceTierId(inferPriceTierId(r.minBudget, r.maxBudget));
    setCuisine(r.cuisine ?? "");
    setImageUrl(r.imageUrl ?? "");
    setPendingImageFile(null);
    setHasAirConditioner(r.hasAirConditioner);
    setIsJapaneseFriendly(r.isJapaneseFriendly);
    setHasWifi(r.hasWifi);
    setHasParking(r.hasParking);
    setHasEnglishSupport(r.hasEnglishSupport);
    setAcceptsCards(r.acceptsCards);
    setHasDelivery(r.hasDelivery);
    setAcceptsReservations(r.acceptsReservations);
  }, []);

  useEffect(() => {
    if (!saveSuccess) {
      return;
    }
    const timer = window.setTimeout(() => setSaveSuccess(false), 4000);
    return () => window.clearTimeout(timer);
  }, [saveSuccess]);

  useEffect(() => {
    if (isCreate) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const fromProp = resolveRestaurantIdFromProp(restaurantIdProp);
      const selectedId = fromProp ?? getSelectedRestaurantId();
      if (!selectedId) {
        router.replace("/dashboard");
        return;
      }
      if (fromProp !== null) {
        setSelectedRestaurantId(fromProp);
      }

      setLoadState("loading");
      try {
        const mine = await fetchMyRestaurants();
        if (cancelled) {
          return;
        }
        const owned = mine.find((r) => r.id === selectedId);
        if (!owned) {
          clearSelectedRestaurantId();
          router.replace("/dashboard?error=forbidden");
          return;
        }
        setRestaurantId(selectedId);
        hydrate(owned);
        setLoadState("idle");
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrate, isCreate, restaurantIdProp, router]);

  const minMaxBudget = useMemo(() => {
    if (!priceTierId || !(priceTierId in PRICE_TIER_BY_ID)) {
      return { min: null as number | null, max: null as number | null };
    }
    return PRICE_TIER_BY_ID[priceTierId as Exclude<PriceTierId, "">];
  }, [priceTierId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canMutate || (!isCreate && restaurantId === null)) {
      return;
    }
    if (!address.trim()) {
      setSaveError(copy.saveError);
      return;
    }
    setSaveError("");
    setSaveSuccess(false);
    setIsSaving(true);
    let resolvedImageUrl: string | null;
    try {
      resolvedImageUrl = await resolveImageUrlForSubmit(
        imageUrl,
        pendingImageFile,
      );
    } catch {
      setSaveError(copy.saveError);
      setIsSaving(false);
      return;
    }

    const headers: HeadersInit = {
      ...restaurantAuthHeaders(),
      "Content-Type": "application/json",
    };

    const body: Record<string, unknown> = {
      name,
      nameVn: nameVn || null,
      descriptionJa: descriptionJa || null,
      descriptionVn: descriptionVn || null,
      address,
      phone: phone || null,
      cuisine: cuisine || null,
      workingHours: workingHours || null,
      minBudget: minMaxBudget.min,
      maxBudget: minMaxBudget.max,
      hasAirConditioner,
      isJapaneseFriendly,
      hasWifi,
      hasParking,
      hasEnglishSupport,
      acceptsCards,
      hasDelivery,
      acceptsReservations,
      imageUrl: resolvedImageUrl,
      lat,
      long,
    };

    try {
      if (isCreate) {
        const res = await fetch(`${restaurantApiBaseUrl}/restaurants`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (res.status === 401) {
          clearStoredSession();
          router.push("/login");
          return;
        }
        if (!res.ok) {
          setSaveError(copy.saveError);
          return;
        }
        const data = (await res.json()) as RestaurantApiRecord;
        setPendingImageFile(null);
        setIsDirty(false);
        setSelectedRestaurantId(data.id);
        router.push("/dashboard/restaurant/edit");
        return;
      }
      const res = await fetch(
        `${restaurantApiBaseUrl}/restaurants/${restaurantId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        },
      );
      if (res.status === 401) {
        clearStoredSession();
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setSaveError(copy.saveError);
        return;
      }
      const data = (await res.json()) as RestaurantApiRecord;
      hydrate(data);
      setSaveSuccess(true);
    } catch {
      setSaveError(copy.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm(copy.cancelConfirm)) {
      return;
    }
    router.push("/dashboard");
  }

  function handleLogout() {
    clearStoredSession();
    router.push("/login");
  }

  const menuHref = "/dashboard/restaurant/menu";

  if (!isCreate && loadState === "loading") {
    return (
      <div className="min-h-dvh bg-muted-surface text-foreground">
        <Navbar
          start={<SiteLogoLanguageCluster logoHref="/dashboard" />}
          end={
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[color:var(--color-restaurant-edit-accent)]"
            >
              {copy.navDashboard}
            </Link>
          }
        />
        <main className="mx-auto max-w-3xl px-5 py-16">
          <p className="text-sm text-subtitle">{copy.title}…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted-surface text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/dashboard" />}
        end={
          <nav
            aria-label={copy.navEdit}
            className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-base font-normal text-label"
          >
            <Link
              href="/dashboard"
              className="transition-colors hover:text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-restaurant-edit-soft)] focus-visible:ring-offset-2"
            >
              {copy.navDashboard}
            </Link>
            <span className="font-medium text-title">{copy.navEdit}</span>
            <Link
              href="#"
              className="transition-colors hover:text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-restaurant-edit-soft)] focus-visible:ring-offset-2"
            >
              {copy.navCampaign}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 font-medium text-label transition-colors hover:text-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-restaurant-edit-soft)] focus-visible:ring-offset-2"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              {copy.navLogout}
            </button>
          </nav>
        }
      />

      <main className="mx-auto w-full max-w-[1088px] px-5 py-8 sm:px-8">
        {loadState === "loading" ? (
          <p className="text-sm text-subtitle">{isCreate ? copy.titleCreate : copy.title}…</p>
        ) : null}
        {loadState === "error" ? (
          <p className="text-sm font-semibold text-rose-700">{copy.loadError}</p>
        ) : null}

        <Card className="mt-2 overflow-hidden rounded-[10px] shadow-[0px_4px_6px_-1px_rgb(0_0_0/0.1),0px_2px_4px_-2px_rgb(0_0_0/0.1)]">
          <header className="border-b border-black/10 px-8 pb-6 pt-8">
            <h1 className="text-[30px] font-bold leading-9 text-title">
              {isCreate ? copy.titleCreate : copy.title}
            </h1>
            <p className="mt-2 text-base leading-6 text-subtitle">
              {copy.subtitle}
            </p>
          </header>

          <div className="flex border-b border-black/10">
            <div
              className="flex flex-1 items-center justify-center gap-2 border-b-2 border-[color:var(--color-restaurant-edit-accent)] bg-[color:var(--color-restaurant-edit-accent-surface)] py-3.5 text-base font-medium text-[color:var(--color-restaurant-edit-accent)]"
              role="tab"
              aria-selected
            >
              <MapPin className="size-5 shrink-0" aria-hidden />
              {copy.tabBasic}
            </div>
            {!isCreate ? (
              <Link
                href={menuHref}
                className="flex flex-1 items-center justify-center gap-2 py-3.5 text-base font-medium text-subtitle transition-colors hover:bg-white/80 hover:text-label"
                role="tab"
                aria-selected={false}
              >
                <UtensilsCrossed className="size-5 shrink-0" aria-hidden />
                {copy.tabMenu}
              </Link>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-8 py-8"
          >
            {saveError ? <FormErrorAlert>{saveError}</FormErrorAlert> : null}
            {saveSuccess ? (
              <p
                role="status"
                className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
              >
                {copy.saveSuccess}
              </p>
            ) : null}
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label={copy.nameJa} htmlFor="name-ja">
                <input
                  id="name-ja"
                  value={name}
                  onChange={(ev) => {
                    markDirty();
                    setName(ev.target.value);
                  }}
                  className={textFieldClasses}
                  readOnly={fieldsDisabled}
                  required
                  autoComplete="organization"
                />
              </FormField>
              <FormField label={copy.nameVn} htmlFor="name-vn">
                <input
                  id="name-vn"
                  value={nameVn}
                  onChange={(ev) => {
                    markDirty();
                    setNameVn(ev.target.value);
                  }}
                  className={textFieldClasses}
                  readOnly={fieldsDisabled}
                  autoComplete="off"
                />
              </FormField>
            </div>

            <FormField label={copy.descJa} htmlFor="desc-ja">
              <textarea
                id="desc-ja"
                value={descriptionJa}
                onChange={(ev) => {
                  markDirty();
                  setDescriptionJa(ev.target.value);
                }}
                className={textareaFieldClasses}
                readOnly={fieldsDisabled}
                rows={4}
              />
            </FormField>
            <FormField label={copy.descVn} htmlFor="desc-vn">
              <textarea
                id="desc-vn"
                value={descriptionVn}
                onChange={(ev) => {
                  markDirty();
                  setDescriptionVn(ev.target.value);
                }}
                className={textareaFieldClasses}
                readOnly={fieldsDisabled}
                rows={4}
              />
            </FormField>

            <PlacesAddressField
              id="address"
              label={copy.address}
              value={address}
              disabled={fieldsDisabled}
              onChange={(sel) => {
                markDirty();
                setAddress(sel.address);
                setLat(sel.lat);
                setLong(sel.long);
              }}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label={copy.phone} htmlFor="phone">
                <InputWithLeading
                  leading={<Phone className="size-5" aria-hidden />}
                >
                  <input
                    id="phone"
                    value={phone}
                    onChange={(ev) => {
                      markDirty();
                      setPhone(ev.target.value);
                    }}
                    className={`${textFieldClasses} pl-11`}
                    readOnly={fieldsDisabled}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </InputWithLeading>
              </FormField>
              <FormField label={copy.hours} htmlFor="hours">
                <InputWithLeading
                  leading={<Clock className="size-5" aria-hidden />}
                >
                  <input
                    id="hours"
                    value={workingHours}
                    onChange={(ev) => {
                      markDirty();
                      setWorkingHours(ev.target.value);
                    }}
                    className={`${textFieldClasses} pl-11`}
                    readOnly={fieldsDisabled}
                    placeholder="6:00 - 22:00"
                  />
                </InputWithLeading>
              </FormField>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label={copy.priceTier} htmlFor="price-tier">
                <div className="relative">
                  <select
                    id="price-tier"
                    value={priceTierId}
                    onChange={(ev) => {
                      markDirty();
                      setPriceTierId(ev.target.value as PriceTierId);
                    }}
                    disabled={fieldsDisabled}
                    className={selectClasses("w-full")}
                  >
                    {(Object.keys(copy.priceTierOptions) as PriceTierId[]).map(
                      (id) => (
                        <option key={id || "empty"} value={id}>
                          {copy.priceTierOptions[id]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </FormField>
              <FormField label={copy.cuisine} htmlFor="cuisine">
                <select
                  id="cuisine"
                  value={cuisine}
                  onChange={(ev) => {
                    markDirty();
                    setCuisine(ev.target.value);
                  }}
                  disabled={fieldsDisabled}
                  className={selectClasses("w-full")}
                >
                  {CUISINE_VALUES.map((v) => (
                    <option key={v || "empty"} value={v}>
                      {copy.cuisineOptions[v]}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <ImageUploadField
              remoteUrl={imageUrl}
              pendingFile={pendingImageFile}
              onPendingFileChange={(file) => {
                markDirty();
                setPendingImageFile(file);
              }}
              disabled={fieldsDisabled}
              label={copy.image}
              hint={copy.imageHint}
              typesHint={copy.imageTypes}
              browseLabel={copy.browseLabel}
              accentClass="text-[color:var(--color-restaurant-edit-accent)]"
            />

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-label">
                {copy.facilities}
              </legend>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={hasAirConditioner}
                    onChange={(ev) => {
                      markDirty();
                      setHasAirConditioner(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facAc}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={hasWifi}
                    onChange={(ev) => {
                      markDirty();
                      setHasWifi(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facWifi}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={hasParking}
                    onChange={(ev) => {
                      markDirty();
                      setHasParking(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facParking}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={hasEnglishSupport}
                    onChange={(ev) => {
                      markDirty();
                      setHasEnglishSupport(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facEnglish}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={isJapaneseFriendly}
                    onChange={(ev) => {
                      markDirty();
                      setIsJapaneseFriendly(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facJapanese}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={acceptsCards}
                    onChange={(ev) => {
                      markDirty();
                      setAcceptsCards(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facCard}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={hasDelivery}
                    onChange={(ev) => {
                      markDirty();
                      setHasDelivery(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facDelivery}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-label">
                  <input
                    type="checkbox"
                    checked={acceptsReservations}
                    onChange={(ev) => {
                      markDirty();
                      setAcceptsReservations(ev.target.checked);
                    }}
                    disabled={fieldsDisabled}
                    className="size-4 rounded border-border-input text-[color:var(--color-restaurant-edit-accent)] focus:ring-[color:var(--color-restaurant-edit-accent)]"
                  />
                  {copy.facReserve}
                </label>
              </div>
            </fieldset>

            <div className="flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="h-[50px] flex-1 rounded-[10px] border border-border-input text-base font-medium text-label transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-restaurant-edit-soft)] focus-visible:ring-offset-2"
              >
                {copy.cancel}
              </button>
              <button
                type="submit"
                disabled={!canMutate || isSaving || loadState === "loading"}
                className="h-[50px] flex-1 rounded-[10px] bg-[color:var(--color-restaurant-edit-accent)] text-base font-medium text-white shadow-sm transition-colors hover:bg-[color:var(--color-restaurant-edit-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-restaurant-edit-soft)] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {copy.save}
              </button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
