"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/use-locale";
import { createPatient, updatePatient } from "./actions";

export type PatientFormValues = {
  id?: string;
  name: string;
  nik: string;
  birthDate: string; // yyyy-mm-dd
  gender: "" | "LAKI_LAKI" | "PEREMPUAN";
  bloodType: "" | "A" | "B" | "AB" | "O";
  phone: string;
  address: string;
  city: string;
  bpjsNumber: string;
  emergencyContact: string;
};

const empty: PatientFormValues = {
  name: "",
  nik: "",
  birthDate: "",
  gender: "",
  bloodType: "",
  phone: "",
  address: "",
  city: "",
  bpjsNumber: "",
  emergencyContact: "",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function PatientForm({
  mode,
  patient,
}: {
  mode: "create" | "edit";
  patient?: PatientFormValues;
}) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createPatient : updatePatient,
    undefined,
  );
  const v = patient ?? empty;
  const cancelHref =
    mode === "edit" && patient?.id
      ? `/dashboard/pasien/${patient.id}`
      : "/dashboard/pasien";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {mode === "create" ? t.patients.form.newTitle : t.patients.form.editTitle}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {mode === "edit" && <input type="hidden" name="id" defaultValue={v.id} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.name}
            </label>
            <input name="name" required defaultValue={v.name} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.birthDate}
            </label>
            <input
              name="birthDate"
              type="date"
              required
              defaultValue={v.birthDate}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.gender}
            </label>
            <select name="gender" required defaultValue={v.gender} className={inputClass}>
              <option value="" disabled>
                {t.patients.form.selectGender}
              </option>
              <option value="LAKI_LAKI">{t.patients.male}</option>
              <option value="PEREMPUAN">{t.patients.female}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.nik}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <input name="nik" defaultValue={v.nik} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.bloodType}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <select name="bloodType" defaultValue={v.bloodType} className={inputClass}>
              <option value="">{t.patients.form.selectBlood}</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.phone}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <input name="phone" defaultValue={v.phone} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.city}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <input name="city" defaultValue={v.city} className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.address}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <input name="address" defaultValue={v.address} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.bpjs}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <input name="bpjsNumber" defaultValue={v.bpjsNumber} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              {t.patients.form.emergencyContact}{" "}
              <span className="text-xs font-normal text-muted">
                ({t.patients.form.optional})
              </span>
            </label>
            <input
              name="emergencyContact"
              defaultValue={v.emergencyContact}
              className={inputClass}
            />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            {pending ? t.patients.form.saving : t.patients.form.save}
          </button>
          <Link
            href={cancelHref}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
          >
            {t.patients.form.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
