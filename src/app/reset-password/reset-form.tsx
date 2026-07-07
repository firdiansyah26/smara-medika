"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "./actions";

export function ResetForm({ token }: { token: string }) {
  const { t } = useLocale();
  const [state, action, pending] = useActionState(resetPassword, undefined);

  const errMsg =
    state?.error === "weak"
      ? t.login.errWeak
      : state?.error === "mismatch"
        ? t.login.errMismatch
        : state?.error
          ? t.login.errExpired
          : null;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="flex items-center justify-between p-6">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.login.resetTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.login.resetSubtitle}
          </p>

          <form action={action} className="mt-8 space-y-5">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2">
              <Label htmlFor="password">{t.login.newPassword}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder={t.login.passwordPlaceholder}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t.login.confirmPassword}</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                placeholder={t.login.passwordPlaceholder}
                className="h-10"
              />
            </div>

            {errMsg && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {errMsg}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="h-10 w-full"
            >
              {pending ? "…" : t.login.resetSubmit}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
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
            {t.login.title}
          </Link>
        </div>
      </div>
    </div>
  );
}
