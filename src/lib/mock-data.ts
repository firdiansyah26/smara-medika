// Data contoh (mock) untuk pratinjau UI sebelum database tersambung.
// Akan diganti query Prisma asli saat PostgreSQL & autentikasi disiapkan.

import type { TenantType } from "@prisma/client";

export type MockTenant = {
  id: string;
  name: string;
  type: TenantType;
};

export const mockTenants: MockTenant[] = [
  { id: "t1", name: "RS Sehat Sentosa", type: "RUMAH_SAKIT" },
  { id: "t2", name: "Klinik Bunda Ceria", type: "KLINIK" },
  { id: "t3", name: "Apotek Waras Jaya", type: "APOTEK" },
];

export const mockUser = {
  name: "dr. Andi Wijaya",
  email: "andi@sehatsentosa.id",
};

export type MockPatient = {
  mrNumber: string;
  name: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  age: number;
  phone: string;
  lastVisit: string; // ISO date
};

export const mockPatients: MockPatient[] = [
  { mrNumber: "RM-202606-00012", name: "Budi Santoso", gender: "LAKI_LAKI", age: 36, phone: "0812-3456-7890", lastVisit: "2026-06-14" },
  { mrNumber: "RM-202606-00011", name: "Siti Aminah", gender: "PEREMPUAN", age: 29, phone: "0813-2222-1111", lastVisit: "2026-06-13" },
  { mrNumber: "RM-202606-00010", name: "Rahmat Hidayat", gender: "LAKI_LAKI", age: 52, phone: "0856-7777-8888", lastVisit: "2026-06-12" },
  { mrNumber: "RM-202605-00098", name: "Dewi Lestari", gender: "PEREMPUAN", age: 41, phone: "0878-9090-1212", lastVisit: "2026-06-10" },
  { mrNumber: "RM-202605-00087", name: "Agus Pratama", gender: "LAKI_LAKI", age: 24, phone: "0811-3434-5656", lastVisit: "2026-06-08" },
];

export const mockStats = {
  patientsToday: 18,
  activeVisits: 5,
  pendingOrders: 3,
  partners: 7,
};
