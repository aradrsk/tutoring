import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  upsertUserFromFirebase,
} from "@/lib/session";

/**
 * Exchange a Firebase ID token for a long-lived session cookie, and ensure
 * a user row exists in the app DB.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    idToken?: string;
    age?: number | null;
  } | null;
  const idToken = body?.idToken;
  if (!idToken) {
    return NextResponse.json({ error: "missing_id_token" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_id_token" }, { status: 401 });
  }

  await upsertUserFromFirebase({
    uid: decoded.uid,
    email: decoded.email ?? "",
    name: (decoded.name as string | undefined) ?? null,
    emailVerified: Boolean(decoded.email_verified),
    picture: (decoded.picture as string | undefined) ?? null,
    age: typeof body?.age === "number" ? body.age : null,
  });

  let cookie;
  try {
    cookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });
  } catch {
    return NextResponse.json(
      { error: "session_create_failed" },
      { status: 500 }
    );
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
  });

  return NextResponse.json({ ok: true });
}

/** Sign out — clear the cookie. */
export async function DELETE() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
