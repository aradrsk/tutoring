import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";
import {
  DOW_LABELS,
  DOW_SHORT,
  generateSlots,
  loadAvailabilityInputs,
  TZ,
  type Duration,
} from "@/lib/availability";
import {
  addRuleAction,
  deleteRuleAction,
  toggleRuleAction,
  addBlockAction,
  deleteBlockAction,
} from "./actions";
import { LogoutButton } from "@/app/account/bookings/logout-button";
import { BrandMark } from "@/components/brand-mark";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "teacher") notFound();

  const sp = await searchParams;
  const duration = (
    sp.d === "30" || sp.d === "45" || sp.d === "60" ? Number(sp.d) : 60
  ) as Duration;

  const rules = await db
    .select()
    .from(schema.availabilityRules)
    .orderBy(asc(schema.availabilityRules.dayOfWeek), asc(schema.availabilityRules.startTime));
  const blocks = await db
    .select()
    .from(schema.availabilityBlocks)
    .orderBy(asc(schema.availabilityBlocks.date));

  const { confirmed } = await loadAvailabilityInputs();
  const plan = generateSlots({
    rules,
    blocks,
    confirmed,
    duration,
    horizonDays: 14,
  });

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b-2 border-[#191A23]/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BrandMark size={28} colour="#B9FF66" background="#191A23" />
            tutor<span className="text-[#B9FF66]">.</span>
          </Link>
          <nav className="hidden gap-5 text-sm md:flex">
            <Link href="/dashboard/availability" className="font-medium underline">
              Availability
            </Link>
            <Link href="/account/bookings" className="text-[#191A23]/70 hover:underline">
              Bookings
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
            Teacher · {TZ}
          </p>
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Your{" "}
            <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
              availability
            </span>
            .
          </h1>
          <p className="mt-3 max-w-xl text-[#191A23]/70">
            Weekly recurring windows plus specific date blocks. Students book
            inside these windows in 30 / 45 / 60 minute lengths.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly rules */}
          <section className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
            <h2 className="mb-5 inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-xl font-medium">
              Weekly windows
            </h2>

            <ul className="mb-6 space-y-2">
              {rules.length === 0 && (
                <li className="rounded-2xl border-2 border-dashed border-[#191A23]/20 bg-zinc-50 p-5 text-sm text-[#191A23]/60">
                  No windows yet. Add one below.
                </li>
              )}
              {rules.map((r) => (
                <li
                  key={r.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border-2 border-[#191A23] p-4 ${
                    r.active ? "bg-white" : "bg-zinc-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-10 rounded-md bg-[#191A23] px-2 py-1 text-center text-xs font-semibold text-[#B9FF66]">
                      {DOW_SHORT[r.dayOfWeek]}
                    </span>
                    <span className="font-mono text-[15px]">
                      {r.startTime.slice(0, 5)} – {r.endTime.slice(0, 5)}
                    </span>
                    {!r.active && (
                      <span className="text-xs uppercase tracking-widest text-[#191A23]/50">
                        paused
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleRuleAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="active" value={String(r.active)} />
                      <button className="rounded-full border border-[#191A23]/20 px-3 py-1 text-xs hover:bg-zinc-50">
                        {r.active ? "Pause" : "Resume"}
                      </button>
                    </form>
                    <form action={deleteRuleAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>

            <form
              action={addRuleAction}
              className="grid gap-3 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#191A23]/60">
                  Day
                </span>
                <select
                  name="day_of_week"
                  defaultValue="1"
                  className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-3 py-2 text-[15px]"
                >
                  {DOW_LABELS.map((label, i) => (
                    <option key={i} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#191A23]/60">
                  Start
                </span>
                <input
                  name="start_time"
                  type="time"
                  required
                  defaultValue="16:00"
                  className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-3 py-2 text-[15px]"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#191A23]/60">
                  End
                </span>
                <input
                  name="end_time"
                  type="time"
                  required
                  defaultValue="20:00"
                  className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-3 py-2 text-[15px]"
                />
              </label>
              <div className="sm:self-end">
                <button className="w-full rounded-xl bg-[#191A23] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2a2b38]">
                  Add window
                </button>
              </div>
            </form>
          </section>

          {/* Blocked dates */}
          <section className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
            <h2 className="mb-5 inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-xl font-medium">
              Blocked dates
            </h2>

            <ul className="mb-6 space-y-2">
              {blocks.length === 0 && (
                <li className="rounded-2xl border-2 border-dashed border-[#191A23]/20 bg-zinc-50 p-5 text-sm text-[#191A23]/60">
                  Nothing blocked.
                </li>
              )}
              {blocks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#191A23] bg-white p-4"
                >
                  <div>
                    <p className="font-mono text-[15px]">{b.date}</p>
                    {b.reason && (
                      <p className="text-xs text-[#191A23]/60">{b.reason}</p>
                    )}
                  </div>
                  <form action={deleteBlockAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-600 hover:bg-red-50">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>

            <form
              action={addBlockAction}
              className="grid gap-3 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#191A23]/60">
                  Date
                </span>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-3 py-2 text-[15px]"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-[#191A23]/60">
                  Reason (optional)
                </span>
                <input
                  name="reason"
                  type="text"
                  placeholder="Vacation, holiday…"
                  className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-3 py-2 text-[15px]"
                />
              </label>
              <div className="sm:self-end">
                <button className="w-full rounded-xl bg-[#191A23] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2a2b38]">
                  Block date
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Preview */}
        <section className="mt-8 rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-xl font-medium">
                Preview · next 14 days
              </h2>
              <p className="mt-2 text-sm text-[#191A23]/60">
                Valid start times for a {duration}-minute session. Grey days are
                blocked or outside your windows.
              </p>
            </div>
            <div className="flex gap-1 rounded-full border-2 border-[#191A23] p-1">
              {[30, 45, 60].map((d) => (
                <Link
                  key={d}
                  href={`?d=${d}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    duration === d
                      ? "bg-[#191A23] text-white"
                      : "text-[#191A23] hover:bg-zinc-100"
                  }`}
                >
                  {d}m
                </Link>
              ))}
            </div>
          </div>

          <ul className="grid gap-3 md:grid-cols-2">
            {plan.days.map((day) => {
              const isBlocked = plan.blockedDates.has(day.date);
              const label = new Date(`${day.date}T12:00:00`).toLocaleDateString("en-CA", {
                timeZone: TZ,
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <li
                  key={day.date}
                  className={`rounded-2xl border-2 p-4 ${
                    isBlocked
                      ? "border-red-300 bg-red-50"
                      : day.starts.length
                      ? "border-[#191A23] bg-white"
                      : "border-[#191A23]/15 bg-zinc-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{label}</span>
                    <span className="font-mono text-xs text-[#191A23]/50">
                      {day.date}
                    </span>
                  </div>
                  {isBlocked ? (
                    <p className="text-xs text-red-700">Blocked</p>
                  ) : day.starts.length === 0 ? (
                    <p className="text-xs text-[#191A23]/50">No availability</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {day.starts.map((s) => (
                        <span
                          key={s.toISOString()}
                          className="rounded-full bg-[#B9FF66] px-2 py-0.5 font-mono text-[11px] text-[#191A23]"
                        >
                          {s.toLocaleTimeString("en-CA", {
                            timeZone: TZ,
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
