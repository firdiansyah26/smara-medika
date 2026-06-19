"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RecordRow = {
  id: string;
  date: string;
  patientName: string;
  mrNumber: string;
  status: "MENUNGGU" | "DIPERIKSA" | "SELESAI";
  diagnosesCount: number;
};

const statusClass: Record<RecordRow["status"], string> = {
  MENUNGGU: "bg-amber-50 text-amber-700",
  DIPERIKSA: "bg-sky-50 text-sky-700",
  SELESAI: "bg-emerald-50 text-emerald-700",
};

export function RecordsList({ rows }: { rows: RecordRow[] }) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {t.records.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.records.subtitle}</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.records.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.records.columns.date}</TableHead>
                <TableHead>{t.records.columns.patient}</TableHead>
                <TableHead>{t.records.columns.status}</TableHead>
                <TableHead className="text-right">
                  {t.records.columns.diagnoses}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => router.push(`/dashboard/rekam-medis/${r.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dateFmt.format(new Date(r.date))}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-ink">{r.patientName}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {r.mrNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClass[r.status]}>
                      {t.records.status[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {r.diagnosesCount}
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
