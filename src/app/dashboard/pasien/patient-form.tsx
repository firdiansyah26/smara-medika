"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/use-locale";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Native select bergaya shadcn (agar submit lewat formData tetap mudah).
const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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

  const optional = (
    <span className="text-xs font-normal text-muted-foreground">
      ({t.patients.form.optional})
    </span>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {mode === "create" ? t.patients.form.newTitle : t.patients.form.editTitle}
      </h1>

      <form action={formAction} className="mt-5 space-y-4">
        {mode === "edit" && <input type="hidden" name="id" defaultValue={v.id} />}

        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">{t.patients.form.name}</Label>
            <Input id="name" name="name" required defaultValue={v.name} className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birthDate">{t.patients.form.birthDate}</Label>
            <Input id="birthDate" name="birthDate" type="date" required defaultValue={v.birthDate} className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender">{t.patients.form.gender}</Label>
            <select id="gender" name="gender" required defaultValue={v.gender} className={selectClass}>
              <option value="" disabled>
                {t.patients.form.selectGender}
              </option>
              <option value="LAKI_LAKI">{t.patients.male}</option>
              <option value="PEREMPUAN">{t.patients.female}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nik">{t.patients.form.nik} {optional}</Label>
            <Input id="nik" name="nik" defaultValue={v.nik} className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bloodType">{t.patients.form.bloodType} {optional}</Label>
            <select id="bloodType" name="bloodType" defaultValue={v.bloodType} className={selectClass}>
              <option value="">{t.patients.form.selectBlood}</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">{t.patients.form.phone} {optional}</Label>
            <Input id="phone" name="phone" defaultValue={v.phone} className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">{t.patients.form.city} {optional}</Label>
            <Input id="city" name="city" defaultValue={v.city} className="h-9" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">{t.patients.form.address} {optional}</Label>
            <Input id="address" name="address" defaultValue={v.address} className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bpjsNumber">{t.patients.form.bpjs} {optional}</Label>
            <Input id="bpjsNumber" name="bpjsNumber" defaultValue={v.bpjsNumber} className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emergencyContact">{t.patients.form.emergencyContact} {optional}</Label>
            <Input id="emergencyContact" name="emergencyContact" defaultValue={v.emergencyContact} className="h-9" />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="lg" disabled={pending} className="h-9">
            {pending ? t.patients.form.saving : t.patients.form.save}
          </Button>
          <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "lg", className: "h-9" })}>
            {t.patients.form.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
