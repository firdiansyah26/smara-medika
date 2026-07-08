"use client";

import { useRouter } from "next/navigation";
import type { AuditAction } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { Pagination } from "@/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AuditRow = {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  user: string;
  createdAt: string;
};

const ACTIONS: (AuditAction | "all")[] = [
  "all",
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "LOGIN",
];
const BADGE: Record<AuditAction, string> = {
  CREATE: "bg-emerald-50 text-emerald-700",
  UPDATE: "bg-sky-50 text-sky-700",
  DELETE: "bg-red-50 text-red-600",
  READ: "bg-slate-100 text-slate-600",
  LOGIN: "bg-mint text-brand-deep",
};

export function AuditView({
  rows,
  entities,
  action,
  entity,
  page,
  pageCount,
}: {
  rows: AuditRow[];
  entities: string[];
  action: string;
  entity: string;
  page: number;
  pageCount: number;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const dtFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const go = (next: { action?: string; entity?: string }) =>
    router.push(
      `/dashboard/audit?action=${next.action ?? action}&entity=${next.entity ?? entity}`,
    );

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.audit.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.audit.subtitle}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
          {ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => go({ action: a })}
              className={
                "rounded-md px-2.5 py-1 transition-colors " +
                (action === a
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:text-ink")
              }
            >
              {a === "all" ? t.audit.all : t.audit.actions[a as AuditAction]}
            </button>
          ))}
        </div>
        <select
          value={entity}
          onChange={(e) => go({ entity: e.target.value })}
          className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="all">{t.audit.allEntities}</option>
          {entities.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.audit.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.audit.colTime}</TableHead>
                <TableHead>{t.audit.colUser}</TableHead>
                <TableHead>{t.audit.colAction}</TableHead>
                <TableHead>{t.audit.colEntity}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {dtFmt.format(new Date(r.createdAt))}
                  </TableCell>
                  <TableCell className="text-ink">{r.user}</TableCell>
                  <TableCell>
                    <span
                      className={
                        "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                        BADGE[r.action]
                      }
                    >
                      {t.audit.actions[r.action]}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.entity}
                    {r.entityId && (
                      <span className="ml-1.5 font-mono text-xs text-slate-400">
                        {r.entityId.slice(0, 8)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        hrefFor={(p) =>
          `/dashboard/audit?action=${action}&entity=${encodeURIComponent(entity)}&page=${p}`
        }
      />
    </div>
  );
}
