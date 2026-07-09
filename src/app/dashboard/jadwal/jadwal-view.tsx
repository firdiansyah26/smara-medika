"use client";

import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { useLocale } from "@/lib/use-locale";
import { renderTemplate, waLink } from "@/lib/wa-templates";
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
  createAppointment,
  updateAppointmentStatus,
  startVisit,
  sendAppointmentReminder,
  addDoctorSchedule,
  removeDoctorSchedule,
} from "./actions";

export type ApptFilter = "today" | "upcoming" | "all";
export type Option = { id: string; label: string };
export type ScheduleRow = {
  id: string;
  doctorId: string;
  doctor: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
export type ApptRow = {
  id: string;
  scheduledAt: string;
  durationMin: number;
  patient: string;
  mrNumber: string;
  phone: string | null;
  doctor: string;
  reason: string | null;
  status: AppointmentStatus;
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-slate-100 text-slate-600",
  CONFIRMED: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
  NO_SHOW: "bg-amber-50 text-amber-700",
};

const FILTERS: ApptFilter[] = ["today", "upcoming", "all"];

const inputClass =
  "h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

export function JadwalView({
  filter,
  appointments,
  patients,
  doctors,
  schedules,
  canManage,
  facilityName,
  waReminderTemplate,
}: {
  filter: ApptFilter;
  appointments: ApptRow[];
  patients: Option[];
  doctors: Option[];
  schedules: ScheduleRow[];
  canManage: boolean;
  facilityName: string;
  waReminderTemplate: string;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();

  const dtFmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const filterLabel: Record<ApptFilter, string> = {
    today: t.appointments.filterToday,
    upcoming: t.appointments.filterUpcoming,
    all: t.appointments.filterAll,
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t.appointments.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.appointments.subtitle}
        </p>
      </div>

      {/* Form buat janji */}
      {canManage && (
        <form
          action={createAppointment}
          className="mt-5 flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t.appointments.colPatient}
            </label>
            <select name="patientId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                {t.appointments.selectPatient}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t.appointments.colDoctor}
            </label>
            <select name="doctorId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                {t.appointments.selectDoctor}
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t.appointments.dateTime}
            </label>
            <Input
              name="scheduledAt"
              type="datetime-local"
              required
              className="h-9"
            />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t.appointments.duration}
            </label>
            <Input
              name="durationMin"
              type="number"
              min={5}
              step={5}
              defaultValue={30}
              className="h-9"
            />
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t.appointments.reason}
            </label>
            <Input name="reason" className="h-9" />
          </div>
          <Button type="submit" size="sm">
            {t.appointments.book}
          </Button>
        </form>
      )}

      {/* Filter */}
      <div className="mt-5 inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-sm font-semibold">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => router.push(`/dashboard/jadwal?filter=${f}`)}
            className={
              "rounded-md px-3 py-1.5 transition-colors " +
              (filter === f
                ? "bg-brand text-white"
                : "text-muted-foreground hover:text-ink")
            }
          >
            {filterLabel[f]}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {appointments.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.appointments.empty}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.appointments.colTime}</TableHead>
                <TableHead>{t.appointments.colPatient}</TableHead>
                <TableHead>{t.appointments.colDoctor}</TableHead>
                <TableHead>{t.appointments.colReason}</TableHead>
                <TableHead>{t.appointments.colStatus}</TableHead>
                {canManage && (
                  <TableHead className="text-right">
                    {t.appointments.colAction}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => {
                const open =
                  a.status === "SCHEDULED" || a.status === "CONFIRMED";
                return (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-ink">
                      {dtFmt.format(new Date(a.scheduledAt))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {a.durationMin} {t.appointments.minutes}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-ink">{a.patient}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {a.mrNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.doctor}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.reason || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          "inline-flex rounded px-2 py-0.5 text-xs font-semibold " +
                          STATUS_BADGE[a.status]
                        }
                      >
                        {t.appointments.statuses[a.status]}
                      </span>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        {open && (
                          <div className="flex items-center justify-end gap-1.5">
                            <form action={sendAppointmentReminder} title={t.appointments.remind}>
                              <input type="hidden" name="appointmentId" value={a.id} />
                              <Button type="submit" size="xs" variant="outline">
                                {t.appointments.remind}
                              </Button>
                            </form>
                            {a.phone &&
                              (() => {
                                const msg = renderTemplate(waReminderTemplate, {
                                  patient: a.patient,
                                  facility: facilityName,
                                  doctor: a.doctor,
                                  datetime: dtFmt.format(new Date(a.scheduledAt)),
                                });
                                const link = waLink(a.phone, msg);
                                if (!link) return null;
                                return (
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Kirim pengingat via WhatsApp"
                                  >
                                    <Button type="button" size="xs" variant="outline">
                                      WA
                                    </Button>
                                  </a>
                                );
                              })()}
                            {a.status === "SCHEDULED" && (
                              <form action={updateAppointmentStatus}>
                                <input type="hidden" name="appointmentId" value={a.id} />
                                <input type="hidden" name="status" value="CONFIRMED" />
                                <Button type="submit" size="xs" variant="outline">
                                  {t.appointments.confirm}
                                </Button>
                              </form>
                            )}
                            <form action={startVisit}>
                              <input type="hidden" name="appointmentId" value={a.id} />
                              <Button type="submit" size="xs">
                                {t.appointments.startVisit}
                              </Button>
                            </form>
                            <form action={updateAppointmentStatus}>
                              <input type="hidden" name="appointmentId" value={a.id} />
                              <input type="hidden" name="status" value="NO_SHOW" />
                              <Button type="submit" size="xs" variant="outline">
                                {t.appointments.noShow}
                              </Button>
                            </form>
                            <form
                              action={updateAppointmentStatus}
                              onSubmit={(e) => {
                                if (!window.confirm(t.appointments.cancelConfirm))
                                  e.preventDefault();
                              }}
                            >
                              <input type="hidden" name="appointmentId" value={a.id} />
                              <input type="hidden" name="status" value="CANCELLED" />
                              <Button type="submit" size="xs" variant="destructive">
                                {t.appointments.cancel}
                              </Button>
                            </form>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Jadwal praktik dokter */}
      {canManage && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-ink">
            {t.appointments.scheduleTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.appointments.scheduleHint}
          </p>

          <form
            action={addDoctorSchedule}
            className="mt-3 flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <select name="doctorId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                {t.appointments.selectDoctor}
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <select name="dayOfWeek" defaultValue="1" className={inputClass}>
              {t.appointments.days.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
            <Input name="startTime" type="time" defaultValue="08:00" className="h-9" />
            <span className="text-muted-foreground">–</span>
            <Input name="endTime" type="time" defaultValue="12:00" className="h-9" />
            <Button type="submit" size="sm">
              {t.appointments.addSchedule}
            </Button>
          </form>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {schedules.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t.appointments.noSchedule}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {schedules.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-ink">{s.doctor}</span>
                    <span className="rounded bg-mint px-2 py-0.5 text-xs font-semibold text-brand-deep">
                      {t.appointments.days[s.dayOfWeek]}
                    </span>
                    <span className="text-muted-foreground">
                      {s.startTime}–{s.endTime}
                    </span>
                    <form action={removeDoctorSchedule} className="ml-auto">
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        {t.appointments.cancel}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
