"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import {
  generateSlots,
  loadAvailabilityInputs,
  TZ,
  type Duration,
} from "@/lib/availability";
import { sendTemplate } from "@/lib/emails/send";

const TEACHER_NAME_DEFAULT = "Theepa Jeyapalan";
const TEACHER_ADDRESS_DEFAULT =
  "Address in this email (teacher's home, Toronto)";
const BOOKING_CONFIRMATION_TEMPLATE_ID =
  process.env.RESEND_TEMPLATE_BOOKING ??
  "406b1842-5f5d-4791-a86e-5a0940d0a512";

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string; retry?: boolean };

const ALLOWED_DURATIONS: readonly Duration[] = [30, 45, 60] as const;

function isAllowedDuration(n: number): n is Duration {
  return (ALLOWED_DURATIONS as readonly number[]).includes(n);
}

export async function createBookingAction(
  _prev: BookingResult | null,
  formData: FormData
): Promise<BookingResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "You must be logged in." };

  // Placeholder for when email verification is re-enabled in TU-9.
  // if (!session.user.emailVerified) {
  //   return { ok: false, error: "Verify your email before booking." };
  // }

  const durationRaw = Number(formData.get("duration") ?? NaN);
  const startIso = String(formData.get("start_at") ?? "").trim();

  if (!Number.isInteger(durationRaw) || !isAllowedDuration(durationRaw)) {
    return { ok: false, error: "Invalid session length." };
  }
  const duration: Duration = durationRaw;

  const startAt = new Date(startIso);
  if (isNaN(startAt.getTime())) {
    return { ok: false, error: "Invalid start time." };
  }

  // Server-side slot validation — never trust the client.
  const { rules, blocks, confirmed } = await loadAvailabilityInputs();
  const plan = generateSlots({ rules, blocks, confirmed, duration });
  const valid = plan.days.some((d) =>
    d.starts.some((s) => s.getTime() === startAt.getTime())
  );
  if (!valid) {
    return {
      ok: false,
      retry: true,
      error:
        "That slot isn't available anymore — it may have just been booked. Pick another.",
    };
  }

  // Insert; if the Postgres exclusion constraint fires because someone grabbed
  // the overlapping slot between our check and our insert, surface it cleanly.
  try {
    const [row] = await db
      .insert(schema.bookings)
      .values({
        userId: session.user.id,
        startAt,
        durationMinutes: duration,
        status: "confirmed",
      })
      .returning({ id: schema.bookings.id });

    revalidatePath("/");
    revalidatePath("/account/bookings");
    revalidatePath("/dashboard/availability");

    // Fire-and-forget booking confirmation email. Failure doesn't roll back
    // the booking — the row is already the source of truth.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tutoring.aradrsk.com";
    const dateLabel = startAt.toLocaleDateString("en-CA", {
      timeZone: TZ,
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timeLabel = `${startAt.toLocaleTimeString("en-CA", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} (Toronto)`;

    // Don't await — keep the booking response fast.
    void sendTemplate({
      to: session.user.email,
      templateId: BOOKING_CONFIRMATION_TEMPLATE_ID,
      variables: {
        student_name: session.user.name ?? "there",
        teacher_name: process.env.TEACHER_NAME ?? TEACHER_NAME_DEFAULT,
        date_label: dateLabel,
        time_label: timeLabel,
        duration_minutes: duration,
        address: process.env.TEACHER_ADDRESS ?? TEACHER_ADDRESS_DEFAULT,
        cancel_url: `${siteUrl}/account/bookings`,
        site_url: siteUrl,
      },
    }).then((res) => {
      if (!res.ok) console.warn("[email] booking confirmation failed:", res.error);
    });

    return { ok: true, bookingId: row!.id };
  } catch (err) {
    // Postgres exclusion_violation = 23P01
    const code = (err as { cause?: { code?: string }; code?: string }).cause
      ?.code ?? (err as { code?: string }).code;
    if (code === "23P01") {
      return {
        ok: false,
        retry: true,
        error: "Slot just taken — pick another.",
      };
    }
    return { ok: false, error: "Booking failed. Try again." };
  }
}
