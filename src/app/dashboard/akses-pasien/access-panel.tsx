"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AccessRequestStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchAction, requestAccess, respondAccess } from "./actions";

export type IncomingItem = {
  id: string;
  patientName: string;
  requesterName: string;
  reason: string | null;
};
export type OutgoingItem = {
  id: string;
  patientId: string;
  patientName: string;
  ownerName: string;
  status: AccessRequestStatus;
  expiresAt: string | null;
};

const STATUS_BADGE: Record<AccessRequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  REVOKED: "bg-slate-100 text-slate-600",
};

export function AccessPanel({
  incoming,
  outgoing,
}: {
  incoming: IncomingItem[];
  outgoing: OutgoingItem[];
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [results, searchFormAction, searching] = useActionState(
    searchAction,
    null,
  );

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusLabel = (s: AccessRequestStatus) =>
    s === "PENDING"
      ? t.access.statusPending
      : s === "APPROVED"
        ? t.access.statusApproved
        : s === "REJECTED"
          ? t.access.statusRejected
          : t.access.statusRevoked;

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {t.access.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{t.access.subtitle}</p>

      {/* Pencarian lintas tenant */}
      <Card className="mt-6 gap-3 p-5">
        <form action={searchFormAction} className="flex gap-2">
          <Input
            name="q"
            placeholder={t.access.searchPlaceholder}
            className="h-9 max-w-md"
          />
          <Button type="submit" size="lg" className="h-9" disabled={searching}>
            {t.access.search}
          </Button>
        </form>

        {results !== null && (
          <div className="mt-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted">{t.access.noResults}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {results.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {r.name}
                        <span className="ml-2 text-xs text-muted">
                          {r.gender === "LAKI_LAKI" ? t.patients.male : t.patients.female}
                          {r.city ? ` · ${r.city}` : ""}
                        </span>
                      </p>
                      <p className="text-xs text-muted">
                        {t.access.owner}: {r.ownerName}
                        {r.nikMasked ? ` · NIK ${r.nikMasked}` : ""}
                      </p>
                    </div>
                    {r.requestStatus ? (
                      <Badge className={STATUS_BADGE[r.requestStatus]}>
                        {statusLabel(r.requestStatus)}
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => run(() => requestAccess(r.id, ""))}
                      >
                        {t.access.requestAccess}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Permintaan masuk */}
        <Card className="gap-0 py-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">{t.access.incoming}</h2>
          </div>
          {incoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              {t.access.noIncoming}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {incoming.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.patientName}
                    </p>
                    <p className="text-xs text-muted">
                      {r.requesterName}
                      {r.reason ? ` · ${r.reason}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => run(() => respondAccess(r.id, true))}>
                      {t.access.approve}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => run(() => respondAccess(r.id, false))}
                    >
                      {t.access.reject}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Permintaan saya */}
        <Card className="gap-0 py-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">{t.access.outgoing}</h2>
          </div>
          {outgoing.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              {t.access.noOutgoing}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {outgoing.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.patientName}
                    </p>
                    <p className="text-xs text-muted">
                      {r.ownerName}
                      {r.status === "APPROVED" && r.expiresAt
                        ? ` · ${t.access.expiresOn} ${dateFmt.format(new Date(r.expiresAt))}`
                        : ""}
                    </p>
                  </div>
                  {r.status === "APPROVED" ? (
                    <Link
                      href={`/dashboard/akses-pasien/${r.patientId}`}
                      className="rounded-md border border-brand/30 px-2.5 py-1 text-xs font-semibold text-brand-deep hover:bg-mint"
                    >
                      {t.access.view}
                    </Link>
                  ) : (
                    <Badge className={STATUS_BADGE[r.status]}>
                      {statusLabel(r.status)}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
