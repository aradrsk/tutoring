import "server-only";
import { Resend } from "resend";

// Override via EMAIL_FROM env. Until the Resend domain verification for
// mail.tutoring.aradrsk.com finishes, Resend will only accept their shared
// sender `onboarding@resend.dev` (and only send to the Resend account owner).
const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "tutor. <onboarding@resend.dev>";

let _client: Resend | null = null;
function client() {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _client = new Resend(key);
  return _client;
}

export type SendInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
};

/**
 * Send an email via Resend. No-op with a console warning if RESEND_API_KEY is
 * unset — so the surrounding business logic (booking insert, etc.) still
 * succeeds during local dev before the key is wired.
 */
export async function sendEmail(input: SendInput): Promise<
  { ok: true; id: string } | { ok: false; error: string }
> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", input.to);
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  try {
    const res = await client().emails.send({
      from: input.from ?? FROM_DEFAULT,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (res.error) return { ok: false, error: res.error.message };
    return { ok: true, id: res.data?.id ?? "" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
