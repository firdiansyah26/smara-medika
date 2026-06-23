"use client";

import { Fragment, useActionState, useMemo, useState } from "react";
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
import {
  AttachmentSection,
  type AttachmentItem,
} from "@/components/attachments/attachment-section";
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

export function PharmacyTable({
  rows,
  attachmentsByDrug,
  canManage,
}: {
  rows: DrugRow[];
  attachmentsByDrug: Record<string, AttachmentItem[]>;
  canManage: boolean;
}) {
  const { t, locale } = useLocale();
  const [state, formAction, pending] = useActionState(addDrug, undefined);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
        <p className="mt-1 text-sm text-muted-foreground">{t.pharmacy.subtitle}</p>
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
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t.pharmacy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const photos = attachmentsByDrug[r.drugId] ?? [];
                const isOpen = expanded.has(r.drugId);
                return (
                  <Fragment key={r.drugId}>
                    <TableRow>
                      <TableCell>
                        <div className="font-medium text-ink">{r.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.genericName ? `${r.genericName} · ` : ""}
                          {r.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.category ?? "—"}</TableCell>
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
                      <TableCell className="text-muted-foreground">
                        {r.price != null ? priceFmt.format(r.price) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggle(r.drugId)}
                            title={t.attachments.title}
                            className={
                              "inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors " +
                              (isOpen
                                ? "border-brand bg-mint text-brand-deep"
                                : "border-slate-200 text-muted-foreground hover:text-ink")
                            }
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            {photos.length > 0 && photos.length}
                          </button>
                          <form action={updateStock} className="flex items-center gap-1.5">
                            <input type="hidden" name="drugId" value={r.drugId} />
                            <Input name="quantity" type="number" min="0" defaultValue={r.quantity} className="h-8 w-20" />
                            <Input name="price" type="number" min="0" step="any" defaultValue={r.price ?? ""} placeholder={t.pharmacy.price} className="h-8 w-24" />
                            <Button type="submit" variant="outline" size="sm">
                              {t.pharmacy.save}
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-slate-50/60">
                          <div className="max-w-md">
                            <AttachmentSection
                              entityType="DRUG"
                              entityId={r.drugId}
                              items={photos}
                              revalidate="/dashboard/farmasi"
                              canManage={canManage}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
