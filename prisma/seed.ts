import { PrismaClient, Gender, Role, TenantType } from "@prisma/client";

const db = new PrismaClient();

// Catatan: password placeholder — diganti hash asli (argon2/bcrypt) saat Auth.js disiapkan.
const PLACEHOLDER_PASSWORD = "SET_REAL_HASH_ON_AUTH_SETUP";

async function main() {
  console.log("🌱 Seeding SmaraMedika…");

  // --- Tenants ---
  const tenantSeed = [
    { code: "RSSS", name: "RS Sehat Sentosa", type: TenantType.RUMAH_SAKIT, city: "Jakarta" },
    { code: "KBC", name: "Klinik Bunda Ceria", type: TenantType.KLINIK, city: "Bandung" },
    { code: "AWJ", name: "Apotek Waras Jaya", type: TenantType.APOTEK, city: "Surabaya" },
  ];
  const tenants: Record<string, { id: string }> = {};
  for (const t of tenantSeed) {
    tenants[t.code] = await db.tenant.upsert({
      where: { code: t.code },
      update: { name: t.name, type: t.type, city: t.city },
      create: t,
    });
  }

  // --- User + keanggotaan multi-tenant ---
  const user = await db.user.upsert({
    where: { email: "andi@sehatsentosa.id" },
    update: { name: "dr. Andi Wijaya" },
    create: {
      email: "andi@sehatsentosa.id",
      name: "dr. Andi Wijaya",
      password: PLACEHOLDER_PASSWORD,
    },
  });

  await db.membership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId: tenants.RSSS.id } },
    update: { role: Role.OWNER },
    create: { userId: user.id, tenantId: tenants.RSSS.id, role: Role.OWNER },
  });
  await db.membership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId: tenants.AWJ.id } },
    update: { role: Role.APOTEKER },
    create: { userId: user.id, tenantId: tenants.AWJ.id, role: Role.APOTEKER },
  });

  // --- Pasien (milik RS Sehat Sentosa) ---
  const today = new Date();
  const patientSeed = [
    { mrNumber: "RM-202606-00012", name: "Budi Santoso", gender: Gender.LAKI_LAKI, birthDate: new Date("1990-05-15"), phone: "0812-3456-7890", visit: today },
    { mrNumber: "RM-202606-00011", name: "Siti Aminah", gender: Gender.PEREMPUAN, birthDate: new Date("1997-02-10"), phone: "0813-2222-1111", visit: today },
    { mrNumber: "RM-202606-00010", name: "Rahmat Hidayat", gender: Gender.LAKI_LAKI, birthDate: new Date("1974-08-20"), phone: "0856-7777-8888", visit: new Date("2026-06-12") },
    { mrNumber: "RM-202605-00098", name: "Dewi Lestari", gender: Gender.PEREMPUAN, birthDate: new Date("1985-11-03"), phone: "0878-9090-1212", visit: new Date("2026-06-10") },
    { mrNumber: "RM-202605-00087", name: "Agus Pratama", gender: Gender.LAKI_LAKI, birthDate: new Date("2002-01-25"), phone: "0811-3434-5656", visit: new Date("2026-06-08") },
  ];

  for (const p of patientSeed) {
    const patient = await db.patient.upsert({
      where: { tenantId_mrNumber: { tenantId: tenants.RSSS.id, mrNumber: p.mrNumber } },
      update: { name: p.name, phone: p.phone },
      create: {
        tenantId: tenants.RSSS.id,
        mrNumber: p.mrNumber,
        name: p.name,
        gender: p.gender,
        birthDate: p.birthDate,
        phone: p.phone,
        city: "Jakarta",
      },
    });

    // Satu kunjungan per pasien (hanya jika belum ada — jaga idempotensi).
    const existing = await db.encounter.findFirst({ where: { patientId: patient.id } });
    if (!existing) {
      const isToday = p.visit.toDateString() === today.toDateString();
      await db.encounter.create({
        data: {
          tenantId: tenants.RSSS.id,
          patientId: patient.id,
          doctorId: user.id,
          visitDate: p.visit,
          status: isToday ? "DIPERIKSA" : "SELESAI",
          subjective: "Keluhan umum.",
          assessment: "Pemeriksaan rutin.",
        },
      });
    }
  }

  // --- Rekanan (RS Sehat Sentosa ↔ Apotek Waras Jaya) ---
  await db.tenantPartnership.upsert({
    where: {
      requesterTenantId_addresseeTenantId: {
        requesterTenantId: tenants.RSSS.id,
        addresseeTenantId: tenants.AWJ.id,
      },
    },
    update: { status: "ACTIVE" },
    create: {
      requesterTenantId: tenants.RSSS.id,
      addresseeTenantId: tenants.AWJ.id,
      status: "ACTIVE",
      requestedById: user.id,
    },
  });

  // --- Obat + stok di Apotek Waras Jaya ---
  const drug = await db.drug.upsert({
    where: { id: "seed-drug-paracetamol" },
    update: {},
    create: {
      id: "seed-drug-paracetamol",
      name: "Paracetamol 500mg",
      genericName: "Paracetamol",
      unit: "tablet",
      category: "Analgesik",
    },
  });
  await db.drugStock.upsert({
    where: { tenantId_drugId: { tenantId: tenants.AWJ.id, drugId: drug.id } },
    update: { quantity: 500 },
    create: { tenantId: tenants.AWJ.id, drugId: drug.id, quantity: 500, price: 500 },
  });

  // --- Order transfer obat tertunda (RSSS → AWJ) ---
  const orderNumber = "TRF-202606-00001";
  const existingOrder = await db.drugOrder.findUnique({ where: { orderNumber } });
  if (!existingOrder) {
    const order = await db.drugOrder.create({
      data: {
        orderNumber,
        requesterTenantId: tenants.RSSS.id,
        supplierTenantId: tenants.AWJ.id,
        status: "REQUESTED",
        requestedById: user.id,
        note: "Permintaan stok Paracetamol.",
        items: { create: [{ drugId: drug.id, quantity: 100, price: 500 }] },
        trackings: { create: [{ status: "REQUESTED", note: "Order dibuat." }] },
      },
    });
    console.log(`  • Order transfer ${order.orderNumber} dibuat`);
  }

  console.log("✅ Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
