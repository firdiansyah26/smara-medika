"use client";

import type { MedicalDocumentType } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSickNote, createReferral } from "../actions";

export type DocRow = {
  id: string;
  type: MedicalDocumentType;
  number: string;
  createdAt: string;
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function SuratSection({
  encounterId,
  documents,
}: {
  encounterId: string;
  documents: DocRow[];
}) {
  const { t, locale } = useLocale();
  const today = new Date().toISOString().slice(0, 10);
  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-ink">{t.surat.title}</h2>
      </div>

      <div className="p-4">
        {/* Daftar surat */}
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.surat.empty}</p>
        ) : (
          <ul className="space-y-1.5">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/70 px-3 py-1.5 text-sm"
              >
                <span>
                  <span className="font-medium text-ink">
                    {d.type === "SICK_NOTE"
                      ? t.surat.typeSick
                      : t.surat.typeReferral}
                  </span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {d.number}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {dateFmt.format(new Date(d.createdAt))}
                  </span>
                </span>
                <a
                  href={`/dashboard/dokumen/${d.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-deep hover:underline"
                >
                  PDF
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-2">
          {/* Surat sakit */}
          <form action={createSickNote} className="space-y-2">
            <input type="hidden" name="encounterId" value={encounterId} />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t.surat.sickNote}
            </p>
            <div className="flex gap-2">
              <Input name="restDays" type="number" min={1} defaultValue={3} placeholder={t.surat.restDays} className="h-8 w-24" />
              <Input name="startDate" type="date" defaultValue={today} className="h-8 flex-1" />
            </div>
            <Input name="diagnosis" placeholder={`${t.surat.diagnosis} ${t.surat.optional}`} className="h-8" />
            <Input name="note" placeholder={`${t.surat.note} ${t.surat.optional}`} className="h-8" />
            <Button type="submit" size="sm" variant="outline" className="w-full">
              {t.surat.create}
            </Button>
          </form>

          {/* Rujukan */}
          <form action={createReferral} className="space-y-2">
            <input type="hidden" name="encounterId" value={encounterId} />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {t.surat.referral}
            </p>
            <Input name="toFacility" required placeholder={t.surat.toFacility} className="h-8" />
            <Input name="toDoctor" placeholder={`${t.surat.toDoctor} ${t.surat.optional}`} className="h-8" />
            <Input name="diagnosis" placeholder={`${t.surat.diagnosis} ${t.surat.optional}`} className="h-8" />
            <textarea name="reason" rows={2} placeholder={t.surat.reason} className={inputClass} />
            <Button type="submit" size="sm" variant="outline" className="w-full">
              {t.surat.create}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
