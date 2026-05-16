"use client";

import { Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getStoredUser } from "@lib/auth-session";
import { createReview } from "@lib/review-api";
import { resolveImageUrlForSubmit } from "@lib/upload-api";
import { ImageUploadField } from "./ui/image-upload-field";
import { FormErrorAlert, FormField, textareaFieldClasses } from "./ui/form";

type ReviewWriteModalProps = {
  restaurantId: number;
  language: "JP" | "VN";
  onClose: () => void;
  onSuccess: () => void;
};

const COPY = {
  JP: {
    title: "レビューを書く",
    rating: "評価",
    comment: "コメント",
    submit: "投稿",
    close: "閉じる",
    error: "投稿に失敗しました",
    ratingRequired: "評価を選択してください",
    imageHint: "ドラッグ＆ドロップ、貼り付け、または下のボタンで選択",
    imageTypes: "PNG, JPG, WEBP · 10MBまで（投稿時にアップロード）",
    browseLabel: "フォルダを開く",
  },
  VN: {
    title: "Viết đánh giá",
    rating: "Đánh giá",
    comment: "Nội dung",
    submit: "Gửi",
    close: "Đóng",
    error: "Gửi thất bại",
    ratingRequired: "Vui lòng chọn số sao",
    imageHint: "Kéo thả, dán (Ctrl+V), hoặc bấm nút bên dưới",
    imageTypes: "PNG, JPG, WEBP · tối đa 10MB",
    browseLabel: "Mở thư mục",
  },
} as const;

export function ReviewWriteModal({
  restaurantId,
  language,
  onClose,
  onSuccess,
}: ReviewWriteModalProps) {
  const router = useRouter();
  const copy = COPY[language];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const user = getStoredUser();
    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/restaurants/${restaurantId}`)}`);
      return;
    }
    if (rating < 1 || rating > 5) {
      setError(copy.ratingRequired);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const resolvedImageUrl = await resolveImageUrlForSubmit(
        "",
        pendingImageFile,
      );
      await createReview({
        restaurantId,
        rating,
        comment: comment.trim() || null,
        imageUrl: resolvedImageUrl,
      });
      onSuccess();
      onClose();
    } catch {
      setError(copy.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[10px] bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-title">{copy.title}</h2>
          <button type="button" onClick={onClose} aria-label={copy.close}>
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error ? <FormErrorAlert>{error}</FormErrorAlert> : null}
          <FormField label={copy.rating} htmlFor="review-rating">
            <div className="flex gap-1" id="review-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="rounded p-1"
                >
                  <Star
                    className={[
                      "size-8",
                      n <= rating ? "fill-amber-400 text-amber-400" : "text-border-input",
                    ].join(" ")}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </FormField>
          <FormField label={copy.comment} htmlFor="review-comment">
            <textarea
              id="review-comment"
              maxLength={500}
              value={comment}
              onChange={(ev) => setComment(ev.target.value)}
              className={textareaFieldClasses}
              rows={4}
            />
          </FormField>
          <ImageUploadField
            remoteUrl=""
            pendingFile={pendingImageFile}
            onPendingFileChange={setPendingImageFile}
            label="Photo"
            hint={copy.imageHint}
            typesHint={copy.imageTypes}
            browseLabel={copy.browseLabel}
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-[50px] w-full rounded-[10px] bg-primary text-white disabled:opacity-60"
          >
            {copy.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
