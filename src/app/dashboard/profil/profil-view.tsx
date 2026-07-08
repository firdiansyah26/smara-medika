"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Role } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "./actions";

type Membership = { tenant: string; role: Role };

export function ProfilView({
  name,
  email,
  activeTenant,
  memberships,
}: {
  name: string;
  email: string;
  activeTenant: string;
  memberships: Membership[];
}) {
  const { t } = useLocale();
  const [state, action, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const errMsg =
    state?.error === "wrongCurrent"
      ? t.profile.errWrong
      : state?.error === "weak"
        ? t.profile.errWeak
        : state?.error === "mismatch"
          ? t.profile.errMismatch
          : state?.error
            ? t.profile.errWrong
            : null;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.profile.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.profile.subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Info akun */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-ink">{t.profile.account}</h2>
          </div>
          <div className="p-4 text-sm">
            <div className="flex border-b border-slate-100 py-2">
              <span className="w-32 text-muted-foreground">{t.profile.name}</span>
              <span className="font-medium text-ink">{name}</span>
            </div>
            <div className="flex border-b border-slate-100 py-2">
              <span className="w-32 text-muted-foreground">{t.profile.email}</span>
              <span className="text-ink">{email}</span>
            </div>
            <div className="flex py-2">
              <span className="w-32 text-muted-foreground">
                {t.profile.activeTenant}
              </span>
              <span className="text-ink">{activeTenant}</span>
            </div>

            <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.profile.memberships}
            </h3>
            <ul className="mt-2 space-y-1">
              {memberships.map((m, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md bg-slate-50/70 px-2.5 py-1.5"
                >
                  <span className="text-ink">{m.tenant}</span>
                  <span className="rounded bg-mint px-2 py-0.5 text-xs font-semibold text-brand-deep">
                    {t.settings.roles[m.role]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ganti kata sandi */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-ink">
              {t.profile.changePassword}
            </h2>
          </div>
          <form ref={formRef} action={action} className="space-y-3 p-4">
            <div className="space-y-1">
              <Label htmlFor="current">{t.profile.current}</Label>
              <Input id="current" name="current" type="password" required className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="next">{t.profile.newPassword}</Label>
              <Input id="next" name="next" type="password" required className="h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">{t.profile.confirm}</Label>
              <Input id="confirm" name="confirm" type="password" required className="h-9" />
            </div>
            {errMsg && (
              <p className="text-xs font-medium text-red-600">{errMsg}</p>
            )}
            {state?.ok && (
              <p className="text-xs font-medium text-emerald-600">
                {t.profile.saved}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {t.profile.save}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
