"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/use-locale";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type PatientRow = {
  id: string;
  mrNumber: string;
  name: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  age: number;
  phone: string | null;
  lastVisit: string | null; // ISO date
};

export function PatientsTable({ rows }: { rows: PatientRow[] }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrNumber.toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q),
    );
  }, [query, rows]);

  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t.patients.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.patients.subtitle}</p>
        </div>
        <Link
          href="/dashboard/pasien/baru"
          className={buttonVariants({ size: "lg", className: "h-9 gap-2" })}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t.patients.add}
        </Link>
      </div>

      {/* Search */}
      <div className="mt-6 max-w-md">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.patients.searchPlaceholder}
          className="h-9"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.patients.columns.mrNumber}</TableHead>
              <TableHead>{t.patients.columns.name}</TableHead>
              <TableHead>{t.patients.columns.gender}</TableHead>
              <TableHead>{t.patients.columns.age}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t.patients.columns.phone}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {t.patients.columns.lastVisit}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.mrNumber}
                onClick={() => router.push(`/dashboard/pasien/${p.id}`)}
                className="cursor-pointer"
              >
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {p.mrNumber}
                </TableCell>
                <TableCell className="font-medium text-ink">{p.name}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      p.gender === "LAKI_LAKI"
                        ? "bg-sky-50 text-sky-700"
                        : "bg-pink-50 text-pink-700"
                    }
                  >
                    {p.gender === "LAKI_LAKI" ? t.patients.male : t.patients.female}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.age} {t.patients.years}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                  {p.phone ?? "—"}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                  {p.lastVisit ? dateFmt.format(new Date(p.lastVisit)) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
