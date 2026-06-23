"use client";

import { useEffect } from "react";
import type { BillingCategory, InvoiceStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { formatIDR } from "@/lib/utils";

type PrintItem = {
  category: BillingCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export function InvoicePrint({
  data,
}: {
  data: {
    facilityName: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    patientName: string;
    mrNumber: string;
    address: string | null;
    createdAt: string;
    paidAt: string | null;
    discount: number;
    subtotal: number;
    total: number;
    items: PrintItem[];
  };
}) {
  const { t, locale } = useLocale();

  useEffect(() => {
    const tm = setTimeout(() => window.print(), 600);
    return () => clearTimeout(tm);
  }, []);

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-ink">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-ink pb-3">
        <div>
          <h1 className="text-xl font-bold">{data.facilityName}</h1>
          <p className="text-sm text-muted-foreground">SmaraMedika</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tracking-wide">
            {t.billing.invoiceLabel}
          </p>
          <p className="font-mono text-sm">{data.invoiceNumber}</p>
          <p className="text-sm">{dateFmt.format(new Date(data.createdAt))}</p>
        </div>
      </div>

      {/* Bill to */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.billing.billTo}
        </p>
        <p className="font-semibold">{data.patientName}</p>
        <p className="font-mono text-sm text-muted-foreground">{data.mrNumber}</p>
        {data.address && <p className="text-sm">{data.address}</p>}
      </div>

      {/* Items */}
      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-1.5">{t.billing.description}</th>
            <th className="py-1.5 text-right">{t.billing.qty}</th>
            <th className="py-1.5 text-right">{t.billing.unitPrice}</th>
            <th className="py-1.5 text-right">{t.billing.amount}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="py-1.5">
                <span className="font-medium">{it.description}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({t.billing.categories[it.category]})
                </span>
              </td>
              <td className="py-1.5 text-right">{it.quantity}</td>
              <td className="py-1.5 text-right">{formatIDR(it.unitPrice)}</td>
              <td className="py-1.5 text-right">{formatIDR(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-3 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span>{t.billing.subtotal}</span>
          <span>{formatIDR(data.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t.billing.discount}</span>
          <span>− {formatIDR(data.discount)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-ink pt-1 text-base font-bold">
          <span>{t.billing.grandTotal}</span>
          <span>{formatIDR(data.total)}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <span className="inline-block rounded border-2 border-ink px-4 py-1 text-sm font-bold uppercase tracking-wide">
          {t.billing.statuses[data.status]}
        </span>
        {data.status === "PAID" && data.paidAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t.billing.paidAt}: {dateFmt.format(new Date(data.paidAt))}
          </p>
        )}
      </div>
    </div>
  );
}
