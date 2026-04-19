"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";

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
      throw new Error("Too close to start time — cancel at least 12 hours ahead.");
    }
  }

  await db
    .update(schema.bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: session.user.id,
    })
    .where(and(eq(schema.bookings.id, id), eq(schema.bookings.status, "confirmed")));

  revalidatePath("/account/bookings");
  revalidatePath("/");
  revalidatePath("/book");
}
