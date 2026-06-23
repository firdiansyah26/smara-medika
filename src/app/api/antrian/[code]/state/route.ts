import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ALL_COUNTERS, startOfToday } from "@/lib/queue";

// Publik: state antrian untuk papan display (di-poll).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const tenant = await db.tenant.findUnique({
    where: { code },
    select: { id: true },
  });
  if (!tenant) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const since = startOfToday();
  const called = await db.queueTicket.findMany({
    where: { tenantId: tenant.id, status: "CALLED", calledAt: { gte: since } },
    orderBy: { calledAt: "desc" },
    select: { id: true, code: true, counter: true, calledAt: true },
  });

  const perCounter: Record<string, { code: string; counter: string }> = {};
  for (const tk of called) {
    if (tk.counter && !perCounter[tk.counter]) {
      perCounter[tk.counter] = { code: tk.code, counter: tk.counter };
    }
  }

  const waiting = await db.queueTicket.count({
    where: { tenantId: tenant.id, status: "WAITING", createdAt: { gte: since } },
  });

  return NextResponse.json({
    last: called[0]
      ? { id: called[0].id, code: called[0].code, counter: called[0].counter }
      : null,
    counters: ALL_COUNTERS.map(
      (c) => perCounter[c] ?? { counter: c, code: null },
    ),
    waiting,
  });
}
