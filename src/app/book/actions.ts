"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import {
  generateSlots,
  loadAvailabilityInputs,
  TZ,
  type Duration,
} from "@/lib/availability";
import { sendTemplate } from "@/lib/emails/send";
import { stripe, priceCentsFor } from "@/lib/stripe";

const TEACHER_NAME_DEFAULT = "Theepa Jeyapalan";
const TEACHER_ADDRESS_DEFAULT =
  "Address in this email (teacher's home, Toronto)";
const BOOKING_CONFIRMATION_TEMPLATE_ID =
  process.env.RESEND_TEMPLATE_BOOKING ??
  "406b1842-5f5d-4791-a86e-5a0940d0a512";

export type BookingResult =
  | { ok: true; bookingId: string; checkoutUrl?: string; free: boolean }
  | { ok: false; error: string; retry?: boolean };

const ALLOWED_DURATIONS: readonly Duration[] = [30, 45, 60] as const;

function isAllowedDuration(n: number): n is Duration {
  return (ALLOWED_DURATIONS as readonly number[]).includes(n);
}

async function hasUsedFreeSession(userId: string): Promise<boolean> {
  // Free first session "resets on cancel": any currently-confirmed booking
  // (free, paid, or pending-payment) counts as "used". Once a booking is
  // cancelled it no longer counts, so the next attempt is free again.
  const rows = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.userId, userId),
        eq(schema.bookings.status, "confirmed")
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function createBookingAction(
  _prev: BookingResult | null,
  formData: FormData
): Promise<BookingResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You must be logged in." };

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

  const isFree = !(await hasUsedFreeSession(session.user.id));
  const priceCents = isFree ? 0 : priceCentsFor(duration);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tutoring.aradrsk.com";

  // Insert the booking as confirmed so the exclusion constraint locks the slot
  // immediately. Payment status distinguishes free vs pending-stripe vs paid.
  let bookingId: string;
  try {
    const [row] = await db
      .insert(schema.bookings)
      .values({
        userId: session.user.id,
        startAt,
        durationMinutes: duration,
        status: "confirmed",
        paymentStatus: isFree ? "free" : "pending",
        priceCents,
      })
      .returning({ id: schema.bookings.id });
    bookingId = row!.id;
  } catch (err) {
    const code =
      (err as { cause?: { code?: string }; code?: string }).cause?.code ??
      (err as { code?: string }).code;
    if (code === "23P01") {
      return {
        ok: false,
        retry: true,
        error: "Slot just taken — pick another.",
      };
    }
    return { ok: false, error: "Booking failed. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/account/bookings");
  revalidatePath("/dashboard/availability");

  if (isFree) {
    sendConfirmationEmail({
      toEmail: session.user.email,
      studentName: session.user.name ?? "there",
      startAt,
      duration,
      siteUrl,
    });
    return { ok: true, bookingId, free: true };
  }

  // Paid path — create a Stripe Checkout Session and return the URL.
  const dateLabel = formatDateLabel(startAt);
  const timeLabel = formatTimeLabel(startAt);

  try {
    const checkout = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: priceCents,
            product_data: {
              name: `English tutoring — ${duration} min with ${
                process.env.TEACHER_NAME ?? TEACHER_NAME_DEFAULT
              }`,
              description: `${dateLabel} at ${timeLabel}`,
            },
          },
        },
      ],
      customer_email: session.user.email,
      client_reference_id: bookingId,
      metadata: { bookingId },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
      success_url: `${siteUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book?cancelled=1`,
    });

    await db
      .update(schema.bookings)
      .set({ stripeSessionId: checkout.id })
      .where(eq(schema.bookings.id, bookingId));

    return {
      ok: true,
      bookingId,
      checkoutUrl: checkout.url ?? undefined,
      free: false,
    };
  } catch (err) {
    // If Stripe fails, back out the pending booking so the slot is freed.
    await db
      .update(schema.bookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
      })
      .where(eq(schema.bookings.id, bookingId));

    console.warn("[stripe] checkout create failed:", err);
    return {
      ok: false,
      error: "Couldn't start checkout. Try again in a moment.",
    };
  }
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeLabel(d: Date): string {
  return `${d.toLocaleTimeString("en-CA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} (Toronto)`;
}

export function sendConfirmationEmail(args: {
  toEmail: string;
  studentName: string;
  startAt: Date;
  duration: Duration;
  siteUrl: string;
}) {
  const { toEmail, studentName, startAt, duration, siteUrl } = args;
  void sendTemplate({
    to: toEmail,
    templateId: BOOKING_CONFIRMATION_TEMPLATE_ID,
    variables: {
      student_name: studentName,
      teacher_name: process.env.TEACHER_NAME ?? TEACHER_NAME_DEFAULT,
      date_label: formatDateLabel(startAt),
      time_label: formatTimeLabel(startAt),
      duration_minutes: duration,
      address: process.env.TEACHER_ADDRESS ?? TEACHER_ADDRESS_DEFAULT,
      cancel_url: `${siteUrl}/account/bookings`,
      site_url: siteUrl,
    },
  }).then((res) => {
    if (!res.ok)
      console.warn("[email] booking confirmation failed:", res.error);
  });
}
