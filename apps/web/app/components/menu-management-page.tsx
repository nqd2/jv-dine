"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  ALLERGEN_TAG_KEYS,
  createMenu,
  formatWarningTags,
  getAllergenLabel,
  type AllergenTagKey,
  deleteMenu,
  fetchMenusByRestaurant,
  parseWarningTags,
  serializeWarningTags,
  updateMenu,
  type MenuApiRecord,
} from "@lib/menu-api";
import { fetchMyRestaurants } from "@lib/restaurant-api";
import {
  clearSelectedRestaurantId,
  getSelectedRestaurantId,
  setSelectedRestaurantId,
} from "@lib/restaurant-session";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
  type Language,
} from "@lib/jvdine-language";
import { resolveImageUrlForSubmit } from "@lib/upload-api";
import { ImageUploadField } from "./ui/image-upload-field";
import { FormErrorAlert, FormField, textFieldClasses, textareaFieldClasses } from "./ui/form";
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";
import { Card } from "./ui/card";

const COPY: Record<
  Language,
  {
    title: string;
    back: string;
    add: string;
    save: string;
    edit: string;
    delete: string;
    itemName: string;
    nameVn: string;
    description: string;
    price: string;
    allergens: string;
    japaneseFriendly: string;
    image: string;
    imageHint: string;
    imageTypes: string;
    browseLabel: string;
    empty: string;
    loadError: string;
    saveError: string;
    confirmDelete: string;
  }
> = {
  JP: {
    title: "メニュー管理",
    back: "店舗編集に戻る",
    add: "メニューを追加",
    save: "保存",
    edit: "編集",
    delete: "削除",
    itemName: "料理名",
    nameVn: "料理名（ベトナム語）",
    description: "説明",
    price: "価格 (VND)",
    allergens: "アレルギー・注意",
    japaneseFriendly: "日本人向け",
    image: "写真",
    imageHint: "ドラッグ＆ドロップ、貼り付け、または下のボタンで選択",
    imageTypes: "PNG, JPG, WEBP · 10MBまで（保存時にアップロード）",
    browseLabel: "フォルダを開く",
    empty: "メニューがありません",
    loadError: "読み込みに失敗しました",
    saveError: "保存に失敗しました",
    confirmDelete: "このメニューを削除しますか？",
  },
  VN: {
    title: "Quản lý thực đơn",
    back: "Quay lại sửa quán",
    add: "Thêm món",
    save: "Lưu",
    edit: "Sửa",
    delete: "Xóa",
    itemName: "Tên món",
    nameVn: "Tên món (VN)",
    description: "Mô tả",
    price: "Giá (VND)",
    allergens: "Cảnh báo / dị ứng",
    japaneseFriendly: "Hợp khẩu vị Nhật",
    image: "Ảnh món",
    imageHint: "Kéo thả, dán (Ctrl+V), hoặc bấm nút bên dưới",
    imageTypes: "PNG, JPG, WEBP · tối đa 10MB (tải lên khi Lưu)",
    browseLabel: "Mở thư mục",
    empty: "Chưa có món nào",
    loadError: "Không tải được thực đơn",
    saveError: "Lưu thất bại",
    confirmDelete: "Xóa món này?",
  },
};

type MenuFormState = {
  itemName: string;
  nameVn: string;
  description: string;
  price: string;
  allergens: AllergenTagKey[];
  isJapaneseFriendly: boolean;
  imageUrl: string;
  pendingImageFile: File | null;
};

const emptyForm = (): MenuFormState => ({
  itemName: "",
  nameVn: "",
  description: "",
  price: "",
  allergens: [],
  isJapaneseFriendly: false,
  imageUrl: "",
  pendingImageFile: null,
});

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

