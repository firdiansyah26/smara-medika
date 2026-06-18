import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const drugFormSchema = z.object({
  name: z.string().trim().min(1, "Nama obat wajib diisi"),
  genericName: optionalString,
  unit: z.string().trim().min(1, "Satuan wajib diisi"),
  category: optionalString,
  quantity: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().min(0).optional(),
});

export const stockFormSchema = z.object({
  drugId: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
  price: z.coerce.number().min(0).optional(),
});
