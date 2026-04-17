import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  checks.env = {
    ok:
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    detail: "Required Supabase public env vars present",
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    checks.supabase = {
      ok: !error,
      detail: error ? error.message : "Supabase session endpoint reachable",
    };
  } catch (err) {
    checks.supabase = { ok: false, detail: (err as Error).message };
  }

  const ok = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { ok, checks, timestamp: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
