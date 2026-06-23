"use client";

import Link from "next/link";
import type { LabCategory, LabFlag, LabOrderStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_BADGE } from "../penunjang-table";
import {
  addLabItem,
  removeLabItem,
  saveLabResult,
  updateLabStatus,
} from "../actions";

type Item = {
  id: string;
  testName: string;
  result: string | null;
  unit: string | null;
  referenceRange: string | null;
  flag: LabFlag | null;
};
export type LabOrderDetailData = {
  id: string;
  orderNumber: string;
  category: LabCategory;
  status: LabOrderStatus;
  patient: string;
  mrNumber: string;
  clinicalNote: string | null;
  completedAt: string | null;
  createdAt: string;
  items: Item[];
};

const FLAGS: LabFlag[] = ["NORMAL", "LOW", "HIGH", "ABNORMAL"];
const FLAG_COLOR: Record<LabFlag, string> = {
  NORMAL: "text-emerald-600",
  LOW: "text-amber-600",
  HIGH: "text-amber-600",
  ABNORMAL: "text-red-600",
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function LabOrderDetail({
  data,
  canManage,
}: {
  data: LabOrderDetailData;
  canManage: boolean;
}) {
  const { t, locale } = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const open = data.status === "REQUESTED" || data.status === "IN_PROGRESS";
  const editable = open && canManage;
  const hasItems = data.items.length > 0;
  const catLabel =
    data.category === "RADIOLOGI" ? t.diagnostics.catRad : t.diagnostics.catLab;

  return (
    <div>
      <Link
        href="/dashboard/penunjang"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t.diagnostics.back}
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold text-ink">
              {data.orderNumber}
            </h1>
            <span className="rounded bg-mint px-2 py-0.5 text-xs font-semibold text-brand-deep">
              {catLabel}
            </span>
            <span
              className={
                "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                STATUS_BADGE[data.status]
              }
            >
              {t.diagnostics.statuses[data.status]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-medium text-ink">{data.patient}</span>
            <span className="ml-2 font-mono text-xs">{data.mrNumber}</span>
            <span className="mx-2 text-slate-300">•</span>
            {dateFmt.format(new Date(data.createdAt))}
          </p>
          {data.clinicalNote && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t.diagnostics.clinicalNote}: {data.clinicalNote}
            </p>
          )}
          {data.status === "COMPLETED" && data.completedAt && (
            <p className="mt-0.5 text-xs font-medium text-emerald-600">
              {t.diagnostics.completedAt}:{" "}
              {dateFmt.format(new Date(data.completedAt))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/penunjang/${data.id}/cetak`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t.diagnostics.print}
          </Link>
          {editable && (
            <>
              <form action={updateLabStatus}>
                <input type="hidden" name="labOrderId" value={data.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <Button type="submit" size="sm" disabled={!hasItems}>
                  {t.diagnostics.complete}
                </Button>
              </form>
              <form
                action={updateLabStatus}
                onSubmit={(e) => {
                  if (!window.confirm(t.diagnostics.cancelConfirm))
                    e.preventDefault();
                }}
              >
                <input type="hidden" name="labOrderId" value={data.id} />
                <input type="hidden" name="status" value="CANCELLED" />
                <Button type="submit" variant="destructive" size="sm">
                  {t.diagnostics.cancel}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <h2 className="text-sm font-semibold text-ink">
            {t.diagnostics.itemsTitle}
          </h2>
        </div>
        {data.items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t.diagnostics.noItems}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.diagnostics.testName}</TableHead>
                <TableHead>{t.diagnostics.result}</TableHead>
                <TableHead>{t.diagnostics.unit}</TableHead>
                <TableHead>{t.diagnostics.refRange}</TableHead>
                <TableHead>{t.diagnostics.flag}</TableHead>
                {editable && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium text-ink">
                    {it.testName}
                  </TableCell>
                  {editable ? (
                    <TableCell colSpan={3}>
                      <form
                        action={saveLabResult}
                        className="flex items-center gap-1.5"
                      >
                        <input type="hidden" name="itemId" value={it.id} />
                        <Input
                          name="result"
                          defaultValue={it.result ?? ""}
                          placeholder={t.diagnostics.result}
                          className="h-8 w-28"
                        />
                        <span className="text-xs text-muted-foreground">
                          {it.unit || "—"} · {it.referenceRange || "—"}
                        </span>
                        <select
                          name="flag"
                          defaultValue={it.flag ?? ""}
                          className={inputClass + " h-8 max-w-[8rem]"}
                        >
                          <option value="">{t.diagnostics.selectFlag}</option>
                          {FLAGS.map((f) => (
                            <option key={f} value={f}>
                              {t.diagnostics.flags[f]}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="xs" variant="outline">
                          {t.diagnostics.save}
                        </Button>
                      </form>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="text-ink">
                        {it.result || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {it.unit || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {it.referenceRange || "—"}
                      </TableCell>
                    </>
                  )}
                  {!editable && (
                    <TableCell>
                      {it.flag && (
                        <span
                          className={
                            "text-xs font-semibold " + FLAG_COLOR[it.flag]
                          }
                        >
                          {t.diagnostics.flags[it.flag]}
                        </span>
                      )}
                    </TableCell>
                  )}
                  {editable && (
                    <TableCell className="text-right">
                      <form action={removeLabItem}>
                        <input type="hidden" name="itemId" value={it.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          {t.diagnostics.remove}
                        </button>
                      </form>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {editable && (
          <form
            action={addLabItem}
            className="flex flex-wrap items-end gap-2 border-t border-slate-200 bg-slate-50/60 p-3"
          >
            <input type="hidden" name="labOrderId" value={data.id} />
            <div className="min-w-[12rem] flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.diagnostics.testName}
              </label>
              <Input name="testName" required className="h-9" />
            </div>
            <div className="w-24 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.diagnostics.unit}
              </label>
              <Input name="unit" className="h-9" />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t.diagnostics.refRange}
              </label>
              <Input name="referenceRange" className="h-9" />
            </div>
            <Button type="submit" size="sm">
              {t.diagnostics.addTest}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
