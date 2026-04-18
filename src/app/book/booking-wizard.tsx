"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBookingAction,
  type BookingResult,
} from "./actions";
import type { Duration } from "@/lib/availability";

export type StartSlot = { iso: string; local: string };
export type DayWithStarts = {
  date: string;
  weekday: string;
  label: string;
  blocked: boolean;
  starts: StartSlot[];
};

export function BookingWizard({
  initialDuration,
  daysByDuration,
}: {
  initialDuration: Duration;
  daysByDuration: Record<Duration, DayWithStarts[]>;
}) {
  const router = useRouter();
  const [duration, setDuration] = useState<Duration>(initialDuration);
  const [selectedStart, setSelectedStart] = useState<StartSlot | null>(null);
  const [result, formAction, pending] = useActionState<BookingResult | null, FormData>(
    createBookingAction,
    null
  );

  const days = daysByDuration[duration];
  const daysByDate = new Map(days.map((d) => [d.date, d]));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Keep selected date consistent when duration changes
  const effectiveSelectedDate =
    selectedDate && daysByDate.has(selectedDate) ? selectedDate : null;
  const selectedDay = effectiveSelectedDate
    ? daysByDate.get(effectiveSelectedDate) ?? null
    : null;

  if (result?.ok) {
    // Booking succeeded — kick to dashboard.
    if (typeof window !== "undefined") {
      router.push("/account/bookings");
      router.refresh();
    }
    return (
      <div className="rounded-[32px] border-2 border-[#191A23] bg-white p-10 text-center shadow-[0_6px_0_0_#191A23]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#B9FF66]">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-medium">Booked</h2>
        <p className="mt-2 text-[#191A23]/70">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: duration */}
      <section className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23] md:p-9">
        <StepBadge n={1} />
        <h2 className="mt-3 text-2xl font-medium">Session length</h2>
        <p className="mt-1 text-sm text-[#191A23]/60">
          Pick one. You can always book a different length next time.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {([30, 45, 60] as Duration[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDuration(d);
                setSelectedStart(null);
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                duration === d
                  ? "border-[#191A23] bg-[#B9FF66]"
                  : "border-[#191A23]/15 bg-white hover:border-[#191A23]"
              }`}
            >
              <p className="text-3xl font-medium">{d}m</p>
              <p className="mt-1 text-xs text-[#191A23]/70">
                {d === 30
                  ? "Quick review / homework help"
                  : d === 45
                  ? "Balanced — reading + writing"
                  : "Deep dive — essays, test prep"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: start time — calendar */}
      <section className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23] md:p-9">
        <StepBadge n={2} />
        <h2 className="mt-3 text-2xl font-medium">Pick a date</h2>
        <p className="mt-1 text-sm text-[#191A23]/60">
          All times in Toronto (ET). Green = open. Grey = no availability. Red =
          blocked.
        </p>

        {days.filter((d) => d.starts.length > 0).length === 0 ? (
          <p className="mt-5 rounded-2xl bg-zinc-50 p-5 text-sm text-[#191A23]/70">
            No available start times at {duration} min. Try a shorter length.
          </p>
        ) : (
          <>
            <CalendarGrid
              days={days}
              selected={effectiveSelectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedStart(null);
              }}
            />
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#191A23]/70">
              <LegendDot className="bg-[#B9FF66]" label="Open" />
              <LegendDot className="bg-zinc-200" label="No availability" />
              <LegendDot className="bg-red-200" label="Blocked" />
            </div>

            {/* Times for selected date */}
            <div className="mt-6 rounded-2xl border-2 border-[#191A23]/15 bg-zinc-50 p-5">
              {!selectedDay ? (
                <p className="text-center text-sm text-[#191A23]/60">
                  Tap a date above to see open times.
                </p>
              ) : selectedDay.blocked ? (
                <p className="text-center text-sm text-red-700">
                  {selectedDay.weekday} · {selectedDay.label} is blocked.
                </p>
              ) : selectedDay.starts.length === 0 ? (
                <p className="text-center text-sm text-[#191A23]/60">
                  No open times on {selectedDay.weekday} · {selectedDay.label}.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-sm font-medium">
                    {selectedDay.weekday} · {selectedDay.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.starts.map((s) => (
                      <button
                        key={s.iso}
                        type="button"
                        onClick={() => setSelectedStart(s)}
                        className={`rounded-full px-4 py-2 font-mono text-sm transition ${
                          selectedStart?.iso === s.iso
                            ? "bg-[#191A23] text-white"
                            : "bg-[#B9FF66] text-[#191A23] hover:bg-[#aaf053]"
                        }`}
                      >
                        {s.local}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>

      {/* Step 3: confirm */}
      <section
        className={`rounded-[32px] border-2 bg-white p-7 shadow-[0_6px_0_0_#191A23] md:p-9 ${
          selectedStart ? "border-[#191A23]" : "border-[#191A23]/20 opacity-60"
        }`}
      >
        <StepBadge n={3} />
        <h2 className="mt-3 text-2xl font-medium">Review & confirm</h2>
        {!selectedStart ? (
          <p className="mt-3 text-sm text-[#191A23]/60">
            Pick a start time first.
          </p>
        ) : (
          <form action={formAction} className="mt-5 space-y-4">
            <input type="hidden" name="duration" value={duration} />
            <input type="hidden" name="start_at" value={selectedStart.iso} />

            <dl className="rounded-2xl bg-zinc-50 p-5 text-sm">
              <Row label="Date" value={selectedStart.iso ? formatReviewDate(selectedStart.iso) : ""} />
              <Row label="Time" value={`${selectedStart.local} (Toronto)`} />
              <Row label="Length" value={`${duration} minutes`} />
              <Row label="Where" value="Teacher's home (address in confirmation email)" />
              <Row label="Cancel by" value="24 hours before start" />
            </dl>

            {result && !result.ok && (
              <p
                role="alert"
                className="rounded-xl border-2 border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {result.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-2xl bg-[#191A23] px-5 py-4 text-[15px] font-medium text-white transition hover:bg-[#2a2b38] disabled:opacity-60"
            >
              {pending ? "Confirming…" : "Confirm booking"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-block rounded-full bg-[#B9FF66] px-3 py-0.5 text-xs font-semibold uppercase tracking-widest">
      Step {n}
    </span>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />
      <span>{label}</span>
    </span>
  );
}

type CalMonth = {
  key: string; // "YYYY-MM"
  label: string; // "April 2026"
  firstDow: number; // weekday of the 1st (0=Sun..6=Sat)
  daysInMonth: number;
  year: number;
  month: number; // 0-indexed
};

function CalendarGrid({
  days,
  selected,
  onSelect,
}: {
  days: DayWithStarts[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const byDate = new Map(days.map((d) => [d.date, d]));

  // Group days into months that we should render.
  const months = new Map<string, CalMonth>();
  for (const d of days) {
    const [y, m] = d.date.split("-").map(Number);
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!months.has(key)) {
      const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
      const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-CA", {
        timeZone: "UTC",
        month: "long",
        year: "numeric",
      });
      months.set(key, { key, label, firstDow, daysInMonth, year: y, month: m - 1 });
    }
  }

  const [activeKey, setActiveKey] = useState<string>(() => {
    const keys = Array.from(months.keys());
    return keys[0] ?? "";
  });
  const monthList = Array.from(months.values());
  const active = months.get(activeKey) ?? monthList[0];

  if (!active) return null;

  const cells: (DayWithStarts | { pad: true; key: string } | { empty: true; date: string })[] = [];
  for (let i = 0; i < active.firstDow; i++) {
    cells.push({ pad: true, key: `pad-${i}` });
  }
  for (let d = 1; d <= active.daysInMonth; d++) {
    const date = `${active.year}-${String(active.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const day = byDate.get(date);
    cells.push(day ?? { empty: true, date });
  }

  const activeIdx = monthList.findIndex((m) => m.key === active.key);
  const prev = monthList[activeIdx - 1];
  const next = monthList[activeIdx + 1];

  return (
    <div className="mt-5">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => prev && setActiveKey(prev.key)}
          disabled={!prev}
          className="rounded-full border-2 border-[#191A23] bg-white px-3 py-1 text-sm font-medium transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month"
        >
          ←
        </button>
        <p className="text-lg font-medium">{active.label}</p>
        <button
          type="button"
          onClick={() => next && setActiveKey(next.key)}
          disabled={!next}
          className="rounded-full border-2 border-[#191A23] bg-white px-3 py-1 text-sm font-medium transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday row */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-widest text-[#191A23]/50">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => {
          if ("pad" in c) return <div key={c.key} />;

          if ("empty" in c) {
            // Date outside our horizon
            return (
              <div
                key={c.date}
                className="aspect-square rounded-lg bg-zinc-100 text-center text-[#191A23]/30"
              >
                <span className="flex h-full items-center justify-center text-sm">
                  {Number(c.date.slice(-2))}
                </span>
              </div>
            );
          }

          const dayNum = Number(c.date.slice(-2));
          const isSelected = selected === c.date;
          const openCount = c.starts.length;
          const hasOpen = openCount > 0 && !c.blocked;
          const disabled = c.blocked || openCount === 0;

          const classes = c.blocked
            ? "bg-red-100 text-red-700"
            : hasOpen
            ? isSelected
              ? "bg-[#191A23] text-white"
              : "bg-[#B9FF66] text-[#191A23] hover:bg-[#aaf053]"
            : "bg-zinc-100 text-[#191A23]/30";

          return (
            <button
              key={c.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(c.date)}
              className={`group aspect-square rounded-lg p-1 text-center transition ${classes} ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-label={`${c.weekday} ${c.label}${hasOpen ? ` — ${openCount} open times` : ""}`}
            >
              <span className="flex h-full flex-col items-center justify-center">
                <span className="text-sm font-medium">{dayNum}</span>
                {hasOpen && !isSelected && (
                  <span className="text-[10px] opacity-70">
                    {openCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#191A23]/10 py-2 last:border-0 last:pb-0">
      <dt className="text-[#191A23]/60">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
