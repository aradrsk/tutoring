import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = db.get<{ ok: number }>(sql`select 1 as ok`);
    const ok = result?.ok === 1;
    return NextResponse.json(
      { ok, db: "sqlite", timestamp: new Date().toISOString() },
      { status: ok ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 503 }
    );
  }
}
