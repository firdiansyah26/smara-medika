"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";

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
      <p className="mt-1 text-sm text-muted">{t.records.subtitle}</p>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            {t.records.empty}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2 font-semibold">{t.records.columns.date}</th>
                  <th className="px-4 py-2 font-semibold">{t.records.columns.patient}</th>
                  <th className="px-4 py-2 font-semibold">{t.records.columns.status}</th>
                  <th className="px-4 py-2 text-right font-semibold">{t.records.columns.diagnoses}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/dashboard/rekam-medis/${r.id}`)}
                    className="cursor-pointer transition-colors hover:bg-mint/40"
                  >
                    <td className="whitespace-nowrap px-4 py-2 text-muted">
                      {dateFmt.format(new Date(r.date))}
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium text-ink">{r.patientName}</span>
                      <span className="ml-2 font-mono text-xs text-muted">{r.mrNumber}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={"rounded px-1.5 py-0.5 text-xs font-medium " + statusClass[r.status]}>
                        {t.records.status[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-muted">{r.diagnosesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
