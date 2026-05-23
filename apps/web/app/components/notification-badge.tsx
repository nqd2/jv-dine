"use client";

import { useEffect, useState } from "react";

import { fetchUnreadNotificationCount } from "@lib/notifications-api";
import { getStoredUser } from "@lib/auth-session";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!getStoredUser()) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const n = await fetchUnreadNotificationCount();
        if (!cancelled) {
          setCount(n);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
