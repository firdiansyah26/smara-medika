"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createOrder } from "./actions";

export type OrderRow = {
  id: string;
  orderNumber: string;
  partnerName: string;
  status: OrderStatus;
  totalQty: number;
};
export type PartnerStock = {
  id: string;
  name: string;
  drugs: { drugId: string; name: string; unit: string; stock: number }[];
};

export const STATUS_BADGE: Record<OrderStatus, string> = {
  REQUESTED: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-sky-50 text-sky-700",
  PREPARING: "bg-indigo-50 text-indigo-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  IN_TRANSIT: "bg-amber-50 text-amber-700",
  DELIVERED: "bg-cyan-50 text-cyan-700",
  RECEIVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function TransferList({
  outgoing,
  incoming,
  partners,
}: {
  outgoing: OrderRow[];
  incoming: OrderRow[];
  partners: PartnerStock[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<"outgoing" | "incoming">("outgoing");
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? "");

  const rows = tab === "outgoing" ? outgoing : incoming;
  const partnerDrugs = partners.find((p) => p.id === partnerId)?.drugs ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {t.transfer.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.transfer.subtitle}</p>

      {/* Buat order */}
      <Card className="mt-6 gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t.transfer.newOrder}
        </p>
        {partners.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.transfer.noPartners}</p>
        ) : (
          <form action={createOrder} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              name="supplierTenantId"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className={selectClass}
              required
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select name="drugId" className={selectClass} required>
              <option value="">{t.transfer.selectDrug}</option>
              {partnerDrugs.map((d) => (
                <option key={d.drugId} value={d.drugId}>
                  {d.name} ({t.transfer.stock}: {d.stock} {d.unit})
                </option>
              ))}
            </select>
            <Input
              name="quantity"
              type="number"
              min="1"
              placeholder={t.transfer.quantity}
              className="h-9"
              required
            />
            <div className="flex gap-2">
              <Input name="note" placeholder={t.transfer.note} className="h-9" />
              <Button type="submit" size="lg" className="h-9 shrink-0">
                {t.transfer.create}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Tabs */}
      <div className="mt-6 inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
        {(["outgoing", "incoming"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={
              "rounded-md px-3 py-1.5 transition-colors " +
              (tab === k ? "bg-brand text-white" : "text-muted-foreground hover:text-ink")
            }
          >
            {k === "outgoing" ? t.transfer.outgoing : t.transfer.incoming}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.transfer.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.transfer.orderNo}</TableHead>
                <TableHead>{t.transfer.partner}</TableHead>
                <TableHead>{t.transfer.items}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => router.push(`/dashboard/transfer-obat/${o.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.orderNumber}
                  </TableCell>
                  <TableCell className="font-medium text-ink">
                    {o.partnerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.totalQty}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[o.status]}>
                      {t.transfer.statuses[o.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
