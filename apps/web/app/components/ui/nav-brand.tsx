"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  persistLanguage,
  subscribeLanguage,
} from "@lib/jvdine-language";
import { LanguageToggle } from "./language-toggle";

/** Shared across Guest home, Auth, Forgot password, Dashboard. */
export const SITE_LOGO_LINK_CLASS =
  "rounded-md text-2xl font-bold tracking-tight text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2";

export function SiteLogoLink({ href }: { href: string }) {
  return (
    <Link href={href} className={SITE_LOGO_LINK_CLASS}>
      JVDine
    </Link>
  );
}

/** Logo + language toggle with global language store (every page header). */
export function SiteLogoLanguageCluster({
  logoHref,
}: {
  logoHref: string;
}) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  return (
    <>
      <SiteLogoLink href={logoHref} />
      <LanguageToggle
        language={language}
        onLanguageChange={persistLanguage}
      />
    </>
  );
}
