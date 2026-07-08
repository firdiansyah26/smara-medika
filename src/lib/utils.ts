import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka rupiah, mis. 150000 → "Rp 150.000". */
export function formatIDR(value: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
}

const SATUAN = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

// Rekursif: kembalikan "" untuk 0 (remainder), agar tak menempel "nol".
function say(n: number): string {
  if (n === 0) return "";
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${say(n - 10)} belas`;
  if (n < 100) return `${say(Math.floor(n / 10))} puluh ${say(n % 10)}`.trim();
  if (n < 200) return `seratus ${say(n - 100)}`.trim();
  if (n < 1000) return `${say(Math.floor(n / 100))} ratus ${say(n % 100)}`.trim();
  if (n < 2000) return `seribu ${say(n - 1000)}`.trim();
  if (n < 1_000_000)
    return `${say(Math.floor(n / 1000))} ribu ${say(n % 1000)}`.trim();
  if (n < 1_000_000_000)
    return `${say(Math.floor(n / 1_000_000))} juta ${say(n % 1_000_000)}`.trim();
  return `${say(Math.floor(n / 1_000_000_000))} miliar ${say(n % 1_000_000_000)}`.trim();
}

/** Ejaan angka Indonesia (terbilang). 185000 → "seratus delapan puluh lima ribu". */
export function terbilang(n: number): string {
  n = Math.floor(Math.abs(n));
  return n === 0 ? "nol" : say(n);
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
