"use client";

import Link from "next/link";
import type { BillingCategory, InvoiceStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { formatIDR } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_BADGE } from "../billing-table";
import {
  addInvoiceItem,
  removeInvoiceItem,
  setDiscount,
  updateInvoiceStatus,
} from "../actions";

type Item = {
  id: string;
  category: BillingCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};
export type InvoiceDetailData = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  patient: string;
  mrNumber: string;
  discount: number;
  subtotal: number;
  total: number;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  items: Item[];
};

const CATEGORIES: BillingCategory[] = [
  "CONSULTATION",
  "DRUG",
  "PROCEDURE",
  "LAB",
  "OTHER",
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function InvoiceDetail({
  data,
  canManage,
}: {
  data: InvoiceDetailData;
  canManage: boolean;
}) {
  const { t, locale } = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isDraft = data.status === "DRAFT";
  const isUnpaid = data.status === "UNPAID";
  const editable = isDraft && canManage;
  const hasItems = data.items.length > 0;

  return (
    <div>
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t.billing.back}
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold text-ink">
              {data.invoiceNumber}
            </h1>
            <span
              className={
                "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                STATUS_BADGE[data.status]
              }
            >
              {t.billing.statuses[data.status]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-medium text-ink">{data.patient}</span>
            <span className="ml-2 font-mono text-xs">{data.mrNumber}</span>
            <span className="mx-2 text-slate-300">•</span>
            {dateFmt.format(new Date(data.createdAt))}
          </p>
          {data.status === "PAID" && data.paidAt && (
            <p className="mt-0.5 text-xs font-medium text-emerald-600">
              {t.billing.paidAt}: {dateFmt.format(new Date(data.paidAt))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/billing/${data.id}/cetak`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t.billing.print}
          </Link>
          {canManage && isDraft && (
            <form action={updateInvoiceStatus}>
              <input type="hidden" name="invoiceId" value={data.id} />
              <input type="hidden" name="status" value="UNPAID" />
              <Button type="submit" size="sm" disabled={!hasItems}>
                {t.billing.issue}
              </Button>
            </form>
          )}
          {canManage && isUnpaid && (
            <>
              <form action={updateInvoiceStatus}>
                <input type="hidden" name="invoiceId" value={data.id} />
                <input type="hidden" name="status" value="PAID" />
                <Button type="submit" size="sm">
                  {t.billing.markPaid}
                </Button>
              </form>
              <form
                action={updateInvoiceStatus}
                onSubmit={(e) => {
                  if (!window.confirm(t.billing.cancelConfirm))
                    e.preventDefault();
                }}
              >
                <input type="hidden" name="invoiceId" value={data.id} />
                <input type="hidden" name="status" value="CANCELLED" />
                <Button type="submit" variant="destructive" size="sm">
                  {t.billing.cancel}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <h2 className="text-sm font-semibold text-ink">
            {t.billing.itemsTitle}
          </h2>
        </div>
        {data.items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t.billing.noItems}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.billing.category}</TableHead>
                <TableHead>{t.billing.description}</TableHead>
                <TableHead className="text-right">{t.billing.qty}</TableHead>
                <TableHead className="text-right">{t.billing.unitPrice}</TableHead>
                <TableHead className="text-right">{t.billing.amount}</TableHead>
                {editable && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="text-muted-foreground">
                    {t.billing.categories[it.category]}
                  </TableCell>
                  <TableCell className="text-ink">{it.description}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {it.quantity}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatIDR(it.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-ink">
                    {formatIDR(it.amount)}
                  </TableCell>
                  {editable && (
                    <TableCell className="text-right">
                      <form action={removeInvoiceItem}>
                        <input type="hidden" name="itemId" value={it.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          {t.billing.remove}
                        </button>
                      </form>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Tambah item (draft) */}
        {editable && (
          <form
            action={addInvoiceItem}
            className="flex flex-wrap items-end gap-2 border-t border-slate-200 bg-slate-50/60 p-3"
          >
            <input type="hidden" name="invoiceId" value={data.id} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.billing.category}
              </label>
              <select name="category" defaultValue="CONSULTATION" className={inputClass}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.billing.categories[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[12rem] flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.billing.description}
              </label>
              <Input name="description" required className="h-9" />
            </div>
            <div className="w-20 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.billing.qty}
              </label>
              <Input name="quantity" type="number" min={1} defaultValue={1} className="h-9" />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.billing.unitPrice}
              </label>
              <Input name="unitPrice" type="number" min={0} defaultValue={0} className="h-9" />
            </div>
            <Button type="submit" size="sm">
              {t.billing.addItem}
            </Button>
          </form>
        )}

        {/* Total */}
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t.billing.subtotal}</span>
              <span className="font-medium text-ink">
                {formatIDR(data.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t.billing.discount}</span>
              {editable ? (
                <form action={setDiscount} className="flex items-center gap-1.5">
                  <input type="hidden" name="invoiceId" value={data.id} />
                  <Input
                    name="discount"
                    type="number"
                    min={0}
                    defaultValue={data.discount}
                    className="h-8 w-28 text-right"
                  />
                  <Button type="submit" size="xs" variant="outline">
                    {t.billing.saveDiscount}
                  </Button>
                </form>
              ) : (
                <span className="font-medium text-ink">
                  − {formatIDR(data.discount)}
                </span>
              )}
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-ink">
              <span>{t.billing.grandTotal}</span>
              <span>{formatIDR(data.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
