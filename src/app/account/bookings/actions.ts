"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const CANCEL_CUTOFF_MIN = 12 * 60;

export async function cancelBookingAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const [booking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, id))
    .limit(1);

  if (!booking) throw new Error("Not found");

  const isOwner = booking.userId === session.user.id;
  const isTeacher = session.user.role === "teacher";
  if (!isOwner && !isTeacher) throw new Error("Forbidden");

  if (booking.status === "cancelled") return; // idempotent

  // Enforce 12h cutoff for non-teacher cancels (teacher can always cancel).
  if (!isTeacher) {
    const minutesUntilStart =
      (new Date(booking.startAt).getTime() - Date.now()) / 60000;
    if (minutesUntilStart < CANCEL_CUTOFF_MIN) {
      throw new Error(
        "Too close to start time — cancel at least 12 hours ahead."
      );
    }
  }

  // If this was a paid booking, refund before marking cancelled. If the
  // refund fails, throw — we don't want to leave money on the table while
  // silently cancelling the session.
  let newPaymentStatus = booking.paymentStatus;
  if (booking.paymentStatus === "paid" && booking.stripeSessionId) {
    try {
      const checkout = await stripe().checkout.sessions.retrieve(
        booking.stripeSessionId
      );
      const paymentIntent =
        typeof checkout.payment_intent === "string"
          ? checkout.payment_intent
          : checkout.payment_intent?.id;
      if (!paymentIntent) {
        throw new Error("No payment intent on checkout session");
      }
      await stripe().refunds.create({
        payment_intent: paymentIntent,
        reason: "requested_by_customer",
        metadata: { bookingId: booking.id, cancelledBy: session.user.id },
      });
      newPaymentStatus = "refunded";
    } catch (err) {
      console.error("[stripe] refund failed:", err);
      throw new Error(
        "Couldn't process the refund automatically. Email aradrsk@gmail.com and we'll sort it out."
      );
    }
  }

  await db
    .update(schema.bookings)
    .set({
      status: "cancelled",
      paymentStatus: newPaymentStatus,
      cancelledAt: new Date(),
      cancelledBy: session.user.id,
    })
    .where(
      and(eq(schema.bookings.id, id), eq(schema.bookings.status, "confirmed"))
    );

  revalidatePath("/account/bookings");
  revalidatePath("/");
  revalidatePath("/book");
}
