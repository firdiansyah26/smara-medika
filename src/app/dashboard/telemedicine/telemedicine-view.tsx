"use client";

import { useRouter } from "next/navigation";
import type { TeleconsultStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createSession } from "./actions";

export type Option = { id: string; label: string };
export type SessionRow = {
  id: string;
  roomCode: string;
  scheduledAt: string;
  patient: string;
  mrNumber: string;
  doctor: string;
  status: TeleconsultStatus;
};

const STATUS_BADGE: Record<TeleconsultStatus, string> = {
  SCHEDULED: "bg-slate-100 text-slate-600",
  ONGOING: "bg-emerald-50 text-emerald-700",
  ENDED: "bg-sky-50 text-sky-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<TeleconsultStatus, string> = {
  SCHEDULED: "Terjadwal",
  ONGOING: "Berlangsung",
  ENDED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const inputClass =
  "h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

export function TelemedicineView({
  sessions,
  patients,
  doctors,
  canManage,
}: {
  sessions: SessionRow[];
  patients: Option[];
  doctors: Option[];
  canManage: boolean;
}) {
  const router = useRouter();
  const dtFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Telemedicine
        </h1>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
          Beta
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Jadwalkan dan kelola sesi telekonsultasi. Ruang video akan aktif saat
        integrasi penyedia video dinyalakan.
      </p>

      {canManage && (
        <form
          action={createSession}
          className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Pasien
            <select name="patientId" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Pilih pasien
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Dokter
            <select name="doctorId" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Pilih dokter
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Waktu
            <input
              type="datetime-local"
              name="scheduledAt"
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Catatan (opsional)
            <input
              type="text"
              name="note"
              placeholder="Keluhan / topik"
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit">Jadwalkan sesi</Button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Pasien</TableHead>
              <TableHead>Dokter</TableHead>
              <TableHead>Kode Ruang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada sesi telekonsultasi.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {dtFmt.format(new Date(s.scheduledAt))}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-ink">{s.patient}</div>
                    <div className="text-xs text-muted-foreground">{s.mrNumber}</div>
                  </TableCell>
                  <TableCell className="text-sm">{s.doctor}</TableCell>
                  <TableCell className="font-mono text-xs">{s.roomCode}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[s.status]}`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/telemedicine/${s.id}`)}
                    >
                      Buka ruang
                    </Button>
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
