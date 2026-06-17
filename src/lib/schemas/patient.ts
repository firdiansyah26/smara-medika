import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const patientFormSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  nik: optionalString,
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  bloodType: z
    .enum(["A", "B", "AB", "O"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: optionalString,
  address: optionalString,
  city: optionalString,
  bpjsNumber: optionalString,
  emergencyContact: optionalString,
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const allergyFormSchema = z.object({
  allergen: z.string().trim().min(1, "Alergen wajib diisi"),
  reaction: optionalString,
  severity: z
    .enum(["RINGAN", "SEDANG", "BERAT"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
