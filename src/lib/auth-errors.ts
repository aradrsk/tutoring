/**
 * Map Firebase / our own auth error codes to short, human-readable messages.
 * Returns null for errors we want to silently ignore (user cancellations).
 */
const MESSAGES: Record<string, string> = {
  // Firebase client (firebase/auth)
  "auth/email-already-in-use": "An account with that email already exists. Try logging in.",
  "auth/invalid-email": "That email doesn't look right.",
  "auth/weak-password": "Password is too weak — use at least 8 characters.",
  "auth/missing-password": "Enter a password.",
  "auth/user-not-found": "No account with that email.",
  "auth/wrong-password": "Wrong password.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/invalid-login-credentials": "Wrong email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-blocked": "Your browser blocked the sign-in window. Allow popups for this site and try again.",
  "auth/account-exists-with-different-credential":
    "An account with this email already exists with a different sign-in method. Try that one instead.",
  "auth/operation-not-allowed":
    "This sign-in method isn't enabled yet. Try the other option.",
  "auth/unauthorized-domain":
    "This site isn't authorized for sign-in. Tell Arad — the domain needs whitelisting.",

  // Our /api/auth/session responses
  invalid_id_token: "Your session couldn't be verified. Try again.",
  missing_id_token: "Sign-in didn't return an ID token. Try again.",
  session_create_failed: "Couldn't start your session. Try again.",
};

const SILENT_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

export type AuthErrorLike = {
  code?: string;
  message?: string;
};

/**
 * Normalize any auth error into a user-facing string. Returns null if the
 * error should be shown silently (the user cancelled a popup, etc.).
 */
export function authErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const e = err as AuthErrorLike;
  if (e.code && SILENT_CODES.has(e.code)) return null;
  if (e.code && MESSAGES[e.code]) return MESSAGES[e.code];
  // Fallback: strip the "Firebase: Error (auth/…)." chrome from default messages.
  const raw = e.message ?? String(err);
  const cleaned = raw
    .replace(/^Firebase:\s*/i, "")
    .replace(/\s*\(auth\/[^)]+\)\.?$/i, "")
    .trim();
  return cleaned || "Something went wrong. Try again.";
}
