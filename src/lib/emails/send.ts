import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "tutor. <onboarding@resend.dev>";

type Recipient = string | string[];

export type SendRawInput = {
  to: Recipient;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
};

export type SendTemplateInput = {
  to: Recipient;
  templateId: string;
  variables: Record<string, string | number | boolean>;
  from?: string;
  replyTo?: string;
  subject?: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Send with raw HTML. Use when there isn't a Resend template yet.
 */
export async function sendEmail(input: SendRawInput): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", input.to);
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  return post({
    from: input.from ?? FROM_DEFAULT,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: input.replyTo,
  });
}

/**
 * Send using a Resend-hosted template. Design lives in the Resend dashboard;
 * we supply only the variables. Preferred path for booking confirmations.
 */
export async function sendTemplate(input: SendTemplateInput): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping template send to", input.to);
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  return post({
    from: input.from ?? FROM_DEFAULT,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    reply_to: input.replyTo,
    template: {
      id: input.templateId,
      variables: input.variables,
    },
  });
}

async function post(body: Record<string, unknown>): Promise<SendResult> {
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as
      | { id: string }
      | { message?: string; name?: string };
    if (!res.ok) {
      const msg =
        ("message" in data && data.message) ||
        ("name" in data && data.name) ||
        `HTTP ${res.status}`;
      return { ok: false, error: String(msg) };
    }
    return { ok: true, id: (data as { id: string }).id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
