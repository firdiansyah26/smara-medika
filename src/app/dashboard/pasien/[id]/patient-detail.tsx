"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/use-locale";
import { calcAgeParts } from "@/lib/utils";
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
  createdAt: string;
  visits: Visit[];
  allergies: Allergy[];
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b border-slate-100 last:border-b-0">
      <div className="w-32 shrink-0 bg-slate-50/70 px-3 py-1.5 text-xs font-medium text-muted">
        {label}
      </div>
      <div className="flex-1 px-3 py-1.5 text-sm text-ink">{value || "—"}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <h3 className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}

export function PatientDetail({ data }: { data: PatientDetailData }) {
  const { t, locale } = useLocale();
  const [allergyState, allergyAction, allergyPending] = useActionState(
    addAllergy,
    undefined,
  );

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const ap = calcAgeParts(new Date(data.birthDate));
  const ageFull = `${ap.years} ${t.patients.ageParts.years} ${ap.months} ${t.patients.ageParts.months} ${ap.days} ${t.patients.ageParts.days}`;
  const genderLabel = data.gender === "LAKI_LAKI" ? t.patients.male : t.patients.female;

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
      {/* Header bar (ERP) */}
      <Link
        href="/dashboard/pasien"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t.patients.detail.back}
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-cyan text-sm font-bold text-white">
            {data.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-ink">{data.name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="font-mono">{data.mrNumber}</span>
              <span className="text-slate-300">•</span>
              <span>{genderLabel}</span>
              <span className="text-slate-300">•</span>
              <span>{data.age} {t.patients.years}</span>
              {data.bloodType && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="rounded bg-red-50 px-1.5 font-semibold text-red-600">
                    {data.bloodType}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/pasien/${data.id}/edit`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
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
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              {t.patients.detail.deleteBtn}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Kolom kiri: info */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Section title={t.patients.detail.identity}>
              <Field label={t.patients.form.nik} value={data.nik} />
              <Field label={t.patients.form.gender} value={genderLabel} />
              <Field
                label={t.patients.form.birthDate}
                value={dateFmt.format(new Date(data.birthDate))}
              />
              <Field label={t.patients.detail.ageLabel} value={ageFull} />
              <Field label={t.patients.form.bloodType} value={data.bloodType} />
            </Section>

            <Section title={t.patients.detail.contact}>
              <Field label={t.patients.form.phone} value={data.phone} />
              <Field label={t.patients.form.city} value={data.city} />
              <Field label={t.patients.form.address} value={data.address} />
              <Field
                label={t.patients.form.emergencyContact}
                value={data.emergencyContact}
              />
            </Section>
          </div>

          <Section title={t.patients.detail.administration}>
            <div className="grid sm:grid-cols-2">
              <Field label="No. RM" value={<span className="font-mono">{data.mrNumber}</span>} />
              <Field label={t.patients.form.bpjs} value={data.bpjsNumber} />
              <Field
                label={t.patients.detail.registered}
                value={dateFmt.format(new Date(data.createdAt))}
              />
            </div>
          </Section>

          {/* Riwayat kunjungan */}
          <Section title={t.patients.detail.visitsTitle}>
            {data.visits.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted">
                {t.patients.detail.noVisits}
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.visits.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-1.5 text-ink">
                        {dateFmt.format(new Date(v.visitDate))}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <span className="rounded bg-mint px-1.5 py-0.5 text-xs font-medium text-brand-deep">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </div>

        {/* Kolom kanan: alergi */}
        <div>
          <Section title={t.patients.detail.allergiesTitle}>
            <div className="p-3">
              {data.allergies.length === 0 ? (
                <p className="text-sm text-muted">{t.patients.detail.noAllergies}</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.allergies.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-md bg-red-50 px-2.5 py-1.5 text-sm text-red-800"
                    >
                      <span className="font-semibold">{a.allergen}</span>
                      {a.severity && (
                        <span className="ml-1.5 text-xs">({sevLabel(a.severity)})</span>
                      )}
                      {a.reaction && (
                        <span className="block text-xs text-red-700/80">{a.reaction}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <form action={allergyAction} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {t.patients.detail.addAllergyTitle}
                </p>
                <input type="hidden" name="patientId" value={data.id} />
                <input name="allergen" required placeholder={t.patients.detail.allergen} className={inputClass} />
                <input name="reaction" placeholder={t.patients.detail.reaction} className={inputClass} />
                <select name="severity" defaultValue="" className={inputClass}>
                  <option value="">{t.patients.detail.selectSeverity}</option>
                  <option value="RINGAN">{t.patients.detail.sevRingan}</option>
                  <option value="SEDANG">{t.patients.detail.sevSedang}</option>
                  <option value="BERAT">{t.patients.detail.sevBerat}</option>
                </select>
                {allergyState?.error && (
                  <p className="text-xs font-medium text-red-600">{allergyState.error}</p>
                )}
                <button
                  type="submit"
                  disabled={allergyPending}
                  className="w-full rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
                >
                  {t.patients.detail.addAllergyBtn}
                </button>
              </form>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
