"use client";

import Link from "next/link";
import { useLocale } from "@/lib/use-locale";
import { calcAgeParts } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Allergy = {
  allergen: string;
  reaction: string | null;
  severity: "RINGAN" | "SEDANG" | "BERAT" | null;
};
type Visit = { visitDate: string; status: string };
export type AccessViewData = {
  name: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  ownerName: string;
  birthDate: string;
  age: number;
  allergies: Allergy[];
  visits: Visit[];
} | null;

export function AccessView({ data }: { data: AccessViewData }) {
  const { t, locale } = useLocale();

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const back = (
    <Link
      href="/dashboard/akses-pasien"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {t.access.back}
    </Link>
  );

  if (!data) {
    return (
      <div>
        {back}
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t.access.noAccess}
        </p>
      </div>
    );
  }

  const ap = calcAgeParts(new Date(data.birthDate));
  const ageFull = `${ap.years} ${t.patients.ageParts.years} ${ap.months} ${t.patients.ageParts.months} ${ap.days} ${t.patients.ageParts.days}`;
  const sevLabel = (s: Allergy["severity"]) =>
    s === "RINGAN"
      ? t.patients.detail.sevRingan
      : s === "SEDANG"
        ? t.patients.detail.sevSedang
        : s === "BERAT"
          ? t.patients.detail.sevBerat
          : "";

  return (
    <div>
      {back}
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">{data.name}</h1>
      <p className="text-sm text-muted-foreground">
        {t.access.viewTitle} · {t.access.owner}: {data.ownerName}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">{t.access.visits}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.visits.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                {t.access.noVisits}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.visits.map((v, i) => (
                  <li key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                    <span className="text-ink">{dateFmt.format(new Date(v.visitDate))}</span>
                    <span className="text-muted-foreground">
                      {t.records?.status?.[v.status as "MENUNGGU" | "DIPERIKSA" | "SELESAI"] ?? v.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="gap-3 p-5">
          <div className="text-sm">
            <span className="text-muted-foreground">
              {data.gender === "LAKI_LAKI" ? t.patients.male : t.patients.female}
            </span>
            <span className="text-slate-300"> · </span>
            <span className="text-ink">{ageFull}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t.access.allergies}
            </p>
            {data.allergies.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t.access.noAllergies}</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {data.allergies.map((a, i) => (
                  <li key={i} className="rounded-md bg-red-50 px-2.5 py-1.5 text-sm text-red-800">
                    <span className="font-semibold">{a.allergen}</span>
                    {a.severity && <span className="ml-1.5 text-xs">({sevLabel(a.severity)})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
