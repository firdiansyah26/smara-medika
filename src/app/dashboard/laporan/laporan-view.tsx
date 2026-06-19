"use client";

import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
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

export type ReportType = "visits" | "transfer";
export type VisitRow = {
  date: string;
  patient: string;
  mrNumber: string;
  doctor: string;
  status: "MENUNGGU" | "DIPERIKSA" | "SELESAI";
  diagnoses: number;
};
export type TransferRow = {
  date: string;
  orderNo: string;
  direction: "out" | "in";
  partner: string;
  status: OrderStatus;
  qty: number;
};

const PERIODS = ["today", "week", "month", "all"] as const;

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function LaporanView({
  type,
  period,
  visits,
  transfers,
}: {
  type: ReportType;
  period: (typeof PERIODS)[number];
  visits: VisitRow[];
  transfers: TransferRow[];
}) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const go = (next: { type?: ReportType; period?: string }) =>
    router.push(
      `/dashboard/laporan?type=${next.type ?? type}&period=${next.period ?? period}`,
    );

  const count = type === "visits" ? visits.length : transfers.length;

  function exportCsv() {
    if (type === "visits") {
      downloadCsv(
        `laporan-kunjungan-${period}.csv`,
        [t.reports.colDate, t.reports.colPatient, "No. RM", t.reports.colDoctor, t.reports.colStatus, t.reports.colDiagnoses],
        visits.map((v) => [
          dateFmt.format(new Date(v.date)),
          v.patient,
          v.mrNumber,
          v.doctor,
          t.records.status[v.status],
          String(v.diagnoses),
        ]),
      );
    } else {
      downloadCsv(
        `laporan-transfer-${period}.csv`,
        [t.reports.colDate, t.reports.colOrderNo, t.reports.colDirection, t.reports.colPartner, t.reports.colStatus, t.reports.colQty],
        transfers.map((o) => [
          dateFmt.format(new Date(o.date)),
          o.orderNo,
          o.direction === "out" ? t.reports.dirOut : t.reports.dirIn,
          o.partner,
          t.transfer.statuses[o.status],
          String(o.qty),
        ]),
      );
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.reports.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.reports.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={count === 0}>
            {t.reports.exportCsv}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={count === 0}>
            {t.reports.print}
          </Button>
        </div>
      </div>

      {/* Kontrol */}
      <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
          {(["visits", "transfer"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => go({ type: k })}
              className={
                "rounded-md px-3 py-1.5 transition-colors " +
                (type === k ? "bg-brand text-white" : "text-muted-foreground hover:text-ink")
              }
            >
              {k === "visits" ? t.reports.typeVisits : t.reports.typeTransfer}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => go({ period: p })}
              className={
                "rounded-md px-2.5 py-1 transition-colors " +
                (period === p ? "bg-brand text-white" : "text-muted-foreground hover:text-ink")
              }
            >
              {t.dashboardHome.period[p]}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {t.reports.total}: <b className="text-ink">{count}</b>
        </span>
      </div>

      <h2 className="mt-6 hidden text-lg font-bold print:block">
        {t.reports.title} — {type === "visits" ? t.reports.typeVisits : t.reports.typeTransfer}
      </h2>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {count === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.reports.empty}
          </p>
        ) : type === "visits" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.reports.colDate}</TableHead>
                <TableHead>{t.reports.colPatient}</TableHead>
                <TableHead>{t.reports.colDoctor}</TableHead>
                <TableHead>{t.reports.colStatus}</TableHead>
                <TableHead className="text-right">{t.reports.colDiagnoses}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((v, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dateFmt.format(new Date(v.date))}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-ink">{v.patient}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{v.mrNumber}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.doctor}</TableCell>
                  <TableCell className="text-muted-foreground">{t.records.status[v.status]}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{v.diagnoses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.reports.colDate}</TableHead>
                <TableHead>{t.reports.colOrderNo}</TableHead>
                <TableHead>{t.reports.colDirection}</TableHead>
                <TableHead>{t.reports.colPartner}</TableHead>
                <TableHead>{t.reports.colStatus}</TableHead>
                <TableHead className="text-right">{t.reports.colQty}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((o, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dateFmt.format(new Date(o.date))}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{o.orderNo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.direction === "out" ? t.reports.dirOut : t.reports.dirIn}
                  </TableCell>
                  <TableCell className="font-medium text-ink">{o.partner}</TableCell>
                  <TableCell className="text-muted-foreground">{t.transfer.statuses[o.status]}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{o.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
