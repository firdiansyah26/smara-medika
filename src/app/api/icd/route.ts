import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchIcd10 } from "@/lib/icd10";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ success: true, data: searchIcd10(q) });
}
