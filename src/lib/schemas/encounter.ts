import { z } from "zod";

const toNum = (v: unknown) =>
  typeof v === "string" && v.trim() !== "" ? Number(v) : undefined;

const intOpt = z.preprocess(toNum, z.number().int().optional());
const floatOpt = z.preprocess(toNum, z.number().optional());
const strOpt = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

export const encounterSaveSchema = z.object({
  status: z.enum(["MENUNGGU", "DIPERIKSA", "SELESAI"]),
  subjective: strOpt,
  objective: strOpt,
  assessment: strOpt,
  plan: strOpt,
  systolic: intOpt,
  diastolic: intOpt,
  temperature: floatOpt,
  heartRate: intOpt,
  respiratoryRate: intOpt,
  spo2: intOpt,
  weight: floatOpt,
  height: floatOpt,
});

export const diagnosisSchema = z.object({
  icdCode: z.string().trim().min(1),
  icdName: z.string().trim().min(1),
  type: z.enum(["PRIMER", "SEKUNDER"]),
});
