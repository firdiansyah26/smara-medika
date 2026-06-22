"use client";

import { useRouter } from "next/navigation";
import type { LabCategory, LabOrderStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLabOrder } from "./actions";

export type LabOrderRow = {
  id: string;
  orderNumber: string;
  patient: string;
  mrNumber: string;
  category: LabCategory;
  status: LabOrderStatus;
  createdAt: string;
};
export type PatientOption = { id: string; name: string; mrNumber: string };

export const STATUS_BADGE: Record<LabOrderStatus, string> = {
  REQUESTED: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export function PenunjangTable({
  orders,
  patients,
  canManage,
}: {
  orders: LabOrderRow[];
  patients: PatientOption[];
  canManage: boolean;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const catLabel = (c: LabCategory) =>
    c === "RADIOLOGI" ? t.diagnostics.catRad : t.diagnostics.catLab;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.diagnostics.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.diagnostics.subtitle}
          </p>
        </div>
        {canManage && (
          <form action={createLabOrder} className="flex items-center gap-2">
            <select
              name="patientId"
              required
              defaultValue=""
              className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="" disabled>
                {t.diagnostics.selectPatient}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.mrNumber}
                </option>
              ))}
            </select>
            <select
              name="category"
              defaultValue="LABORATORIUM"
              className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="LABORATORIUM">{t.diagnostics.catLab}</option>
              <option value="RADIOLOGI">{t.diagnostics.catRad}</option>
            </select>
            <Button type="submit" size="sm">
              {t.diagnostics.newOrder}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {orders.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.diagnostics.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.diagnostics.colNo}</TableHead>
                <TableHead>{t.diagnostics.colPatient}</TableHead>
                <TableHead>{t.diagnostics.colCategory}</TableHead>
                <TableHead>{t.diagnostics.colDate}</TableHead>
                <TableHead>{t.diagnostics.colStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => router.push(`/dashboard/penunjang/${o.id}`)}
                  className="cursor-pointer hover:bg-mint/40"
                >
                  <TableCell className="font-mono text-xs text-ink">
                    {o.orderNumber}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-ink">{o.patient}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {o.mrNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {catLabel(o.category)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dateFmt.format(new Date(o.createdAt))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                        STATUS_BADGE[o.status]
                      }
                    >
                      {t.diagnostics.statuses[o.status]}
                    </span>
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
