"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceType } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { callNext, recallTicket, serveTicket, skipTicket } from "./actions";

type ServiceInfo = {
  type: ServiceType;
  counters: string[];
  waitingCount: number;
  nextCode: string | null;
};
type Called = { id: string; code: string; counter: string | null };

export function QueuePanel({
  tenantCode,
  services,
  called,
}: {
  tenantCode: string;
  services: ServiceInfo[];
  called: Called[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [counters, setCounters] = useState<Record<string, string>>(
    Object.fromEntries(services.map((s) => [s.type, s.counters[0]])),
  );

  // Auto-refresh agar antrian masuk dari kiosk terlihat.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(id);
  }, [router]);

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.queue.panel.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.queue.panel.subtitle}</p>
        </div>
        {tenantCode && (
          <div className="flex items-center gap-2">
            <a
              href={`/antrian/${tenantCode}/display`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
            >
              {t.queue.panel.openDisplay}
            </a>
            <a
              href={`/antrian/${tenantCode}/ambil`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
            >
              {t.queue.panel.openKiosk}
            </a>
          </div>
        )}
      </div>

      {/* Layanan */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {services.map((s) => (
          <div key={s.type} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">{t.queue.services[s.type]}</h2>
              <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold text-brand-deep">
                {s.waitingCount} {t.queue.panel.waiting.toLowerCase()}
              </span>
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted">
              {t.queue.panel.number}
            </p>
            <p className="text-3xl font-black tracking-tight text-ink">
              {s.nextCode ?? "—"}
            </p>

            <div className="mt-4 space-y-2">
              <select
                value={counters[s.type]}
                onChange={(e) =>
                  setCounters((c) => ({ ...c, [s.type]: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {s.counters.map((c) => (
                  <option key={c} value={c}>
                    {t.queue.display.counter} {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={s.waitingCount === 0}
                onClick={() => run(() => callNext(s.type, counters[s.type]))}
                className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
              >
                {t.queue.panel.callNext}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sedang dipanggil */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">
            {t.queue.panel.called}
          </h2>
        </div>
        {called.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {t.queue.panel.noWaiting}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {called.map((tk) => (
              <li key={tk.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-2xl font-black tracking-tight text-ink">
                  {tk.code}
                </span>
                <span className="rounded-md bg-mint px-2 py-0.5 text-xs font-semibold text-brand-deep">
                  {t.queue.display.counter} {tk.counter}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => run(() => recallTicket(tk.id))}
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-ink hover:bg-slate-50"
                  >
                    {t.queue.panel.recall}
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => serveTicket(tk.id))}
                    className="rounded-md border border-brand/30 px-2.5 py-1 text-xs font-semibold text-brand-deep hover:bg-mint"
                  >
                    {t.queue.panel.serve}
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => skipTicket(tk.id))}
                    className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t.queue.panel.skip}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
