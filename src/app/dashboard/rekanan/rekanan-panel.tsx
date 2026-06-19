"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TenantType } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  requestPartnership,
  respondPartnership,
  endPartnership,
} from "./actions";

export type PartnerItem = { id: string; name: string; type: TenantType };
export type TenantOption = { id: string; name: string; type: TenantType };

const emoji: Record<TenantType, string> = {
  RUMAH_SAKIT: "🏥",
  KLINIK: "🩺",
  APOTEK: "💊",
};

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function typeLabelOf(type: TenantType, types: string[]) {
  const idx = type === "RUMAH_SAKIT" ? 0 : type === "KLINIK" ? 1 : 2;
  return types[idx];
}

function Row({
  p,
  types,
  children,
}: {
  p: PartnerItem;
  types: string[];
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint text-sm">
        {emoji[p.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{p.name}</p>
        <p className="text-xs text-muted-foreground">{typeLabelOf(p.type, types)}</p>
      </div>
      {children}
    </li>
  );
}

export function RekananPanel({
  incoming,
  outgoing,
  active,
  candidates,
}: {
  incoming: PartnerItem[];
  outgoing: PartnerItem[];
  active: PartnerItem[];
  candidates: TenantOption[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState(candidates[0]?.id ?? "");

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  const typeLabel = (type: TenantType) => typeLabelOf(type, t.tenantTypes);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {t.partners.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.partners.subtitle}</p>

      {/* Ajukan rekanan */}
      <Card className="mt-6 gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t.partners.inviteTitle}
        </p>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.partners.noCandidates}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className={`${selectClass} max-w-xs`}
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {emoji[c.type]} {c.name} · {typeLabel(c.type)}
                </option>
              ))}
            </select>
            <Button
              size="lg"
              className="h-9"
              onClick={() => selected && run(() => requestPartnership(selected))}
            >
              {t.partners.send}
            </Button>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Permintaan masuk */}
        <Card className="gap-0 py-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              {t.partners.incoming}
            </h2>
          </div>
          {incoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t.partners.noIncoming}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {incoming.map((p) => (
                <Row key={p.id} p={p} types={t.tenantTypes}>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => run(() => respondPartnership(p.id, true))}
                    >
                      {t.partners.approve}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => run(() => respondPartnership(p.id, false))}
                    >
                      {t.partners.reject}
                    </Button>
                  </div>
                </Row>
              ))}
            </ul>
          )}
        </Card>

        {/* Rekanan aktif */}
        <Card className="gap-0 py-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              {t.partners.active}
            </h2>
          </div>
          {active.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t.partners.noActive}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {active.map((p) => (
                <Row key={p.id} p={p} types={t.tenantTypes}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(t.partners.endConfirm)) {
                        run(() => endPartnership(p.id));
                      }
                    }}
                  >
                    {t.partners.end}
                  </Button>
                </Row>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Menunggu persetujuan (outgoing) */}
      {outgoing.length > 0 && (
        <Card className="mt-6 gap-0 py-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              {t.partners.outgoing}
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {outgoing.map((p) => (
              <Row key={p.id} p={p} types={t.tenantTypes}>
                <Badge className="bg-amber-50 text-amber-700">
                  {t.partners.pending}
                </Badge>
              </Row>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
