import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { generateDocNumber } from "@/lib/doc-number";
import { generateLabOrderNumber } from "@/lib/lab-number";
import { generateMrNumber } from "@/lib/mr-number";
import { generateOrderNumber } from "@/lib/order-number";

// Integration test — butuh koneksi DATABASE_URL (Postgres) yang termigrasi.
// Dilewati bila menunjuk ke DB terkelola (Supabase) agar tak menulis ke produksi.
const url = process.env.DATABASE_URL ?? "";
const skip = url === "" || url.includes("supabase") || url.includes("pooler");

const NOW = new Date("2030-03-15");
let tenantId = "";
let userId = "";
let patientId = "";

const suite = skip ? describe.skip : describe;

beforeAll(async () => {
  if (skip) return;
  const stamp = Date.now();
  const t = await db.tenant.create({
    data: { name: "IntTest", type: "KLINIK", code: `INT-${stamp}` },
  });
  tenantId = t.id;
  const u = await db.user.create({
    data: { email: `int-${stamp}@test.local`, password: "x", name: "Int" },
  });
  userId = u.id;
  const p = await db.patient.create({
    data: {
      tenantId,
      mrNumber: "RM-TMP-0",
      name: "Pasien Uji",
      birthDate: new Date("2000-01-01"),
      gender: "LAKI_LAKI",
    },
  });
  patientId = p.id;
});

afterAll(async () => {
  if (tenantId) await db.tenant.delete({ where: { id: tenantId } });
  if (userId) await db.user.delete({ where: { id: userId } });
  await db.$disconnect();
});

suite("generator nomor (integration)", () => {
  it("nomor invoice berurutan per tenant", async () => {
    const n1 = await generateInvoiceNumber(db, tenantId, NOW);
    expect(n1).toBe("INV-203003-00001");
    await db.invoice.create({
      data: { tenantId, patientId, invoiceNumber: n1, createdById: userId },
    });
    const n2 = await generateInvoiceNumber(db, tenantId, NOW);
    expect(n2).toBe("INV-203003-00002");
  });

  it("nomor dokumen berurutan per tenant", async () => {
    const d1 = await generateDocNumber(db, tenantId, NOW);
    expect(d1).toBe("DOC-203003-00001");
    await db.medicalDocument.create({
      data: {
        tenantId,
        patientId,
        doctorId: userId,
        type: "SICK_NOTE",
        number: d1,
        data: {},
        createdById: userId,
      },
    });
    expect(await generateDocNumber(db, tenantId, NOW)).toBe("DOC-203003-00002");
  });

  it("nomor lab pakai prefix kategori", async () => {
    expect(await generateLabOrderNumber(db, tenantId, "LABORATORIUM", NOW)).toBe(
      "LAB-203003-00001",
    );
    expect(await generateLabOrderNumber(db, tenantId, "RADIOLOGI", NOW)).toBe(
      "RAD-203003-00001",
    );
  });

  it("nomor RM & order sesuai pola", async () => {
    expect(await generateMrNumber(db, tenantId, NOW)).toMatch(
      /^RM-203003-\d{5}$/,
    );
    expect(await generateOrderNumber(db, NOW)).toMatch(/^TRF-203003-\d{5}$/);
  });
});
