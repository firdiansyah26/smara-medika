"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Role } from "@prisma/client";
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
import { inviteMember, updateMemberRole, removeMember } from "./actions";

export type MemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

const ROLE_KEYS: Role[] = [
  "OWNER",
  "ADMIN",
  "DOKTER",
  "PERAWAT",
  "RESEPSIONIS",
  "APOTEKER",
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function SettingsView({
  tenantName,
  members,
  canManage,
  currentUserId,
  ownerCount,
}: {
  tenantName: string;
  members: MemberRow[];
  canManage: boolean;
  currentUserId: string;
  ownerCount: number;
}) {
  const { t } = useLocale();
  const [state, action, pending] = useActionState(inviteMember, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const isLastOwner = (m: MemberRow) =>
    m.role === "OWNER" && m.active && ownerCount <= 1;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.settings.subtitle} · <b className="text-ink">{tenantName}</b>
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* Daftar anggota */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.settings.membersTitle}{" "}
                <span className="font-normal text-muted-foreground">
                  ({members.length})
                </span>
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.settings.colName}</TableHead>
                  <TableHead>{t.settings.colRole}</TableHead>
                  <TableHead>{t.settings.colStatus}</TableHead>
                  {canManage && (
                    <TableHead className="text-right">
                      {t.settings.colAction}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const self = m.userId === currentUserId;
                  const lockRole = self || isLastOwner(m);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium text-ink">
                          {m.name}
                          {self && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              ({t.settings.you})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {m.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManage && !lockRole ? (
                          <form action={updateMemberRole}>
                            <input
                              type="hidden"
                              name="membershipId"
                              value={m.id}
                            />
                            <select
                              name="role"
                              defaultValue={m.role}
                              onChange={(e) =>
                                e.currentTarget.form?.requestSubmit()
                              }
                              className={inputClass + " max-w-[10rem]"}
                            >
                              {ROLE_KEYS.map((r) => (
                                <option key={r} value={r}>
                                  {t.settings.roles[r]}
                                </option>
                              ))}
                            </select>
                          </form>
                        ) : (
                          <span className="inline-flex rounded bg-mint px-2 py-0.5 text-xs font-semibold text-brand-deep">
                            {t.settings.roles[m.role]}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            "inline-flex rounded px-2 py-0.5 text-xs font-medium " +
                            (m.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500")
                          }
                        >
                          {m.active ? t.settings.active : t.settings.inactive}
                        </span>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          {!self && !isLastOwner(m) && (
                            <form
                              action={removeMember}
                              onSubmit={(e) => {
                                if (!window.confirm(t.settings.removeConfirm))
                                  e.preventDefault();
                              }}
                            >
                              <input
                                type="hidden"
                                name="membershipId"
                                value={m.id}
                              />
                              <Button
                                type="submit"
                                variant="destructive"
                                size="xs"
                              >
                                {t.settings.removeBtn}
                              </Button>
                            </form>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Undang anggota */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.settings.inviteTitle}
              </h2>
            </div>
            {canManage ? (
              <form ref={formRef} action={action} className="space-y-3 p-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.settings.fName}
                  </label>
                  <Input name="name" className="h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.settings.fEmail}
                  </label>
                  <Input name="email" type="email" required className="h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.settings.fRole}
                  </label>
                  <select name="role" defaultValue="PERAWAT" className={inputClass}>
                    {ROLE_KEYS.map((r) => (
                      <option key={r} value={r}>
                        {t.settings.roles[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t.settings.fPassword}
                  </label>
                  <Input
                    name="password"
                    type="password"
                    required
                    className="h-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.settings.inviteHint}
                </p>
                {state?.error && (
                  <p className="text-xs font-medium text-red-600">
                    {t.settings.errors[state.error]}
                  </p>
                )}
                {state?.ok && (
                  <p className="text-xs font-medium text-emerald-600">
                    {t.settings.invited}
                  </p>
                )}
                <Button type="submit" disabled={pending} className="w-full">
                  {t.settings.inviteBtn}
                </Button>
              </form>
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                {t.settings.readOnly}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
