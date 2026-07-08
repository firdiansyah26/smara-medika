import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";

// Integration test — dilewati bila DATABASE_URL menunjuk Supabase (anti tulis prod).
const url = process.env.DATABASE_URL ?? "";
const skip = url === "" || url.includes("supabase") || url.includes("pooler");
const suite = skip ? describe.skip : describe;

let tA = "";
let tB = "";
let patA = "";
let patB = "";
let userId = "";

beforeAll(async () => {
  if (skip) return;
  const stamp = Date.now();
  const a = await db.tenant.create({
    data: { name: "TenantA", type: "KLINIK", code: `A-${stamp}` },
  });
  const b = await db.tenant.create({
    data: { name: "TenantB", type: "KLINIK", code: `B-${stamp}` },
  });
  tA = a.id;
  tB = b.id;
  const u = await db.user.create({
    data: { email: `iso-${stamp}@test.local`, password: "x", name: "Iso" },
  });
  userId = u.id;
  const mk = (tenantId: string, mr: string) =>
    db.patient.create({
      data: {
        tenantId,
        mrNumber: mr,
        name: "P",
        birthDate: new Date("2000-01-01"),
        gender: "LAKI_LAKI",
      },
    });
  patA = (await mk(tA, "RM-A-1")).id;
  patB = (await mk(tB, "RM-B-1")).id;
});

afterAll(async () => {
  if (tA) await db.tenant.delete({ where: { id: tA } });
  if (tB) await db.tenant.delete({ where: { id: tB } });
  if (userId) await db.user.delete({ where: { id: userId } });
  await db.$disconnect();
});

suite("isolasi tenant (integration)", () => {
  it("findMany terfilter tenantId hanya kembalikan milik sendiri", async () => {
    const rowsA = await db.patient.findMany({ where: { tenantId: tA } });
    expect(rowsA.map((p) => p.id)).toEqual([patA]);
    expect(rowsA.some((p) => p.id === patB)).toBe(false);
  });

  it("findFirst pasien tenant lain dengan tenantId sendiri → null", async () => {
    const leak = await db.patient.findFirst({
      where: { id: patB, tenantId: tA },
    });
    expect(leak).toBeNull();
  });

  it("count terisolasi per tenant", async () => {
    expect(await db.patient.count({ where: { tenantId: tA } })).toBe(1);
    expect(await db.patient.count({ where: { tenantId: tB } })).toBe(1);
  });

  it("total invoice = Σ item − diskon (≥ 0)", async () => {
    const inv = await db.invoice.create({
      data: {
        tenantId: tA,
        patientId: patA,
        invoiceNumber: "INV-ISO-1",
        discount: 20000,
        createdById: userId,
        items: {
          create: [
            { category: "CONSULTATION", description: "K", quantity: 1, unitPrice: 150000, amount: 150000 },
            { category: "DRUG", description: "O", quantity: 10, unitPrice: 3500, amount: 35000 },
          ],
        },
      },
      include: { items: true },
    });
    const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
    const total = Math.max(0, subtotal - inv.discount);
    expect(subtotal).toBe(185000);
    expect(total).toBe(165000);
  });
});
