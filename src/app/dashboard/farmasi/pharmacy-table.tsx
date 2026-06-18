"use client";

import { useActionState, useMemo, useState } from "react";
import { useLocale } from "@/lib/use-locale";
import { addDrug, updateStock } from "./actions";

export type DrugRow = {
  drugId: string;
  name: string;
  genericName: string | null;
  unit: string;
  category: string | null;
  quantity: number;
  price: number | null;
  minStock: number | null;
};

const input =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function PharmacyTable({ rows }: { rows: DrugRow[] }) {
  const { t, locale } = useLocale();
  const [state, formAction, pending] = useActionState(addDrug, undefined);
  const [query, setQuery] = useState("");

  const priceFmt = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.genericName ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q),
    );
  }, [query, rows]);

  function isLow(r: DrugRow) {
    return r.minStock != null && r.quantity <= r.minStock;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.pharmacy.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.pharmacy.subtitle}</p>
      </div>

      {/* Tambah obat */}
      <form
        action={formAction}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t.pharmacy.addTitle}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input name="name" required placeholder={t.pharmacy.name} className={`${input} lg:col-span-2`} />
          <input name="genericName" placeholder={t.pharmacy.generic} className={input} />
          <input name="unit" required placeholder={t.pharmacy.unit} className={input} />
          <input name="category" placeholder={t.pharmacy.category} className={input} />
          <div className="flex gap-2">
            <input name="quantity" type="number" min="0" defaultValue={0} placeholder={t.pharmacy.quantity} className={input} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input name="price" type="number" min="0" step="any" placeholder={t.pharmacy.price} className={`${input} max-w-[12rem]`} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            {t.pharmacy.add}
          </button>
          {state?.error && (
            <span className="text-sm font-medium text-red-600">{state.error}</span>
          )}
        </div>
      </form>

      {/* Cari */}
      <div className="mt-6 max-w-md">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.pharmacy.search}
          className={input}
        />
      </div>

      {/* Tabel stok */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2 font-semibold">{t.pharmacy.name}</th>
                <th className="px-4 py-2 font-semibold">{t.pharmacy.category}</th>
                <th className="px-4 py-2 font-semibold">{t.pharmacy.colStock}</th>
                <th className="px-4 py-2 font-semibold">{t.pharmacy.price}</th>
                <th className="px-4 py-2 font-semibold">{t.pharmacy.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    {t.pharmacy.empty}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.drugId} className="align-middle">
                    <td className="px-4 py-2">
                      <div className="font-medium text-ink">{r.name}</div>
                      <div className="text-xs text-muted">
                        {r.genericName ? `${r.genericName} · ` : ""}
                        {r.unit}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted">{r.category ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span className={isLow(r) ? "font-semibold text-red-600" : "text-ink"}>
                        {r.quantity}
                      </span>
                      {isLow(r) && (
                        <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                          {t.pharmacy.lowStock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {r.price != null ? priceFmt.format(r.price) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <form action={updateStock} className="flex items-center gap-1.5">
                        <input type="hidden" name="drugId" value={r.drugId} />
                        <input
                          name="quantity"
                          type="number"
                          min="0"
                          defaultValue={r.quantity}
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        <input
                          name="price"
                          type="number"
                          min="0"
                          step="any"
                          defaultValue={r.price ?? ""}
                          placeholder={t.pharmacy.price}
                          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="submit"
                          className="rounded-md border border-brand/30 px-2.5 py-1 text-xs font-semibold text-brand-deep transition-colors hover:bg-mint"
                        >
                          {t.pharmacy.save}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
