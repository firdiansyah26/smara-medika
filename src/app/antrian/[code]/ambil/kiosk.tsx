"use client";

import { useState, useTransition } from "react";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/use-locale";
import { SERVICES } from "@/lib/queue";
import { takeTicket } from "../../actions";

type Ticket = { code: string; serviceLabel: string; at: string };

export function Kiosk({
  tenantCode,
  tenantName,
}: {
  tenantCode: string;
  tenantName: string;
}) {
  const { t, locale } = useLocale();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isPending, startTransition] = useTransition();

  const timeFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function pick(type: (typeof SERVICES)[number]["type"]) {
    startTransition(async () => {
      const res = await takeTicket(tenantCode, type);
      if (res.ok) {
        setTicket({
          code: res.code,
          serviceLabel: t.queue.services[type],
          at: timeFmt.format(new Date(res.createdAt)),
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-mint to-white">
      <header className="flex items-center justify-between px-6 py-4 print:hidden">
        <Logo />
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        {!ticket ? (
          <div className="w-full max-w-2xl text-center print:hidden">
            <h1 className="text-3xl font-bold tracking-tight text-ink">
              {t.queue.kiosk.title}
            </h1>
            <p className="mt-1 text-muted-foreground">{tenantName}</p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t.queue.kiosk.subtitle}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {SERVICES.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  disabled={isPending}
                  onClick={() => pick(s.type)}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-brand/20 bg-white px-4 py-8 text-lg font-bold text-ink shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg disabled:opacity-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-cyan text-2xl font-bold text-white">
                    {s.prefix}
                  </span>
                  {t.queue.services[s.type]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {tenantName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t.queue.kiosk.ticket}</p>
              <p className="mt-6 text-sm font-medium text-brand-deep">
                {ticket.serviceLabel}
              </p>
              <p className="mt-2 text-7xl font-black tracking-tight text-ink">
                {ticket.code}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">{ticket.at}</p>
              <p className="mt-4 text-sm text-muted-foreground">{t.queue.kiosk.goWait}</p>
            </div>

            <div className="mt-5 flex gap-3 print:hidden">
              <Button
                type="button"
                size="lg"
                onClick={() => window.print()}
                className="h-11 flex-1"
              >
                {t.queue.kiosk.print}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setTicket(null)}
                className="h-11 flex-1"
              >
                {t.queue.kiosk.takeAnother}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
