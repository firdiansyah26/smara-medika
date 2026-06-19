"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_BADGE } from "../transfer-list";
import { advanceOrder, receiveOrder, rejectOrder, cancelOrder } from "../actions";

type Item = { name: string; unit: string; quantity: number };
type Track = { status: OrderStatus; note: string | null; createdAt: string };
export type OrderData = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  isSupplier: boolean;
  requesterName: string;
  supplierName: string;
  note: string | null;
  items: Item[];
  trackings: Track[];
};

const CANCELABLE: OrderStatus[] = ["REQUESTED", "CONFIRMED", "PREPARING"];
const ADVANCEABLE: OrderStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "IN_TRANSIT",
];

export function OrderDetail({ data }: { data: OrderData }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  const s = data.status;
  const supplierCanAdvance = data.isSupplier && ADVANCEABLE.includes(s);
  const supplierCanReject = data.isSupplier && s === "REQUESTED";
  const requesterCanReceive = !data.isSupplier && s === "DELIVERED";
  const requesterCanCancel = !data.isSupplier && CANCELABLE.includes(s);

  return (
    <div>
      <Link
        href="/dashboard/transfer-obat"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t.transfer.back}
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold text-ink">{data.orderNumber}</h1>
            <Badge className={STATUS_BADGE[s]}>{t.transfer.statuses[s]}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data.requesterName} → {data.supplierName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {supplierCanReject && (
            <Button variant="destructive" size="sm" onClick={() => run(() => rejectOrder(data.id))}>
              {t.transfer.reject}
            </Button>
          )}
          {supplierCanAdvance && (
            <Button size="sm" onClick={() => run(() => advanceOrder(data.id))}>
              {t.transfer.advance}
            </Button>
          )}
          {requesterCanReceive && (
            <Button size="sm" onClick={() => run(() => receiveOrder(data.id))}>
              {t.transfer.receive}
            </Button>
          )}
          {requesterCanCancel && (
            <Button variant="outline" size="sm" onClick={() => run(() => cancelOrder(data.id))}>
              {t.transfer.cancel}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Items */}
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">{t.transfer.items}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {data.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium text-ink">{it.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {it.quantity} {it.unit}
                  </span>
                </li>
              ))}
            </ul>
            {data.note && (
              <p className="border-t border-slate-100 px-5 py-3 text-sm text-muted-foreground">
                {t.transfer.note}: {data.note}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">{t.transfer.timeline}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <ol className="space-y-3">
              {data.trackings.map((tr, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {t.transfer.statuses[tr.status]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dateFmt.format(new Date(tr.createdAt))}
                      {tr.note ? ` · ${tr.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
