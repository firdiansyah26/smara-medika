"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceType } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  callNext,
  recallTicket,
  serveTicket,
  skipTicket,
  registerVisit,
} from "./actions";

type ServiceInfo = {
  type: ServiceType;
  counters: string[];
  waitingCount: number;
  nextCode: string | null;
};
type Called = { id: string; code: string; counter: string | null };
type PatientOpt = { id: string; label: string };

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function QueuePanel({
  tenantCode,
  services,
  called,
  patients,
}: {
  tenantCode: string;
  services: ServiceInfo[];
  called: Called[];
  patients: PatientOpt[];
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
          <p className="mt-1 text-sm text-muted-foreground">{t.queue.panel.subtitle}</p>
        </div>
        {tenantCode && (
          <div className="flex items-center gap-2">
            <a
              href={`/antrian/${tenantCode}/display`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {t.queue.panel.openDisplay}
            </a>
            <a
              href={`/antrian/${tenantCode}/ambil`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {t.queue.panel.openKiosk}
            </a>
          </div>
        )}
      </div>

      {/* Layanan */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {services.map((s) => (
          <Card key={s.type} className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">{t.queue.services[s.type]}</h2>
              <Badge className="bg-mint text-brand-deep">
                {s.waitingCount} {t.queue.panel.waiting.toLowerCase()}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t.queue.panel.number}
              </p>
              <p className="text-3xl font-black tracking-tight text-ink">
                {s.nextCode ?? "—"}
              </p>
            </div>

            <div className="space-y-2">
              <select
                value={counters[s.type]}
                onChange={(e) =>
                  setCounters((c) => ({ ...c, [s.type]: e.target.value }))
                }
                className={selectClass}
              >
                {s.counters.map((c) => (
                  <option key={c} value={c}>
                    {t.queue.display.counter} {c}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="lg"
                disabled={s.waitingCount === 0}
                onClick={() => run(() => callNext(s.type, counters[s.type]))}
                className="h-9 w-full"
              >
                {t.queue.panel.callNext}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Sedang dipanggil */}
      <Card className="mt-8 gap-0 py-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">
            {t.queue.panel.called}
          </h2>
        </div>
        {called.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t.queue.panel.noWaiting}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {called.map((tk) => (
              <li key={tk.id} className="px-5 py-3">
               <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-tight text-ink">
                  {tk.code}
                </span>
                <Badge className="bg-mint text-brand-deep">
                  {t.queue.display.counter} {tk.counter}
                </Badge>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => run(() => recallTicket(tk.id))}
                  >
                    {t.queue.panel.recall}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => run(() => serveTicket(tk.id))}
                    className="border-brand/30 text-brand-deep hover:bg-mint"
                  >
                    {t.queue.panel.serve}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => run(() => skipTicket(tk.id))}
                  >
                    {t.queue.panel.skip}
                  </Button>
                </div>
               </div>
               <form action={registerVisit} className="mt-2 flex items-center gap-2">
                 <input type="hidden" name="ticketId" value={tk.id} />
                 <select name="patientId" required defaultValue="" className={selectClass + " max-w-xs"}>
                   <option value="" disabled>{t.queue.panel.selectPatient}</option>
                   {patients.map((p) => (
                     <option key={p.id} value={p.id}>{p.label}</option>
                   ))}
                 </select>
                 <Button type="submit" size="sm">{t.queue.panel.register}</Button>
               </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
