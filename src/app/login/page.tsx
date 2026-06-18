"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
              <div className="space-y-2">
                <Label htmlFor="email">{t.login.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="andi@sehatsentosa.id"
                  placeholder={t.login.emailPlaceholder}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.login.password}</Label>
                  <span className="text-xs font-medium text-muted">
                    {t.login.forgot}
                  </span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={t.login.passwordPlaceholder}
                  className="h-10"
                />
              </div>

              {errorCode === "invalid" && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {t.login.invalid}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={pending}
                className="h-10 w-full"
              >
                {pending ? "…" : t.login.submit}
              </Button>
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
