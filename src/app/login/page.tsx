"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/use-locale";
import { authenticate } from "./actions";

export default function LoginPage() {
  const { t } = useLocale();
  const [errorCode, formAction, pending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* Panel brand (kiri) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-brand-cyan lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="inline-flex">
          <Logo
            variant="full"
            className="[&_span]:!text-white [&_path:first-of-type]:fill-white [&_path:last-of-type]:stroke-brand"
          />
        </Link>
        <div className="text-white">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            {t.hero.headingLead} {t.hero.headingHighlight}
          </h2>
          <p className="mt-4 max-w-md text-white/85">{t.hero.paragraph}</p>
        </div>
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} SmaraMedika
        </p>
      </div>

      {/* Form (kanan) */}
      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              {t.login.title}
            </h1>
            <p className="mt-2 text-sm text-muted">{t.login.subtitle}</p>

            <form action={formAction} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-ink"
                >
                  {t.login.email}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="andi@sehatsentosa.id"
                  placeholder={t.login.emailPlaceholder}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-ink"
                  >
                    {t.login.password}
                  </label>
                  <span className="text-xs font-medium text-muted">
                    {t.login.forgot}
                  </span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={t.login.passwordPlaceholder}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {errorCode === "invalid" && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {t.login.invalid}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep disabled:opacity-60"
              >
                {pending ? "…" : t.login.submit}
              </button>
            </form>

            <p className="mt-6 rounded-lg bg-mint px-4 py-3 text-xs text-brand-deep">
              {t.login.demoHint}
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t.login.backHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
