"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/lib/use-locale";
import { mockPatients } from "@/lib/mock-data";

export default function PatientsPage() {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockPatients;
    return mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrNumber.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q),
    );
  }, [query]);

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
          <p className="mt-1 text-sm text-muted">{t.patients.subtitle}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
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
        </button>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
        <span>{t.common.demoNotice}</span>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.patients.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">
                  {t.patients.columns.mrNumber}
                </th>
                <th className="px-5 py-3 font-semibold">
                  {t.patients.columns.name}
                </th>
                <th className="px-5 py-3 font-semibold">
                  {t.patients.columns.gender}
                </th>
                <th className="px-5 py-3 font-semibold">
                  {t.patients.columns.age}
                </th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">
                  {t.patients.columns.phone}
                </th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">
                  {t.patients.columns.lastVisit}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.mrNumber} className="transition-colors hover:bg-mint/40">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted">
                    {p.mrNumber}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-ink">{p.name}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                        (p.gender === "LAKI_LAKI"
                          ? "bg-sky-50 text-sky-700"
                          : "bg-pink-50 text-pink-700")
                      }
                    >
                      {p.gender === "LAKI_LAKI"
                        ? t.patients.male
                        : t.patients.female}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {p.age} {t.patients.years}
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3.5 text-muted sm:table-cell">
                    {p.phone}
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3.5 text-muted md:table-cell">
                    {dateFmt.format(new Date(p.lastVisit))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
