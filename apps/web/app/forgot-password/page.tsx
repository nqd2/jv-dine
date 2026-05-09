"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";

import { Card } from "../components/ui/card";
import { FormField, textFieldClasses } from "../components/ui/form";
import { Navbar } from "../components/ui/navbar";
import { SiteLogoLanguageCluster } from "../components/ui/nav-brand";
import { FORGOT_PASSWORD_COPY_BY_LANGUAGE } from "@lib/forgot-password-copy";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
} from "@lib/jvdine-language";

export default function ForgotPasswordPage() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const copy = FORGOT_PASSWORD_COPY_BY_LANGUAGE[language];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/" />}
        end={
          <Link
            href="/login"
            className="rounded-md text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
          >
            {copy.back}
          </Link>
        }
      />

      <main className="mx-auto flex w-full max-w-[520px] flex-col px-5 pb-16 pt-8 sm:pt-10 md:pt-12">
        <h1 className="text-balance text-[32px] font-bold">{copy.title}</h1>
        <p className="mt-4 text-pretty text-sm font-medium leading-relaxed text-subtitle">
          {copy.description}
        </p>
        <p className="mt-2 text-sm text-title">{copy.hint}</p>

        <Card className="mt-10 w-full px-7 py-8 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label={copy.email} htmlFor="forgot-email">
              <input
                id="forgot-email"
                name="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                spellCheck={false}
                className={textFieldClasses}
                placeholder={copy.placeholder}
              />
            </FormField>

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-white shadow-primary-glow transition-[background-color,box-shadow] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
            >
              {copy.notify}
            </button>

            {submitted ? (
              <p
                role="status"
                aria-live="polite"
                className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
              >
                {copy.toast}
              </p>
            ) : null}
          </form>
        </Card>
      </main>
    </div>
  );
}
