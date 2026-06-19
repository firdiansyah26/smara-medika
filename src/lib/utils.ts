import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka rupiah, mis. 150000 → "Rp 150.000". */
export function formatIDR(value: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
}

/** Hitung umur (tahun) dari tanggal lahir. */
export function calcAge(birthDate: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Hitung umur rinci: tahun, bulan, hari. */
export function calcAgeParts(
  birthDate: Date,
  now: Date = new Date(),
): { years: number; months: number; days: number } {
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}
