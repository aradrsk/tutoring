import { redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import { TZ } from "@/lib/availability";
import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "./logout-button";
import { cancelBookingAction } from "./actions";

export const dynamic = "force-dynamic";

const CANCEL_CUTOFF_MS = 24 * 60 * 60 * 1000;

export default async function AccountBookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { user } = session;
  const firstName = user.name?.split(" ")[0] ?? "";
  const now = new Date();

  // Teachers see all confirmed bookings (for now). Students see only their own.
  const baseQuery = db
    .select({
      id: schema.bookings.id,
      userId: schema.bookings.userId,
      startAt: schema.bookings.startAt,
      durationMinutes: schema.bookings.durationMinutes,
      status: schema.bookings.status,
      paymentStatus: schema.bookings.paymentStatus,
      priceCents: schema.bookings.priceCents,
      userName: schema.user.name,
      userEmail: schema.user.email,
    })
    .from(schema.bookings)
    .leftJoin(schema.user, eq(schema.bookings.userId, schema.user.id));

  const mineFilter =
    user.role === "teacher" ? undefined : eq(schema.bookings.userId, user.id);

  const upcoming = await baseQuery
    .where(
      mineFilter
        ? and(
            eq(schema.bookings.status, "confirmed"),
            gte(schema.bookings.startAt, now),
            mineFilter
          )
        : and(
            eq(schema.bookings.status, "confirmed"),
            gte(schema.bookings.startAt, now)
          )
    )
    .orderBy(asc(schema.bookings.startAt))
    .limit(50);

  const past = await baseQuery
    .where(
      mineFilter
        ? and(lt(schema.bookings.startAt, now), mineFilter)
        : lt(schema.bookings.startAt, now)
    )
    .orderBy(desc(schema.bookings.startAt))
    .limit(20);

  const upcomingCount = upcoming.length;
  const pastCount = past.length;

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Dashboard nav */}
      <header className="border-b-2 border-[#191A23]/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BrandMark size={28} colour="#B9FF66" background="#191A23" />
            tutor<span className="text-[#B9FF66]">.</span>
          </Link>
          <div className="flex items-center gap-3">
            {user.role === "teacher" ? (
              <Link
                href="/dashboard/availability"
                className="rounded-2xl bg-[#B9FF66] px-4 py-2 text-sm font-medium text-[#191A23] hover:bg-white hover:ring-2 hover:ring-[#191A23]"
              >
                Manage availability
              </Link>
            ) : (
              <Link
                href="/book"
                className="rounded-2xl bg-[#B9FF66] px-4 py-2 text-sm font-medium text-[#191A23] hover:bg-white hover:ring-2 hover:ring-[#191A23]"
              >
                Book a session
              </Link>
            )}
            <span className="hidden text-sm text-[#191A23]/60 sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Greeting */}
        <div className="mb-10 flex flex-wrap items-end gap-4">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Hi
            {firstName && (
              <>
                ,{" "}
                <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
                  {firstName}
                </span>
              </>
            )}
            .
          </h1>
          <p className="text-[#191A23]/60">
            {user.role === "teacher"
              ? "Teacher view — all confirmed bookings."
              : "Your student dashboard."}
          </p>
        </div>

        {/* Top stats */}
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          <StatCard
            label={user.role === "teacher" ? "Upcoming (all)" : "Upcoming sessions"}
            value={String(upcomingCount)}
            accent="lime"
          />
          <StatCard
            label={user.role === "teacher" ? "Past (all)" : "Past sessions"}
            value={String(pastCount)}
            accent="light"
          />
          <StatCard
            label="Account role"
            value={user.role === "teacher" ? "Teacher" : "Student"}
            accent="dark"
          />
        </div>

        {/* Upcoming bookings */}
        <section className="rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-2xl font-medium md:text-3xl">
              {user.role === "teacher" ? "Upcoming" : "Your upcoming sessions"}
            </h2>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-[28px] border-2 border-dashed border-[#191A23]/20 bg-zinc-50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#B9FF66]">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-medium">No upcoming sessions</h3>
              <p className="mt-2 text-sm text-[#191A23]/60">
                {user.role === "teacher"
                  ? "Once students book, their sessions will appear here."
                  : "Pick a time that works and we'll lock it in."}
              </p>
              {user.role !== "teacher" && (
                <div className="mt-6">
                  <Link
                    href="/book"
                    className="inline-block rounded-2xl bg-[#191A23] px-6 py-3 text-sm font-medium text-white hover:bg-[#2a2b38]"
                  >
                    Book a session
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  viewerRole={user.role === "teacher" ? "teacher" : "student"}
                  now={now}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Past bookings */}
        {past.length > 0 && (
          <section className="mt-8 rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
            <h2 className="mb-5 inline-block rounded-md bg-zinc-200 px-3 py-1 text-lg font-medium">
              Past sessions
            </h2>
            <ul className="space-y-2">
              {past.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#191A23]/10 bg-zinc-50 p-4 text-sm"
                >
                  <div>
                    <p className="font-medium">{formatDateTime(b.startAt)}</p>
                    <p className="text-xs text-[#191A23]/60">
                      {b.durationMinutes} min
                      {user.role === "teacher" && b.userName
                        ? ` · ${b.userName}`
                        : ""}
                      {b.status === "cancelled" ? " · cancelled" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Account details */}
        <section className="mt-8 rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
          <h2 className="mb-5 inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-lg font-medium">
            Account
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <DetailRow label="Name" value={user.name ?? "—"} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Age" value={user.age?.toString() ?? "—"} />
            <DetailRow label="Role" value={user.role} />
          </dl>
        </section>
      </div>
    </main>
  );
}

type BookingRowData = {
  id: string;
  userId: string;
  startAt: Date;
  durationMinutes: number;
  status: "confirmed" | "cancelled";
  paymentStatus: "free" | "pending" | "paid" | "refunded";
  priceCents: number;
  userName: string | null;
  userEmail: string | null;
};

function BookingRow({
  booking,
  viewerRole,
  now,
}: {
  booking: BookingRowData;
  viewerRole: "teacher" | "student";
  now: Date;
}) {
  const startMs = new Date(booking.startAt).getTime();
  const untilMs = startMs - now.getTime();
  const canCancel =
    booking.status === "confirmed" &&
    (viewerRole === "teacher" || untilMs >= CANCEL_CUTOFF_MS);
  const cancelLockReason =
    viewerRole === "student" && untilMs < CANCEL_CUTOFF_MS
      ? "Less than 24h to start — can't cancel"
      : null;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border-2 border-[#191A23] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-medium">{formatDateTime(booking.startAt)}</p>
          <PaymentBadge status={booking.paymentStatus} />
        </div>
        <p className="mt-0.5 text-sm text-[#191A23]/60">
          {booking.durationMinutes} minutes
          {viewerRole === "teacher" && booking.userName
            ? ` · ${booking.userName}${
                booking.userEmail ? ` · ${booking.userEmail}` : ""
              }`
            : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {cancelLockReason && (
          <span className="text-xs text-[#191A23]/50">{cancelLockReason}</span>
        )}
        {canCancel && (
          <form action={cancelBookingAction}>
            <input type="hidden" name="id" value={booking.id} />
            <button className="rounded-full border-2 border-red-500/30 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
              Cancel
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

function PaymentBadge({
  status,
}: {
  status: "free" | "pending" | "paid" | "refunded";
}) {
  const styles = {
    free: "bg-[#B9FF66] text-[#191A23]",
    paid: "bg-[#191A23] text-white",
    pending: "bg-amber-300 text-[#191A23]",
    refunded: "bg-zinc-200 text-[#191A23]",
  }[status];
  const label = {
    free: "Free",
    paid: "Paid",
    pending: "Payment pending",
    refunded: "Refunded",
  }[status];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest ${styles}`}
    >
      {label}
    </span>
  );
}

function formatDateTime(d: Date): string {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: TZ,
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "lime" | "light" | "dark";
}) {
  const styles = {
    lime: "bg-[#B9FF66] text-[#191A23]",
    light: "bg-white text-[#191A23] border-2 border-[#191A23]",
    dark: "bg-[#191A23] text-white",
  }[accent];
  return (
    <div
      className={`rounded-[32px] p-6 shadow-[0_6px_0_0_#191A23] ${styles}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="mt-2 text-4xl font-medium">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3">
      <dt className="text-[#191A23]/60">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
