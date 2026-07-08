"use client";

import { useRouter } from "next/navigation";
import type { InvoiceStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { createInvoice } from "./actions";

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  patient: string;
  mrNumber: string;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
};
export type PatientOption = { id: string; name: string; mrNumber: string };

export const STATUS_BADGE: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  UNPAID: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export function BillingTable({
  invoices,
  patients,
  canManage,
  page,
  pageCount,
}: {
  invoices: InvoiceRow[];
  patients: PatientOption[];
  canManage: boolean;
  page: number;
  pageCount: number;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.billing.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.billing.subtitle}
          </p>
        </div>
        {canManage && (
          <form action={createInvoice} className="flex items-center gap-2">
            <select
              name="patientId"
              required
              defaultValue=""
              className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="" disabled>
                {t.billing.selectPatient}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.mrNumber}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              {t.billing.newInvoice}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {invoices.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.billing.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.billing.colNo}</TableHead>
                <TableHead>{t.billing.colPatient}</TableHead>
                <TableHead>{t.billing.colDate}</TableHead>
                <TableHead className="text-right">{t.billing.colTotal}</TableHead>
                <TableHead>{t.billing.colStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  onClick={() => router.push(`/dashboard/billing/${inv.id}`)}
                  className="cursor-pointer hover:bg-mint/40"
                >
                  <TableCell className="font-mono text-xs text-ink">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-ink">{inv.patient}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {inv.mrNumber}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dateFmt.format(new Date(inv.createdAt))}
                  </TableCell>
                  <TableCell className="text-right font-medium text-ink">
                    {formatIDR(inv.total)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                        STATUS_BADGE[inv.status]
                      }
                    >
                      {t.billing.statuses[inv.status]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        hrefFor={(p) => `/dashboard/billing?page=${p}`}
      />
    </div>
  );
}
