import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { BrandMark } from "@/components/brand-mark";
import { TZ, type Duration } from "@/lib/availability";
import { sendBookingConfirmation } from "@/lib/emails/booking-notify";

export const dynamic = "force-dynamic";

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const stripeSessionId = sp.session_id;
  if (!stripeSessionId) redirect("/account/bookings");

  let checkout: Stripe.Checkout.Session;
  try {
    checkout = await stripe().checkout.sessions.retrieve(stripeSessionId);
  } catch {
    return (
      <Shell
        title="Couldn't verify payment"
        body="We couldn't look up that checkout session. Check your dashboard — if the charge went through, it'll show as paid within a minute."
      />
    );
  }

  const bookingId = checkout.metadata?.bookingId;
  if (!bookingId) redirect("/account/bookings");

  const [booking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .limit(1);

  if (!booking || booking.userId !== session.user.id) {
    return (
      <Shell
        title="Booking not found"
        body="That booking doesn't belong to this account."
      />
    );
  }

  // If Stripe says paid and our DB hasn't caught up (webhook may not be wired
  // yet), update it here so the UI is accurate.
  if (checkout.payment_status === "paid" && booking.paymentStatus !== "paid") {
    await db
      .update(schema.bookings)
      .set({ paymentStatus: "paid", paidAt: new Date() })
      .where(eq(schema.bookings.id, booking.id));

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tutoring.aradrsk.com";
    sendBookingConfirmation({
      toEmail: session.user.email,
      studentName: session.user.name ?? "there",
      startAt: new Date(booking.startAt),
      duration: booking.durationMinutes as Duration,
      siteUrl,
    });
  }

  const paid =
    checkout.payment_status === "paid" || booking.paymentStatus === "paid";
  const when = new Date(booking.startAt).toLocaleString("en-CA", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Shell
      title={paid ? "You're booked." : "Payment is processing."}
      body={
        paid
          ? `Your ${booking.durationMinutes}-minute session is locked in for ${when}. Confirmation email on the way.`
          : `We'll confirm your ${booking.durationMinutes}-minute session once Stripe finishes processing. Check your dashboard in a minute.`
      }
      paid={paid}
    />
  );
}

function Shell({
  title,
  body,
  paid,
}: {
  title: string;
  body: string;
  paid?: boolean;
}) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b-2 border-[#191A23]/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BrandMark size={28} colour="#B9FF66" background="#191A23" />
            tutor<span className="text-[#B9FF66]">.</span>
          </Link>
          <Link
            href="/account/bookings"
            className="text-sm font-medium hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-6 py-20">
        <div className="rounded-[40px] border-2 border-[#191A23] bg-white p-10 text-center shadow-[0_6px_0_0_#191A23]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#B9FF66]">
            <span className="text-3xl">{paid === false ? "…" : "✓"}</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
          <p className="mt-4 text-[#191A23]/70">{body}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/account/bookings"
              className="rounded-2xl bg-[#191A23] px-6 py-3 text-sm font-medium text-white hover:bg-[#2a2b38]"
            >
              View bookings
            </Link>
            <Link
              href="/"
              className="rounded-2xl border-2 border-[#191A23] bg-white px-6 py-3 text-sm font-medium hover:bg-zinc-50"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
