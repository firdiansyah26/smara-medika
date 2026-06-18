"use client";

import { useActionState, useMemo, useState } from "react";
import { useLocale } from "@/lib/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <Input name="name" required placeholder={t.pharmacy.name} className="h-9 lg:col-span-2" />
          <Input name="genericName" placeholder={t.pharmacy.generic} className="h-9" />
          <Input name="unit" required placeholder={t.pharmacy.unit} className="h-9" />
          <Input name="category" placeholder={t.pharmacy.category} className="h-9" />
          <Input name="quantity" type="number" min="0" defaultValue={0} placeholder={t.pharmacy.quantity} className="h-9" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Input name="price" type="number" min="0" step="any" placeholder={t.pharmacy.price} className="h-9 max-w-[12rem]" />
          <Button type="submit" size="lg" disabled={pending} className="h-9">
            {t.pharmacy.add}
          </Button>
          {state?.error && (
            <span className="text-sm font-medium text-red-600">{state.error}</span>
          )}
        </div>
      </form>

      {/* Cari */}
      <div className="mt-6 max-w-md">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.pharmacy.search}
          className="h-9"
        />
      </div>

      {/* Tabel stok */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.pharmacy.name}</TableHead>
              <TableHead>{t.pharmacy.category}</TableHead>
              <TableHead>{t.pharmacy.colStock}</TableHead>
              <TableHead>{t.pharmacy.price}</TableHead>
              <TableHead>{t.pharmacy.colAction}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted">
                  {t.pharmacy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.drugId}>
                  <TableCell>
                    <div className="font-medium text-ink">{r.name}</div>
                    <div className="text-xs text-muted">
                      {r.genericName ? `${r.genericName} · ` : ""}
                      {r.unit}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{r.category ?? "—"}</TableCell>
                  <TableCell>
                    <span className={isLow(r) ? "font-semibold text-red-600" : "text-ink"}>
                      {r.quantity}
                    </span>
                    {isLow(r) && (
                      <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        {t.pharmacy.lowStock}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted">
                    {r.price != null ? priceFmt.format(r.price) : "—"}
                  </TableCell>
                  <TableCell>
                    <form action={updateStock} className="flex items-center gap-1.5">
                      <input type="hidden" name="drugId" value={r.drugId} />
                      <Input name="quantity" type="number" min="0" defaultValue={r.quantity} className="h-8 w-20" />
                      <Input name="price" type="number" min="0" step="any" defaultValue={r.price ?? ""} placeholder={t.pharmacy.price} className="h-8 w-24" />
                      <Button type="submit" variant="outline" size="sm">
                        {t.pharmacy.save}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
