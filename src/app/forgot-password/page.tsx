"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="flex items-center justify-between p-6">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.login.forgotTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.login.forgotSubtitle}
          </p>

          {state?.sent ? (
            <div className="mt-8 space-y-4">
              <p className="rounded-lg bg-mint px-4 py-3 text-sm text-brand-deep">
                {t.login.sentNotice}
              </p>
              {state.devUrl && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                  <p className="text-amber-800">{t.login.devLinkNotice}</p>
                  <Link
                    href={state.devUrl}
                    className="mt-2 inline-flex font-semibold text-brand underline"
                  >
                    {t.login.openResetLink}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form action={action} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t.login.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={t.login.emailPlaceholder}
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={pending}
                className="h-10 w-full"
              >
                {pending ? "…" : t.login.sendLink}
              </Button>
            </form>
          )}

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
