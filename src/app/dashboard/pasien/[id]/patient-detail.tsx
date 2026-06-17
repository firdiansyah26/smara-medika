"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/use-locale";
import { addAllergy, softDeletePatient } from "../actions";

type Visit = { id: string; visitDate: string; status: string };
type Allergy = {
  id: string;
  allergen: string;
  reaction: string | null;
  severity: "RINGAN" | "SEDANG" | "BERAT" | null;
};
export type PatientDetailData = {
  id: string;
  mrNumber: string;
  name: string;
  nik: string | null;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  bloodType: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  bpjsNumber: string | null;
  emergencyContact: string | null;
  birthDate: string;
  age: number;
  visits: Visit[];
  allergies: Allergy[];
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function PatientDetail({ data }: { data: PatientDetailData }) {
  const { t, locale } = useLocale();
  const [allergyState, allergyAction, allergyPending] = useActionState(
    addAllergy,
    undefined,
  );

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sevLabel = (s: Allergy["severity"]) =>
    s === "RINGAN"
      ? t.patients.detail.sevRingan
      : s === "SEDANG"
        ? t.patients.detail.sevSedang
        : s === "BERAT"
          ? t.patients.detail.sevBerat
          : "";

  const info: Array<[string, string]> = [
    [t.patients.columns.gender, data.gender === "LAKI_LAKI" ? t.patients.male : t.patients.female],
    [t.patients.columns.age, `${data.age} ${t.patients.years}`],
    [t.patients.form.birthDate, dateFmt.format(new Date(data.birthDate))],
    [t.patients.form.nik, data.nik ?? "—"],
    [t.patients.form.bloodType, data.bloodType ?? "—"],
    [t.patients.form.phone, data.phone ?? "—"],
    [t.patients.form.city, data.city ?? "—"],
    [t.patients.form.address, data.address ?? "—"],
    [t.patients.form.bpjs, data.bpjsNumber ?? "—"],
    [t.patients.form.emergencyContact, data.emergencyContact ?? "—"],
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/pasien"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t.patients.detail.back}
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {data.name}
          </h1>
          <p className="font-mono text-xs text-muted">{data.mrNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/pasien/${data.id}/edit`}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
          >
            {t.patients.detail.edit}
          </Link>
          <form
            action={softDeletePatient}
            onSubmit={(e) => {
              if (!window.confirm(t.patients.detail.deleteConfirm)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={data.id} />
            <button
              type="submit"
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              {t.patients.detail.deleteBtn}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-ink">
              {t.patients.detail.infoTitle}
            </h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {info.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visits */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-ink">
              {t.patients.detail.visitsTitle}
            </h2>
            {data.visits.length === 0 ? (
              <p className="mt-4 text-sm text-muted">{t.patients.detail.noVisits}</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.visits.map((v) => (
                  <li key={v.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-ink">
                      {dateFmt.format(new Date(v.visitDate))}
                    </span>
                    <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-brand-deep">
                      {v.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-ink">
              {t.patients.detail.allergiesTitle}
            </h2>
            {data.allergies.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                {t.patients.detail.noAllergies}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.allergies.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
                  >
                    <span className="font-semibold">{a.allergen}</span>
                    {a.severity && (
                      <span className="ml-2 text-xs">({sevLabel(a.severity)})</span>
                    )}
                    {a.reaction && (
                      <span className="block text-xs text-red-700/80">
                        {a.reaction}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Add allergy */}
            <form action={allergyAction} className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-ink">
                {t.patients.detail.addAllergyTitle}
              </p>
              <input type="hidden" name="patientId" value={data.id} />
              <input
                name="allergen"
                required
                placeholder={t.patients.detail.allergen}
                className={inputClass}
              />
              <input
                name="reaction"
                placeholder={t.patients.detail.reaction}
                className={inputClass}
              />
              <select name="severity" defaultValue="" className={inputClass}>
                <option value="">{t.patients.detail.selectSeverity}</option>
                <option value="RINGAN">{t.patients.detail.sevRingan}</option>
                <option value="SEDANG">{t.patients.detail.sevSedang}</option>
                <option value="BERAT">{t.patients.detail.sevBerat}</option>
              </select>
              {allergyState?.error && (
                <p className="text-xs font-medium text-red-600">
                  {allergyState.error}
                </p>
              )}
              <button
                type="submit"
                disabled={allergyPending}
                className="w-full rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
              >
                {t.patients.detail.addAllergyBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
