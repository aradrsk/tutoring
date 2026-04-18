import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { adminAuth } from "./firebase-admin";
import { db, schema } from "./db";

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export type AppUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  age: number | null;
  role: "teacher" | "user";
  image: string | null;
};

export type AppSession = {
  user: AppUser;
};

/**
 * Read the session cookie, verify it with Firebase Admin, then hydrate the
 * user from the app's user table. Returns null if no session, or if the
 * cookie is invalid/expired.
 */
export async function getSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  let decoded;
  try {
    // checkRevoked=true so revoked sessions (logout/password change) fail fast.
    decoded = await adminAuth().verifySessionCookie(cookie, true);
  } catch {
    return null;
  }

  const [row] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, decoded.uid))
    .limit(1);

  if (!row) return null;

  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      emailVerified: row.emailVerified,
      age: row.age,
      role: row.role,
      image: row.image,
    },
  };
}

/**
 * Used by /api/auth/session POST after verifying an ID token: upsert the
 * user row so our app has a profile, then return it. First-time Google
 * users will land here with no `age` and be asked to fill it later.
 */
export async function upsertUserFromFirebase(args: {
  uid: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  picture: string | null;
  age?: number | null;
}): Promise<void> {
  const existing = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.id, args.uid))
    .limit(1);

  const now = new Date();
  if (existing[0]) {
    await db
      .update(schema.user)
      .set({
        email: args.email,
        name: args.name ?? "",
        emailVerified: args.emailVerified,
        image: args.picture,
        updatedAt: now,
        ...(args.age != null ? { age: args.age } : {}),
      })
      .where(eq(schema.user.id, args.uid));
  } else {
    await db.insert(schema.user).values({
      id: args.uid,
      email: args.email,
      name: args.name ?? "",
      emailVerified: args.emailVerified,
      image: args.picture,
      age: args.age ?? null,
      role: "user",
      createdAt: now,
      updatedAt: now,
    });
  }
}
