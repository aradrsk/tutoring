import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  DOW_SHORT,
  generateSlots,
  loadAvailabilityInputs,
  torontoDow,
  torontoWallToUtc,
  TZ,
  type Duration,
} from "@/lib/availability";
import { db, schema } from "@/lib/db";
import { priceCentsFor } from "@/lib/stripe";
import { BrandMark } from "@/components/brand-mark";
import { and, eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { BookingWizard, type DayWithStarts } from "./booking-wizard";
import { LogoutButton } from "@/app/account/bookings/logout-button";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.age == null || !session.user.name.trim()) {
    redirect("/get-started");
  }

  const sp = await searchParams;
  const initialDuration = (
    sp.d === "30" || sp.d === "45" || sp.d === "60" ? Number(sp.d) : 60
  ) as Duration;

  const [rules, blocks] = await Promise.all([
    db
      .select()
      .from(schema.availabilityRules)
      .orderBy(asc(schema.availabilityRules.startTime)),
    db.select().from(schema.availabilityBlocks),
  ]);
  const { confirmed } = await loadAvailabilityInputs();

  const daysByDuration: Record<Duration, DayWithStarts[]> = {
    30: slotsFor(30),
    45: slotsFor(45),
    60: slotsFor(60),
  };

  function slotsFor(duration: Duration): DayWithStarts[] {
    const plan = generateSlots({
      rules,
      blocks,
      confirmed,
      duration,
      horizonDays: 30,
    });
    return plan.days.map((d) => {
        const midday = torontoWallToUtc(d.date, "12:00");
        const dow = torontoDow(midday);
        return {
          date: d.date,
          weekday: DOW_SHORT[dow],
          label: new Date(`${d.date}T12:00:00Z`).toLocaleDateString("en-CA", {
            timeZone: TZ,
            month: "short",
            day: "numeric",
          }),
          blocked: plan.blockedDates.has(d.date),
          starts: d.starts.map((s) => ({
            iso: s.toISOString(),
            local: s.toLocaleTimeString("en-CA", {
              timeZone: TZ,
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          })),
        };
      });
  }

  const hasAny =
    daysByDuration[30].some((d) => d.starts.length > 0) ||
    daysByDuration[45].some((d) => d.starts.length > 0) ||
    daysByDuration[60].some((d) => d.starts.length > 0);

  // Free if the user has no currently-confirmed booking (cancelled ones reset).
  const priorBookings = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.userId, session.user.id),
        eq(schema.bookings.status, "confirmed")
      )
    )
    .limit(1);
  const isFirstSession = priorBookings.length === 0;
  const priceCentsByDuration = {
    30: priceCentsFor(30),
    45: priceCentsFor(45),
    60: priceCentsFor(60),
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b-2 border-[#191A23]/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BrandMark size={28} colour="#B9FF66" background="#191A23" />
            tutor<span className="text-[#B9FF66]">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/account/bookings"
              className="text-sm font-medium hover:underline"
            >
              Bookings
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
            Book a session
          </p>
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Pick a{" "}
            <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
              time
            </span>
            .
          </h1>
          <p className="mt-3 max-w-xl text-[#191A23]/70">
            All times shown in Toronto (ET). You can cancel up to 24 hours before.
          </p>
        </div>

        {!hasAny ? (
          <div className="rounded-[32px] border-2 border-dashed border-[#191A23]/20 bg-white p-12 text-center">
            <h2 className="text-2xl font-medium">No open slots right now</h2>
            <p className="mt-3 text-[#191A23]/60">
              The teacher hasn&apos;t published windows that fit any duration
              for the next 30 days. Check back later.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-2xl border-2 border-[#191A23] bg-white px-6 py-3 text-sm font-medium hover:bg-zinc-50"
            >
              Back home
            </Link>
          </div>
        ) : (
          <BookingWizard
            initialDuration={initialDuration}
            daysByDuration={daysByDuration}
            isFirstSession={isFirstSession}
            priceCentsByDuration={priceCentsByDuration}
          />
        )}
      </div>
    </main>
  );
}
