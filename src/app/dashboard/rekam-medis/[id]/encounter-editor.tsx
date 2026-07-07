"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";
import type { IcdCode } from "@/lib/icd10";
import { interpretVitals } from "@/lib/vitals";
import {
  saveEncounter,
  addDiagnosis,
  removeDiagnosis,
  addPrescriptionItem,
  removePrescriptionItem,
} from "../actions";

type Diagnosis = {
  id: string;
  icdCode: string;
  icdName: string;
  type: "PRIMER" | "SEKUNDER";
};
type RxItem = {
  id: string;
  drugName: string;
  unit: string;
  dosage: string | null;
  frequency: string | null;
  quantity: number;
  instruction: string | null;
};
type DrugOption = { drugId: string; name: string; unit: string };
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
  prescriptionItems: RxItem[];
  drugOptions: DrugOption[];
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
        <p className="text-sm text-muted-foreground">{t.records.editor.noDiagnoses}</p>
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
                <span className="ml-2 rounded bg-slate-100 px-1.5 text-xs text-muted-foreground">
                  {d.type === "PRIMER" ? t.records.editor.primer : t.records.editor.sekunder}
                </span>
              </span>
              <form action={removeDiagnosis}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="shrink-0 text-muted-foreground hover:text-red-600" aria-label="remove">
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

function PrescriptionSection({
  encounterId,
  items,
  drugOptions,
}: {
  encounterId: string;
  items: RxItem[];
  drugOptions: DrugOption[];
}) {
  const { t } = useLocale();
  return (
    <Section
      title={t.records.editor.rxTitle}
      right={
        items.length > 0 ? (
          <span className="flex items-center gap-3">
            <a
              href={`/dashboard/rekam-medis/${encounterId}/resep/pdf`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand-deep hover:underline"
            >
              PDF
            </a>
            <a
              href={`/dashboard/rekam-medis/${encounterId}/resep`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand-deep hover:underline"
            >
              {t.records.editor.rxPrint}
            </a>
          </span>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.records.editor.rxEmpty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-start justify-between gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
            >
              <span className="min-w-0">
                <span className="font-medium text-ink">{it.drugName}</span>{" "}
                <span className="text-xs text-muted-foreground">× {it.quantity} {it.unit}</span>
                {(it.dosage || it.frequency || it.instruction) && (
                  <span className="block text-xs text-muted-foreground">
                    {[it.dosage, it.frequency, it.instruction].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <form action={removePrescriptionItem}>
                <input type="hidden" name="id" value={it.id} />
                <button type="submit" className="shrink-0 text-muted-foreground hover:text-red-600" aria-label="remove">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {drugOptions.length === 0 ? (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-muted-foreground">
          {t.records.editor.rxNoStock}
        </p>
      ) : (
        <form action={addPrescriptionItem} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <input type="hidden" name="encounterId" value={encounterId} />
          <select name="drugId" required defaultValue="" className={input}>
            <option value="" disabled>
              {t.records.editor.rxSelectDrug}
            </option>
            {drugOptions.map((d) => (
              <option key={d.drugId} value={d.drugId}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input name="dosage" placeholder={t.records.editor.rxDosage} className={input} />
            <input name="frequency" placeholder={t.records.editor.rxFrequency} className={input} />
            <input name="quantity" type="number" min="1" defaultValue={1} placeholder={t.records.editor.rxQty} className={input} />
            <input name="instruction" placeholder={t.records.editor.rxInstruction} className={input} />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            {t.records.editor.add}
          </button>
        </form>
      )}
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

  // Tanda vital terkontrol untuk indikator real-time.
  const [vitals, setVitals] = useState({
    systolic: v?.systolic?.toString() ?? "",
    diastolic: v?.diastolic?.toString() ?? "",
    temperature: v?.temperature?.toString() ?? "",
    heartRate: v?.heartRate?.toString() ?? "",
    respiratoryRate: v?.respiratoryRate?.toString() ?? "",
    spo2: v?.spo2?.toString() ?? "",
    weight: v?.weight?.toString() ?? "",
    height: v?.height?.toString() ?? "",
  });
  type VitalKey = keyof typeof vitals;
  const setVital = (k: VitalKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVitals((s) => ({ ...s, [k]: e.target.value }));
  const toNum = (s: string) => (s.trim() === "" ? undefined : Number(s));
  const alerts = useMemo(
    () =>
      interpretVitals({
        systolic: toNum(vitals.systolic),
        diastolic: toNum(vitals.diastolic),
        temperature: toNum(vitals.temperature),
        heartRate: toNum(vitals.heartRate),
        respiratoryRate: toNum(vitals.respiratoryRate),
        spo2: toNum(vitals.spo2),
        weight: toNum(vitals.weight),
        height: toNum(vitals.height),
      }),
    [vitals],
  );

  return (
    <div>
      <Link
        href="/dashboard/rekam-medis"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
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
          <p className="text-xs text-muted-foreground">
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
                <label className="text-xs font-medium text-muted-foreground">{t.records.editor.subjective}</label>
                <textarea name="subjective" defaultValue={data.subjective ?? ""} className={area} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.records.editor.objective}</label>
                <textarea name="objective" defaultValue={data.objective ?? ""} className={area} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.records.editor.assessment}</label>
                <textarea name="assessment" defaultValue={data.assessment ?? ""} className={area} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.records.editor.plan}</label>
                <textarea name="plan" defaultValue={data.plan ?? ""} className={area} />
              </div>
            </div>
          </Section>

          <Section title={t.records.editor.vitalsTitle}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground">{t.records.editor.bloodPressure}</label>
                <div className="mt-1 flex items-center gap-1">
                  <input name="systolic" type="number" value={vitals.systolic} onChange={setVital("systolic")} className={input} />
                  <span className="text-muted-foreground">/</span>
                  <input name="diastolic" type="number" value={vitals.diastolic} onChange={setVital("diastolic")} className={input} />
                </div>
              </div>
              {(
                [
                  ["temperature", t.records.editor.temperature],
                  ["heartRate", t.records.editor.heartRate],
                  ["respiratoryRate", t.records.editor.respiratoryRate],
                  ["spo2", t.records.editor.spo2],
                  ["weight", t.records.editor.weight],
                  ["height", t.records.editor.height],
                ] as [VitalKey, string][]
              ).map(([name, label]) => (
                <div key={name}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    name={name}
                    type="number"
                    step="any"
                    value={vitals[name]}
                    onChange={setVital(name)}
                    className={input + " mt-1"}
                  />
                </div>
              ))}
            </div>

            {alerts.length > 0 && (
              <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                {alerts.map((a) => (
                  <li
                    key={a.code}
                    className={
                      "flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs " +
                      (a.level === "crit"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-800")
                    }
                  >
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                    </svg>
                    {t.records.editor.vitalAlerts[a.code]}
                  </li>
                ))}
              </ul>
            )}
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

        {/* Diagnosa & resep — aksi sendiri, di luar form save */}
        <div className="space-y-4">
          <DiagnosisSection encounterId={data.id} diagnoses={data.diagnoses} />
          <PrescriptionSection
            encounterId={data.id}
            items={data.prescriptionItems}
            drugOptions={data.drugOptions}
          />
        </div>
      </div>
    </div>
  );
}
