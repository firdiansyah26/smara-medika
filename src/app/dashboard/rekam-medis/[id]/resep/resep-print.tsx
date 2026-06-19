"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/use-locale";

type RxItem = {
  drugName: string;
  unit: string;
  dosage: string | null;
  frequency: string | null;
  quantity: number;
  instruction: string | null;
};

export function ResepPrint({
  data,
}: {
  data: {
    facilityName: string;
    patientName: string;
    mrNumber: string;
    doctorName: string;
    visitDate: string;
    items: RxItem[];
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
      {/* Header faskes */}
      <div className="border-b-2 border-ink pb-3 text-center">
        <h1 className="text-xl font-bold">{data.facilityName}</h1>
        <p className="text-sm text-muted-foreground">SmaraMedika</p>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p>
            <span className="text-muted-foreground">{t.patients.title}:</span>{" "}
            <span className="font-medium">{data.patientName}</span>
          </p>
          <p>
            <span className="text-muted-foreground">No. RM:</span>{" "}
            <span className="font-mono">{data.mrNumber}</span>
          </p>
        </div>
        <p className="text-muted-foreground">{dateFmt.format(new Date(data.visitDate))}</p>
      </div>

      {/* Rx */}
      <div className="mt-6">
        <p className="text-3xl font-serif font-bold">℞</p>
        <ul className="mt-2 space-y-3">
          {data.items.map((it, i) => (
            <li key={i} className="border-b border-dashed border-slate-200 pb-2">
              <p className="font-semibold">
                {i + 1}. {it.drugName}{" "}
                <span className="font-normal text-muted-foreground">
                  No. {it.quantity} {it.unit}
                </span>
              </p>
              <p className="pl-4 text-sm text-muted-foreground">
                {[it.dosage, it.frequency, it.instruction].filter(Boolean).join(" · ") || "—"}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* TTD */}
      <div className="mt-10 flex justify-end">
        <div className="text-center text-sm">
          <p className="text-muted-foreground">{t.app.nav.records}</p>
          <div className="h-16" />
          <p className="border-t border-ink px-6 pt-1 font-medium">{data.doctorName}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-8 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white print:hidden"
      >
        {t.records.editor.rxPrint}
      </button>
    </div>
  );
}