export function MenuManagementPage({
  restaurantId: restaurantIdProp,
}: {
  restaurantId?: string;
} = {}) {
  const router = useRouter();
  const language = useSyncExternalStore(subscribeLanguage, getLanguageSnapshot, getServerLanguageSnapshot);
  const copy = COPY[language];

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [menus, setMenus] = useState<MenuApiRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "idle" | "error">("loading");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuFormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadMenus = useCallback(async (id: number) => {
    setLoadState("loading");
    try {
      const rows = await fetchMenusByRestaurant(id);
      setMenus(rows);
      setLoadState("idle");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
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
        await loadMenus(selectedId);
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadMenus, restaurantIdProp, router]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
    setError("");
  }

  function openEdit(menu: MenuApiRecord) {
    setEditingId(menu.id);
    setForm({
      itemName: menu.itemName,
      nameVn: menu.nameVn ?? "",
      description: menu.description ?? "",
      price: menu.price,
      allergens: parseWarningTags(menu.warningTags),
      isJapaneseFriendly: menu.isJapaneseFriendly,
      imageUrl: menu.imageUrl ?? "",
      pendingImageFile: null,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSaving) {
      return;
    }
    setError("");
    const price = Number(form.price);
    if (!form.itemName.trim() || !Number.isFinite(price) || price <= 0) {
      setError(copy.saveError);
      return;
    }
    setIsSaving(true);
    let imageUrl: string | null;
    try {
      imageUrl = await resolveImageUrlForSubmit(
        form.imageUrl,
        form.pendingImageFile,
      );
    } catch {
      setError(copy.saveError);
      setIsSaving(false);
      return;
    }

    if (restaurantId === null) {
      setIsSaving(false);
      return;
    }

    const payload = {
      restaurantId,
      itemName: form.itemName.trim(),
      nameVn: form.nameVn.trim() || null,
      description: form.description.trim() || null,
      price,
      isJapaneseFriendly: form.isJapaneseFriendly,
      warningTags: serializeWarningTags(form.allergens),
      imageUrl,
    };
    try {
      if (editingId) {
        await updateMenu(editingId, payload);
      } else {
        await createMenu(payload);
      }
      setShowForm(false);
      await loadMenus(restaurantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(copy.confirmDelete)) {
      return;
    }
    try {
      await deleteMenu(id);
      if (restaurantId !== null) {
        await loadMenus(restaurantId);
      }
    } catch {
      setError(copy.saveError);
    }
  }

  return (
    <div className="min-h-dvh bg-muted-surface text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/dashboard" />}
        end={
          <Link
            href="/dashboard/restaurant/edit"
            className="text-sm font-semibold text-primary"
          >
            {copy.back}
          </Link>
        }
      />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-title">{copy.title}</h1>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="size-4" aria-hidden />
            {copy.add}
          </button>
        </div>

        {error ? <FormErrorAlert className="mb-4">{error}</FormErrorAlert> : null}

        {showForm ? (
          <Card className="mb-8 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label={copy.itemName} htmlFor="item-name">
                <input
                  id="item-name"
                  value={form.itemName}
                  onChange={(ev) => setForm((f) => ({ ...f, itemName: ev.target.value }))}
                  className={textFieldClasses}
                  required
                />
              </FormField>
              <FormField label={copy.nameVn} htmlFor="name-vn">
                <input
                  id="name-vn"
                  value={form.nameVn}
                  onChange={(ev) => setForm((f) => ({ ...f, nameVn: ev.target.value }))}
                  className={textFieldClasses}
                />
              </FormField>
              <FormField label={copy.description} htmlFor="desc">
                <textarea
                  id="desc"
                  value={form.description}
                  onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
                  className={textareaFieldClasses}
                  rows={3}
                />
              </FormField>
              <FormField label={copy.price} htmlFor="price">
                <input
                  id="price"
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={(ev) => setForm((f) => ({ ...f, price: ev.target.value }))}
                  className={textFieldClasses}
                  required
                />
              </FormField>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-label">{copy.allergens}</legend>
                <div>
                  {ALLERGEN_TAG_KEYS.map((tag) => (
                    <label key={tag} className="mr-4 inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.allergens.includes(tag)}
                        onChange={(ev) => {
                          setForm((f) => ({
                            ...f,
                            allergens: ev.target.checked
                              ? [...f.allergens, tag]
                              : f.allergens.filter((t) => t !== tag),
                          }));
                        }}
                      />
                      {getAllergenLabel(tag, language)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isJapaneseFriendly}
                  onChange={(ev) =>
                    setForm((f) => ({ ...f, isJapaneseFriendly: ev.target.checked }))
                  }
                />
                {copy.japaneseFriendly}
              </label>
              <ImageUploadField
                remoteUrl={form.imageUrl}
                pendingFile={form.pendingImageFile}
                onPendingFileChange={(file) =>
                  setForm((f) => ({ ...f, pendingImageFile: file }))
                }
                label={copy.image}
                hint={copy.imageHint}
                typesHint={copy.imageTypes}
                browseLabel={copy.browseLabel}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-[10px] bg-primary px-5 py-2 text-white disabled:opacity-60"
                >
                  {copy.save}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-[10px] border border-border-input px-5 py-2"
                >
                  {copy.back}
                </button>
              </div>
            </form>
          </Card>
        ) : null}

        {loadState === "loading" ? <p className="text-subtitle">…</p> : null}
        {loadState === "error" ? (
          <p className="font-semibold text-rose-700">{copy.loadError}</p>
        ) : null}
        {loadState === "idle" && menus.length === 0 ? (
          <p className="text-subtitle">{copy.empty}</p>
        ) : null}
        <ul className="space-y-4">
          {menus.map((menu) => (
            <li key={menu.id}>
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-title">{menu.itemName}</p>
                  {menu.nameVn ? (
                    <p className="text-sm text-subtitle">{menu.nameVn}</p>
                  ) : null}
                  <p className="text-sm text-caption">{menu.price} VND</p>
                  {menu.warningTags ? (
                    <p className="mt-1 text-xs text-rose-700">
                      {formatWarningTags(menu.warningTags, language)}
                    </p>
                  ) : null}
                  {menu.isJapaneseFriendly ? (
                    <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {copy.japaneseFriendly}
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(menu)}
                    className="rounded-lg border border-border-input px-3 py-1.5 text-sm"
                  >
                    {copy.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(menu.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {copy.delete}
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
