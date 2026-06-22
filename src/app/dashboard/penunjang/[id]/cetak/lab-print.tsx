"use client";

import { useEffect } from "react";
import type { LabCategory, LabFlag, LabOrderStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";

type PrintItem = {
  testName: string;
  result: string | null;
  unit: string | null;
  referenceRange: string | null;
  flag: LabFlag | null;
};

export function LabResultPrint({
  data,
}: {
  data: {
    facilityName: string;
    orderNumber: string;
    category: LabCategory;
    status: LabOrderStatus;
    patientName: string;
    mrNumber: string;
    clinicalNote: string | null;
    createdAt: string;
    completedAt: string | null;
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
  const catLabel =
    data.category === "RADIOLOGI" ? t.diagnostics.catRad : t.diagnostics.catLab;

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-ink">
      <div className="flex items-start justify-between border-b-2 border-ink pb-3">
        <div>
          <h1 className="text-xl font-bold">{data.facilityName}</h1>
          <p className="text-sm text-muted-foreground">SmaraMedika</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tracking-wide">
            {t.diagnostics.title}
          </p>
          <p className="font-mono text-sm">{data.orderNumber}</p>
          <p className="text-sm">{catLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="font-semibold">{data.patientName}</p>
          <p className="font-mono text-muted-foreground">{data.mrNumber}</p>
        </div>
        <div className="text-right text-muted-foreground">
          <p>{dateFmt.format(new Date(data.createdAt))}</p>
          {data.completedAt && (
            <p>
              {t.diagnostics.completedAt}:{" "}
              {dateFmt.format(new Date(data.completedAt))}
            </p>
          )}
        </div>
      </div>
      {data.clinicalNote && (
        <p className="mt-2 text-sm">
          {t.diagnostics.clinicalNote}: {data.clinicalNote}
        </p>
      )}

      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-1.5">{t.diagnostics.testName}</th>
            <th className="py-1.5">{t.diagnostics.result}</th>
            <th className="py-1.5">{t.diagnostics.unit}</th>
            <th className="py-1.5">{t.diagnostics.refRange}</th>
            <th className="py-1.5">{t.diagnostics.flag}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="py-1.5 font-medium">{it.testName}</td>
              <td className="py-1.5">{it.result || "—"}</td>
              <td className="py-1.5">{it.unit || "—"}</td>
              <td className="py-1.5">{it.referenceRange || "—"}</td>
              <td className="py-1.5">
                {it.flag ? t.diagnostics.flags[it.flag] : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-center">
        <span className="inline-block rounded border-2 border-ink px-4 py-1 text-sm font-bold uppercase tracking-wide">
          {t.diagnostics.statuses[data.status]}
        </span>
      </div>
    </div>
  );
}
