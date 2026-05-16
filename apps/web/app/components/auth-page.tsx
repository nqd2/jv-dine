"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";

import {
  AUTH_COPY_BY_LANGUAGE,
  AUTH_SERVER_MESSAGES,
} from "@lib/auth-copy";
import { persistAuthSession } from "@lib/auth-session";
import { resolveReturnUrl } from "@lib/api-client";
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeLanguage,
} from "@lib/jvdine-language";
import { Card } from "./ui/card";
import {
  FormErrorAlert,
  FormField,
  InputWithLeading,
  PasswordInput,
  textFieldClasses,
} from "./ui/form";
import { Navbar } from "./ui/navbar";
import { SiteLogoLanguageCluster } from "./ui/nav-brand";

type AuthMode = "login" | "signup";
type UserType = "customer" | "owner";

type AuthResponse = {
  user: {
    id: number;
    username: string;
    email: string;
    roleId: number;
    roleName: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: string;
    refreshExpiresIn: string;
  };
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAV_SLOT_CLASS =
  "inline-flex h-10 min-w-[4.75rem] shrink-0 items-center justify-center rounded-[10px] px-3 text-center text-sm font-medium whitespace-nowrap sm:w-[10rem] sm:max-w-[10rem] sm:px-4 sm:text-base";

const NAV_LINK_MUTED_CLASS = `${NAV_SLOT_CLASS} text-label transition-[background-color,color,box-shadow] hover:bg-muted-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2`;

const NAV_MUTED_PAGE_CLASS = `${NAV_SLOT_CLASS} cursor-default text-label`;

const NAV_PRIMARY_LINK_CLASS = `${NAV_SLOT_CLASS} bg-primary text-white shadow-primary-glow transition-[background-color,box-shadow] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2`;

const NAV_PRIMARY_PAGE_CLASS = `${NAV_SLOT_CLASS} cursor-default bg-primary text-white shadow-primary-glow`;

const SIGNUP_SEGMENT_BASE =
  "h-10 rounded-md text-sm font-bold transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2";

const SIGNUP_SEGMENT_ACTIVE = `${SIGNUP_SEGMENT_BASE} bg-primary text-white`;

const SIGNUP_SEGMENT_INACTIVE = `${SIGNUP_SEGMENT_BASE} text-label hover:bg-white`;

function readEmailFromLocation(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("password")) {
    return "";
  }
  return params.get("email") ?? "";
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = mode === "login";
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = AUTH_COPY_BY_LANGUAGE[language];

  const [email, setEmail] = useState(readEmailFromLocation);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [userType, setUserType] = useState<UserType>("customer");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");
    const returnUrl = searchParams.get("returnUrl");

    if (!emailParam && !passwordParam) {
      return;
    }

    const clean = new URLSearchParams();
    if (returnUrl) {
      clean.set("returnUrl", returnUrl);
    }
    const basePath = isLogin ? "/login" : "/signup";
    const query = clean.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  }, [isLogin, router, searchParams]);

  function translateServerMessage(raw: string): string {
    const mapped = AUTH_SERVER_MESSAGES[language][raw];
    if (mapped !== undefined && mapped !== "") {
      return mapped;
    }
    return raw;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(copy.errs.invalidEmail);
      return;
    }

    if (!password) {
      setError(copy.errs.passwordRequired);
      return;
    }

    if (password.length < 8) {
      setError(copy.errs.weakPassword);
      return;
    }

    if (!isLogin && password !== passwordConfirmation) {
      setError(copy.errs.mismatchPassword);
      return;
    }

    if (!isLogin && !acceptedTerms) {
      setError(copy.errs.termsRequired);
      return;
    }

    const trimmedUsername = username.trim();

    if (!isLogin && !trimmedUsername) {
      setError(copy.errs.nameRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      let response: Response;
      try {
        response = await fetch(`${apiBaseUrl}/auth/${mode}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isLogin
              ? { email: trimmedEmail, password, rememberMe }
              : {
                  username: trimmedUsername,
                  email: trimmedEmail,
                  password,
                  passwordConfirmation,
                  userType,
                  acceptedTerms,
                  rememberMe,
                  ...(phone.trim() !== "" ? { phone: phone.trim() } : {}),
                },
          ),
        });
      } catch (fetchErr) {
        const isNetwork =
          fetchErr instanceof TypeError ||
          (fetchErr instanceof Error &&
            (fetchErr.message === "Failed to fetch" ||
              fetchErr.name === "TypeError"));
        throw new Error(isNetwork ? copy.errs.network : copy.errs.fallback);
      }

      const rawBody = await response.text();
      const parsedJson = rawBody.trim()
        ? (tryParseJson(rawBody) as
            | AuthResponse
            | { message?: string | string[]; error?: string }
            | null)
        : null;

      if (!response.ok) {
        const fallback = copy.errs.fallback;

        let message = "";

        if (parsedJson !== null && typeof parsedJson === "object") {
          const errObj = parsedJson as {
            message?: unknown;
          };
          if (typeof errObj.message === "string") {
            message = errObj.message;
          } else if (Array.isArray(errObj.message)) {
            message = errObj.message
              .filter((m): m is string => typeof m === "string")
              .join(", ");
          }
        }

        message = message.trim() || fallback;
        throw new Error(translateServerMessage(message));
      }

      if (
        parsedJson === null ||
        typeof parsedJson !== "object" ||
        !("tokens" in parsedJson) ||
        !("user" in parsedJson) ||
        typeof (parsedJson as AuthResponse).tokens?.accessToken !== "string"
      ) {
        throw new Error(copy.errs.badResponse);
      }

      const authData = parsedJson as AuthResponse;
      persistAuthSession(
        authData.user,
        {
          accessToken: authData.tokens.accessToken,
          refreshToken: authData.tokens.refreshToken,
        },
        rememberMe,
      );

      const returnUrl = resolveReturnUrl(searchParams.get("returnUrl"));
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }
      router.push(authData.user.roleId === 2 ? "/dashboard" : "/home");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : copy.errs.fallback,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = isSubmitting
    ? copy.submitting
    : isLogin
      ? copy.login
      : copy.signup;

  return (
    <div className="flex min-h-dvh flex-col bg-white text-foreground">
      <Navbar
        start={<SiteLogoLanguageCluster logoHref="/" />}
        end={
          <nav
            className="flex flex-nowrap items-center gap-4"
            aria-label={isLogin ? "Login signup" : "Signup login"}
          >
            {isLogin ? (
              <>
                <span aria-current="page" className={NAV_MUTED_PAGE_CLASS}>
                  {copy.login}
                </span>
                <Link href="/signup" className={NAV_PRIMARY_LINK_CLASS}>
                  {copy.signup}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={NAV_LINK_MUTED_CLASS}>
                  {copy.login}
                </Link>
                <span aria-current="page" className={NAV_PRIMARY_PAGE_CLASS}>
                  {copy.signup}
                </span>
              </>
            )}
          </nav>
        }
      />

      <main className="flex flex-1 flex-col items-center bg-muted-surface px-4 pb-16 pt-10 sm:px-5 sm:pt-14">
        <div className="flex w-full max-w-[448px] flex-col items-center">
          <h1 className="text-balance text-center text-[30px] font-bold leading-9 text-title">
            {isLogin ? copy.login : copy.signup}
          </h1>
          <p className="mt-2 text-pretty text-center text-sm font-normal leading-5 text-subtitle">
            {isLogin ? copy.subtitleLogin : copy.subtitleSignup}
          </p>

          <Card className="mt-8 w-full px-5 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8">
            <form
              method="post"
              action={isLogin ? "/login" : "/signup"}
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6"
            >
              {!isLogin ? (
                <div
                  role="group"
                  aria-label={copy.accountType}
                  className="grid grid-cols-2 rounded-lg border border-border-input bg-muted-surface p-1"
                >
                  <button
                    type="button"
                    aria-pressed={userType === "customer"}
                    onClick={() => setUserType("customer")}
                    className={
                      userType === "customer"
                        ? SIGNUP_SEGMENT_ACTIVE
                        : SIGNUP_SEGMENT_INACTIVE
                    }
                  >
                    {copy.customer}
                  </button>
                  <button
                    type="button"
                    aria-pressed={userType === "owner"}
                    onClick={() => setUserType("owner")}
                    className={
                      userType === "owner"
                        ? SIGNUP_SEGMENT_ACTIVE
                        : SIGNUP_SEGMENT_INACTIVE
                    }
                  >
                    {copy.owner}
                  </button>
                </div>
              ) : null}

              {!isLogin ? (
                <FormField label={copy.name} htmlFor="signup-username">
                  <input
                    id="signup-username"
                    name="username"
                    autoComplete="name"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    className={textFieldClasses}
                    placeholder="Yamada Taro"
                  />
                </FormField>
              ) : null}

              <FormField
                label={copy.email}
                htmlFor={isLogin ? "login-email" : "signup-email"}
              >
                <InputWithLeading leading={<AuthLeadingMail />}>
                  <input
                    id={isLogin ? "login-email" : "signup-email"}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className={`${textFieldClasses} pl-10`}
                    placeholder="your@email.com"
                  />
                </InputWithLeading>
              </FormField>

              {!isLogin ? (
                <FormField label={copy.phone} htmlFor="signup-phone">
                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={textFieldClasses}
                    placeholder="+84 90 123 4567"
                  />
                </FormField>
              ) : null}

              <FormField
                label={copy.password}
                htmlFor={isLogin ? "login-password" : "signup-password"}
              >
                <PasswordInput
                  id={isLogin ? "login-password" : "signup-password"}
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  showPasswordLabel={copy.showPassword}
                  hidePasswordLabel={copy.hidePassword}
                />
              </FormField>

              {!isLogin ? (
                <FormField
                  label={copy.confirmPassword}
                  htmlFor="signup-password2"
                >
                  <PasswordInput
                    id="signup-password2"
                    name="passwordConfirmation"
                    autoComplete="new-password"
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                    showPasswordLabel={copy.showPassword}
                    hidePasswordLabel={copy.hidePassword}
                  />
                </FormField>
              ) : null}

              <div className="flex items-center justify-between gap-4 text-sm font-medium">
                <label className="flex cursor-pointer items-center gap-2 text-title">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-border-input accent-primary"
                    name="rememberMe"
                  />
                  {copy.remember}
                </label>
                {isLogin ? (
                  <Link
                    href="/forgot-password"
                    className="shrink-0 rounded-md font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
                  >
                    {copy.forgotPassword}
                  </Link>
                ) : null}
              </div>

              {!isLogin ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-title">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) =>
                      setAcceptedTerms(event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 rounded border-border-input accent-primary"
                    name="acceptedTerms"
                  />
                  {copy.terms}
                </label>
              ) : null}

              {error !== "" ? (
                <FormErrorAlert>{error}</FormErrorAlert>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[50px] w-full items-center justify-center rounded-lg bg-primary text-base font-medium text-white shadow-primary-glow transition-[background-color,box-shadow] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {submitLabel}
              </button>
            </form>

            <div className="relative mt-6 min-h-5">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t border-border-input" />
              <p className="relative mx-auto w-fit bg-white px-2 text-center text-sm font-normal leading-5 text-caption">
                {copy.or}
              </p>
            </div>

            <div className="mt-6 text-center text-sm leading-5">
              <p className="font-normal text-subtitle">
                {isLogin ? copy.noAccount : copy.hasAccount}
              </p>
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="mt-0 inline-block rounded-md font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
              >
                {isLogin ? copy.signup : copy.login}
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

/** Lucide wrappers: module-scope components (stable identity, avoids inline element factories). */

function AuthLeadingMail() {
  return (
    <Mail
      aria-hidden
      className="size-full shrink-0"
      strokeWidth={1.5}
    />
  );
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
