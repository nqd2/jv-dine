"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useSyncExternalStore } from "react";

import { Navbar } from "../../../../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../../../../components/ui/nav-brand";
import { Card } from "../../../../components/ui/card";
import { createCoupon } from "@lib/coupon-api";
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
    nameJa: string;
    nameVn: string;
    descJa: string;
    descVn: string;
    code: string;
    discountType: string;
    percent: string;
    amount: string;
    discountValue: string;
    startDate: string;
    endDate: string;
    usageLimit: string;
    create: string;
    cancel: string;
    error: string;
  }
> = {
  JP: {
    title: "キャンペーン作成",
    nameJa: "キャンペーン名 (日本語)",
    nameVn: "キャンペーン名 (ベトナム語)",
    descJa: "説明 (日本語)",
    descVn: "説明 (ベトナム語)",
    code: "クーポンコード",
    discountType: "割引タイプ",
    percent: "パーセント",
    amount: "金額",
    discountValue: "割引値",
    startDate: "開始日",
    endDate: "終了日",
    usageLimit: "利用回数制限",
    create: "作成",
    cancel: "キャンセル",
    error: "作成に失敗しました",
  },
  VN: {
    title: "Tạo khuyến mãi / mã giảm giá",
    nameJa: "Tên (JP)",
    nameVn: "Tên (VN)",
    descJa: "Mô tả (JP)",
    descVn: "Mô tả (VN)",
    code: "Mã coupon",
    discountType: "Loại giảm",
    percent: "Phần trăm",
    amount: "Số tiền",
    discountValue: "Giá trị giảm",
    startDate: "Ngày bắt đầu",
    endDate: "Ngày kết thúc",
    usageLimit: "Giới hạn lượt dùng",
    create: "Tạo",
    cancel: "Hủy",
    error: "Tạo thất bại",
  },
};

export default function CouponCreatePage() {
  const router = useRouter();
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = COPY[language];
  const restaurantId = getSelectedRestaurantId();

  const [nameJa, setNameJa] = useState("");
  const [nameVn, setNameVn] = useState("");
  const [descJa, setDescJa] = useState("");
  const [descVn, setDescVn] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createCoupon({
        restaurantId,
        code: code.trim().toUpperCase(),
        nameJa: nameJa.trim(),
        nameVn: nameVn.trim(),
        descriptionJa: descJa.trim() || undefined,
        descriptionVn: descVn.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        startDate: startDate || undefined,
        expiryDate: endDate,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      });
      router.push("/dashboard/restaurant/coupons");
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setSubmitting(false);
    }
  };

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
          <Link
            href="/dashboard/restaurant/coupons"
            className="text-sm font-semibold text-primary"
          >
            {copy.cancel}
          </Link>
        }
      />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <h1 className="text-2xl font-bold text-title">{copy.title}</h1>
        <Card className="mt-8 p-6">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block text-sm font-medium">
              {copy.nameJa}
              <input
                required
                value={nameJa}
                onChange={(ev) => setNameJa(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.nameVn}
              <input
                required
                value={nameVn}
                onChange={(ev) => setNameVn(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.descJa}
              <textarea
                value={descJa}
                onChange={(ev) => setDescJa(ev.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.descVn}
              <textarea
                value={descVn}
                onChange={(ev) => setDescVn(ev.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.code}
              <input
                required
                value={code}
                onChange={(ev) => setCode(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2 uppercase"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-medium">{copy.discountType}</legend>
              <div className="mt-2 flex gap-2">
                {(["percentage", "amount"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiscountType(t)}
                    className={[
                      "rounded-lg px-4 py-2 text-sm font-medium",
                      discountType === t
                        ? "bg-primary text-white"
                        : "border border-border-input",
                    ].join(" ")}
                  >
                    {t === "percentage" ? copy.percent : copy.amount}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-medium">
              {copy.discountValue}
              <input
                required
                type="number"
                min={1}
                value={discountValue}
                onChange={(ev) => setDiscountValue(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                {copy.startDate}
                <input
                  type="date"
                  value={startDate}
                  onChange={(ev) => setStartDate(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                {copy.endDate}
                <input
                  required
                  type="date"
                  value={endDate}
                  onChange={(ev) => setEndDate(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              {copy.usageLimit}
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(ev) => setUsageLimit(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-border-input px-3 py-2"
              />
            </label>
            {error ? (
              <p className="text-sm font-semibold text-rose-700">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="h-[50px] w-full rounded-[10px] bg-primary text-white disabled:opacity-60"
            >
              {copy.create}
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
