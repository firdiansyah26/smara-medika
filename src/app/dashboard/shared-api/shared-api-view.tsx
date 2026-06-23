"use client";

import { useActionState } from "react";
import type { ApiKeyMode, ApiKeyStatus } from "@prisma/client";
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
import { createApiKey, revokeApiKey } from "./actions";

export type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  mode: ApiKeyMode;
  scopes: string[];
  status: ApiKeyStatus;
  lastUsedAt: string | null;
};
export type RequestRow = {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
};

// Daftar scope & endpoint (statis, agar tidak mengimpor lib server ke klien).
const SCOPES = [
  "patients:read",
  "patients:write",
  "encounters:read",
  "drug-orders:read",
  "stock:read",
];
const ENDPOINTS = [
  { method: "GET", path: "/api/v1/me", scope: "—" },
  { method: "GET", path: "/api/v1/patients", scope: "patients:read" },
  { method: "GET", path: "/api/v1/patients/{id}", scope: "patients:read" },
  { method: "GET", path: "/api/v1/encounters", scope: "encounters:read" },
];

export function SharedApiView({
  canManage,
  keys,
  requests,
  totalRequests,
}: {
  canManage: boolean;
  keys: KeyRow[];
  requests: RequestRow[];
  totalRequests: number;
}) {
  const { t, locale } = useLocale();
  const [state, action, pending] = useActionState(createApiKey, undefined);

  const dtFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.sharedApi.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.sharedApi.subtitle}
        </p>
      </div>

      {/* Token sekali tampil */}
      {state?.token && (
        <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">
            {t.sharedApi.tokenOnceTitle}
          </p>
          <code className="mt-2 block overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-sm text-ink">
            {state.token}
          </code>
          <p className="mt-2 text-xs text-amber-700">
            {t.sharedApi.tokenOnceHint}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* Daftar key + tabel */}
        <div className="space-y-4 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.sharedApi.keysTitle}{" "}
                <span className="font-normal text-muted-foreground">
                  ({keys.length})
                </span>
              </h2>
            </div>
            {keys.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t.sharedApi.noKeys}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.sharedApi.colName}</TableHead>
                    <TableHead>{t.sharedApi.colPrefix}</TableHead>
                    <TableHead>{t.sharedApi.colScopes}</TableHead>
                    <TableHead>{t.sharedApi.colStatus}</TableHead>
                    <TableHead>{t.sharedApi.colLastUsed}</TableHead>
                    {canManage && (
                      <TableHead className="text-right">
                        {t.sharedApi.colAction}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium text-ink">
                        {k.name}
                        <span className="ml-1.5 rounded bg-slate-100 px-1.5 text-xs font-normal text-slate-500">
                          {k.mode === "TEST"
                            ? t.sharedApi.modeTest
                            : t.sharedApi.modeLive}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {k.prefix}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {k.scopes.join(", ")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                            (k.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600")
                          }
                        >
                          {k.status === "ACTIVE"
                            ? t.sharedApi.active
                            : t.sharedApi.revoked}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {k.lastUsedAt
                          ? dtFmt.format(new Date(k.lastUsedAt))
                          : t.sharedApi.never}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          {k.status === "ACTIVE" && (
                            <form
                              action={revokeApiKey}
                              onSubmit={(e) => {
                                if (!window.confirm(t.sharedApi.revokeConfirm))
                                  e.preventDefault();
                              }}
                            >
                              <input type="hidden" name="id" value={k.id} />
                              <Button type="submit" variant="destructive" size="xs">
                                {t.sharedApi.revoke}
                              </Button>
                            </form>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pemakaian */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.sharedApi.usageTitle}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t.sharedApi.totalRequests}:{" "}
                <b className="text-ink">{totalRequests}</b>
              </span>
            </div>
            {requests.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t.sharedApi.noRequests}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.sharedApi.colMethod}</TableHead>
                    <TableHead>{t.sharedApi.colPath}</TableHead>
                    <TableHead>{t.sharedApi.colCode}</TableHead>
                    <TableHead>{t.sharedApi.colTime}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.method}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-ink">
                        {r.path}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            "font-mono text-xs font-semibold " +
                            (r.statusCode < 400
                              ? "text-emerald-600"
                              : "text-red-600")
                          }
                        >
                          {r.statusCode}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {dtFmt.format(new Date(r.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Kolom kanan: buat key + endpoint */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.sharedApi.newKeyTitle}
              </h2>
            </div>
            {canManage ? (
              <form action={action} className="space-y-3 p-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.sharedApi.fName}
                  </label>
                  <Input name="name" required className="h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.sharedApi.fMode}
                  </label>
                  <select
                    name="mode"
                    defaultValue="LIVE"
                    className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="LIVE">{t.sharedApi.modeLive}</option>
                    <option value="TEST">{t.sharedApi.modeTest}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.sharedApi.fScopes}
                  </label>
                  {SCOPES.map((s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        name="scopes"
                        value={s}
                        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
                      />
                      <code className="text-xs">{s}</code>
                    </label>
                  ))}
                </div>
                {state?.error && (
                  <p className="text-xs font-medium text-red-600">
                    {state.error === "required"
                      ? t.sharedApi.errRequired
                      : t.settings.errors.notAllowed}
                  </p>
                )}
                <Button type="submit" disabled={pending} className="w-full">
                  {t.sharedApi.createBtn}
                </Button>
              </form>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                {t.sharedApi.readOnly}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.sharedApi.endpointsTitle}
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {ENDPOINTS.map((e) => (
                  <li key={e.path} className="text-xs">
                    <span className="mr-1.5 rounded bg-brand/10 px-1.5 py-0.5 font-mono font-semibold text-brand">
                      {e.method}
                    </span>
                    <code className="text-ink">{e.path}</code>
                    <span className="ml-1.5 text-muted-foreground">
                      ({e.scope})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-muted-foreground">
                {t.sharedApi.endpointsHint}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
