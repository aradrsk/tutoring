import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, schema } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendConfirmationEmail } from "@/app/book/actions";
import type { Duration } from "@/lib/availability";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Webhook secret not configured — accept-but-ignore so misconfigured
    // dashboards don't flood our logs with 500s. Polling on /book/success
    // covers the happy path.
    return NextResponse.json({ received: true, skipped: true });
  }
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.warn("[stripe] webhook signature verification failed:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const bookingId = s.metadata?.bookingId;
      if (!bookingId) break;

      const [row] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId))
        .limit(1);
      if (!row) break;

      if (row.paymentStatus !== "paid") {
        await db
          .update(schema.bookings)
          .set({ paymentStatus: "paid", paidAt: new Date() })
          .where(eq(schema.bookings.id, bookingId));

        const [user] = await db
          .select({ email: schema.user.email, name: schema.user.name })
          .from(schema.user)
          .where(eq(schema.user.id, row.userId))
          .limit(1);
        if (user) {
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL ?? "https://tutoring.aradrsk.com";
          sendConfirmationEmail({
            toEmail: user.email,
            studentName: user.name || "there",
            startAt: new Date(row.startAt),
            duration: row.durationMinutes as Duration,
            siteUrl,
          });
        }
      }
      break;
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const bookingId = s.metadata?.bookingId;
      if (!bookingId) break;

      // Release the slot: the user abandoned or payment failed.
      await db
        .update(schema.bookings)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
        })
        .where(eq(schema.bookings.id, bookingId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
