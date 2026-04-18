import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let _app: App | null = null;
function getApp(): App {
  if (_app) return _app;
  if (getApps()[0]) {
    _app = getApps()[0]!;
    return _app;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
  }
  const parsed = JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  _app = initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      // Private keys stored as JSON env vars often have literal "\n" instead
      // of newlines; normalize both encodings.
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    }),
  });
  return _app;
}

export function adminAuth(): Auth {
  return getAuth(getApp());
}
