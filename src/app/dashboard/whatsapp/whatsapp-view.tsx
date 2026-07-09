"use client";

import { useMemo, useState } from "react";
import type { NotificationType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  renderTemplate,
  waLink,
  WA_PURPOSE_LABEL,
  WA_PLACEHOLDERS,
} from "@/lib/wa-templates";
import { saveWaTemplate, logWaSend } from "./actions";

export type PatientOption = {
  id: string;
  name: string;
  mrNumber: string;
  phone: string;
};
export type TemplateRow = {
  purpose: NotificationType;
  body: string;
  isCustom: boolean;
};

const inputClass =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";
const areaClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

export function WhatsappView({
  facilityName,
  templates,
  patients,
  canEdit,
}: {
  facilityName: string;
  templates: TemplateRow[];
  patients: PatientOption[];
  canEdit: boolean;
}) {
  const templateByPurpose = useMemo(
    () => new Map(templates.map((t) => [t.purpose, t.body])),
    [templates],
  );

  const [purpose, setPurpose] = useState<NotificationType>(templates[0].purpose);
  const [patientId, setPatientId] = useState("");
  const patient = patients.find((p) => p.id === patientId);

  // Pesan dapat diedit bebas sebelum dikirim.
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  // Susun ulang pesan dari template saat purpose/pasien berubah (kecuali user sudah mengedit).
  const rendered = useMemo(
    () =>
      renderTemplate(templateByPurpose.get(purpose) ?? "", {
        patient: patient?.name,
        facility: facilityName,
      }),
    [templateByPurpose, purpose, patient, facilityName],
  );
  const effectiveMessage = touched ? message : rendered;

  const link = patient ? waLink(patient.phone, effectiveMessage) : null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">WhatsApp</h1>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
          Klik-untuk-chat
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Susun pesan dari template per keperluan, lalu buka WhatsApp untuk
        mengirim. Integrasi WhatsApp Business API (kirim otomatis) menyusul.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Composer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Susun Pesan
          </h2>
          <div className="mt-3 space-y-3">
            <label className="block text-xs font-medium text-slate-600">
              Keperluan
              <select
                className={`${inputClass} mt-1`}
                value={purpose}
                onChange={(e) => {
                  setPurpose(e.target.value as NotificationType);
                  setTouched(false);
                }}
              >
                {templates.map((t) => (
                  <option key={t.purpose} value={t.purpose}>
                    {WA_PURPOSE_LABEL[t.purpose]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Pasien
              <select
                className={`${inputClass} mt-1`}
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setTouched(false);
                }}
              >
                <option value="">Pilih pasien (punya no. HP)</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.mrNumber} ({p.phone})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Pesan (bisa diedit)
              <textarea
                rows={6}
                className={`${areaClass} mt-1`}
                value={effectiveMessage}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setTouched(true);
                }}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <Button
                    type="button"
                    onClick={() => {
                      const fd = new FormData();
                      fd.set("purpose", purpose);
                      fd.set("recipient", patient?.phone ?? "");
                      fd.set("patientName", patient?.name ?? "");
                      void logWaSend(fd);
                    }}
                  >
                    Buka WhatsApp
                  </Button>
                </a>
              ) : (
                <Button type="button" disabled>
                  Buka WhatsApp
                </Button>
              )}
              {!patient && (
                <span className="text-xs text-muted-foreground">
                  Pilih pasien dengan nomor HP terlebih dahulu.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Template editor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Template per Keperluan
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Placeholder tersedia:{" "}
            {WA_PLACEHOLDERS.map((p) => `{${p}}`).join(" ")}
          </p>
          <div className="mt-3 space-y-4">
            {templates.map((t) => (
              <form key={t.purpose} action={saveWaTemplate} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    {WA_PURPOSE_LABEL[t.purpose]}
                  </span>
                  {t.isCustom ? (
                    <span className="text-[10px] font-medium uppercase text-emerald-600">
                      Custom
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase text-slate-400">
                      Bawaan
                    </span>
                  )}
                </div>
                <input type="hidden" name="purpose" value={t.purpose} />
                <textarea
                  name="body"
                  rows={3}
                  defaultValue={t.body}
                  disabled={!canEdit}
                  className={`${areaClass} disabled:bg-slate-50 disabled:text-slate-500`}
                />
                {canEdit && (
                  <Button type="submit" variant="outline" size="sm">
                    Simpan
                  </Button>
                )}
              </form>
            ))}
            {!canEdit && (
              <p className="text-xs text-muted-foreground">
                Hanya Owner/Admin yang dapat mengubah template.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
