import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // dev: skipped; re-enable with Resend wiring in TU-9
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      age: { type: "number", required: true, input: true },
      role: { type: "string", required: false, defaultValue: "user", input: false },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
