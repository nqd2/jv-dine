"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getStoredUser } from "@lib/auth-session";
import { toggleFavorite } from "@lib/favorites-api";

type FavoriteButtonProps = {
  restaurantId: number;
  initialFavorited?: boolean;
  className?: string;
  returnUrl?: string;
  onToggle?: (favorited: boolean) => void;
};

export function FavoriteButton({
  restaurantId,
  initialFavorited = false,
  className,
  returnUrl,
  onToggle,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!getStoredUser()) {
        const url =
          returnUrl ??
          (typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/");
        router.push(`/login?returnUrl=${encodeURIComponent(url)}`);
        return;
      }

      setBusy(true);
      try {
        const result = await toggleFavorite(restaurantId);
        setFavorited(result.favorited);
        onToggle?.(result.favorited);
      } catch {
        // ignore — auth redirect may have fired
      } finally {
        setBusy(false);
      }
    },
    [onToggle, restaurantId, returnUrl, router],
  );

  return (
    <button
      type="button"
      disabled={busy}
      aria-label={favorited ? "Remove favorite" : "Add favorite"}
      aria-pressed={favorited}
      onClick={(e) => void handleClick(e)}
      className={
        className ??
        "absolute right-3 top-3 rounded-full bg-white p-2 shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:opacity-60"
      }
    >
      <Heart
        aria-hidden
        strokeWidth={1.75}
        className={[
          "size-5 transition-colors",
          favorited ? "fill-primary text-primary" : "text-title",
        ].join(" ")}
      />
    </button>
  );
}
