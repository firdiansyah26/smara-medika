"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";
import type { IcdCode } from "@/lib/icd10";
import { saveEncounter, addDiagnosis, removeDiagnosis } from "../actions";

type Diagnosis = {
  id: string;
  icdCode: string;
  icdName: string;
  type: "PRIMER" | "SEKUNDER";
};
type Vital = {
  systolic: number | null;
  diastolic: number | null;
  temperature: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  spo2: number | null;
  weight: number | null;
  height: number | null;
};
export type EncounterData = {
  id: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  visitDate: string;
  status: "MENUNGGU" | "DIPERIKSA" | "SELESAI";
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vital: Vital | null;
  diagnoses: Diagnosis[];
};

const input =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";
const area = input + " min-h-20 resize-y";

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
        {right}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function DiagnosisSection({
  encounterId,
  diagnoses,
}: {
  encounterId: string;
  diagnoses: Diagnosis[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IcdCode[]>([]);
  const [selected, setSelected] = useState<IcdCode | null>(null);
  const [type, setType] = useState<"PRIMER" | "SEKUNDER">("PRIMER");
  const [pending, start] = useTransition();

  async function onSearch(q: string) {
    setQuery(q);
    setSelected(null);
    if (q.trim() === "") return setResults([]);
    const res = await fetch(`/api/icd?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    setResults(json.data ?? []);
  }

  function add() {
    if (!selected) return;
    start(async () => {
      const fd = new FormData();
      fd.set("encounterId", encounterId);
      fd.set("icdCode", selected.code);
      fd.set("icdName", selected.name);
      fd.set("type", type);
      await addDiagnosis(undefined, fd);
      setSelected(null);
      setQuery("");
      setResults([]);
      router.refresh();
    });
  }

  return (
    <Section title={t.records.editor.diagnosesTitle}>
      {diagnoses.length === 0 ? (
        <p className="text-sm text-muted">{t.records.editor.noDiagnoses}</p>
      ) : (
        <ul className="space-y-1.5">
          {diagnoses.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
            >
              <span className="min-w-0">
                <span className="font-mono text-xs font-semibold text-brand-deep">{d.icdCode}</span>{" "}
                <span className="text-ink">{d.icdName}</span>
                <span className="ml-2 rounded bg-slate-100 px-1.5 text-xs text-muted">
                  {d.type === "PRIMER" ? t.records.editor.primer : t.records.editor.sekunder}
                </span>
              </span>
              <form action={removeDiagnosis}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="shrink-0 text-muted hover:text-red-600" aria-label="remove">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Add diagnosis */}
      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.records.editor.searchIcd}
            className={input}
          />
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
              {results.map((r) => (
                <li key={r.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(r);
                      setQuery(`${r.code} — ${r.name}`);
                      setResults([]);
                    }}
                    className="flex w-full items-start gap-2 px-3 py-1.5 text-left text-sm hover:bg-mint"
                  >
                    <span className="font-mono text-xs font-semibold text-brand-deep">{r.code}</span>
                    <span className="text-ink">{r.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "PRIMER" | "SEKUNDER")}
            className={input + " w-36"}
          >
            <option value="PRIMER">{t.records.editor.primer}</option>
            <option value="SEKUNDER">{t.records.editor.sekunder}</option>
          </select>
          <button
            type="button"
            onClick={add}
            disabled={!selected || pending}
            className="rounded-md bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
          >
            {t.records.editor.add}
          </button>
        </div>
      </div>
    </Section>
  );
}

export function EncounterEditor({ data }: { data: EncounterData }) {
  const { t, locale } = useLocale();
  const [state, formAction, pending] = useActionState(saveEncounter, undefined);

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const v = data.vital;

  return (
    <div>
      <Link
        href="/dashboard/rekam-medis"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t.records.editor.back}
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <Link href={`/dashboard/pasien/${data.patientId}`} className="text-lg font-bold text-ink hover:text-brand-deep">
            {data.patientName}
          </Link>
          <p className="text-xs text-muted">
            <span className="font-mono">{data.mrNumber}</span> · {dateFmt.format(new Date(data.visitDate))}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <form action={formAction} className="space-y-4 lg:col-span-2">
          <input type="hidden" name="id" value={data.id} />
          <Section
            title={t.records.editor.soapTitle}
            right={
              <select name="status" defaultValue={data.status} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs">
                <option value="MENUNGGU">{t.records.status.MENUNGGU}</option>
                <option value="DIPERIKSA">{t.records.status.DIPERIKSA}</option>
                <option value="SELESAI">{t.records.status.SELESAI}</option>
              </select>
            }
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted">{t.records.editor.subjective}</label>
                <textarea name="subjective" defaultValue={data.subjective ?? ""} className={area} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">{t.records.editor.objective}</label>
                <textarea name="objective" defaultValue={data.objective ?? ""} className={area} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">{t.records.editor.assessment}</label>
                <textarea name="assessment" defaultValue={data.assessment ?? ""} className={area} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">{t.records.editor.plan}</label>
                <textarea name="plan" defaultValue={data.plan ?? ""} className={area} />
              </div>
            </div>
          </Section>

          <Section title={t.records.editor.vitalsTitle}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted">{t.records.editor.bloodPressure}</label>
                <div className="mt-1 flex items-center gap-1">
                  <input name="systolic" type="number" defaultValue={v?.systolic ?? ""} className={input} />
                  <span className="text-muted">/</span>
                  <input name="diastolic" type="number" defaultValue={v?.diastolic ?? ""} className={input} />
                </div>
              </div>
              {[
                ["temperature", t.records.editor.temperature, v?.temperature],
                ["heartRate", t.records.editor.heartRate, v?.heartRate],
                ["respiratoryRate", t.records.editor.respiratoryRate, v?.respiratoryRate],
                ["spo2", t.records.editor.spo2, v?.spo2],
                ["weight", t.records.editor.weight, v?.weight],
                ["height", t.records.editor.height, v?.height],
              ].map(([name, label, val]) => (
                <div key={name as string}>
                  <label className="text-xs font-medium text-muted">{label as string}</label>
                  <input
                    name={name as string}
                    type="number"
                    step="any"
                    defaultValue={(val as number | null | undefined) ?? ""}
                    className={input + " mt-1"}
                  />
                </div>
              ))}
            </div>
          </Section>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep disabled:opacity-60"
            >
              {pending ? t.records.editor.saving : t.records.editor.save}
            </button>
            {state?.ok && (
              <span className="text-sm font-medium text-brand-deep">✓ {t.records.editor.saved}</span>
            )}
            {state?.error && (
              <span className="text-sm font-medium text-red-600">{state.error}</span>
            )}
          </div>
        </form>

        {/* Diagnoses — aksi sendiri, di luar form save */}
        <div>
          <DiagnosisSection encounterId={data.id} diagnoses={data.diagnoses} />
        </div>
      </div>
    </div>
  );
}
