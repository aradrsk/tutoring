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

      {/* Step 2: start time */}
      <section className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23] md:p-9">
        <StepBadge n={2} />
        <h2 className="mt-3 text-2xl font-medium">Start time</h2>
        <p className="mt-1 text-sm text-[#191A23]/60">
          Next 30 days. All times in Toronto (ET).
        </p>

        {days.filter((d) => d.starts.length > 0).length === 0 ? (
          <p className="mt-5 rounded-2xl bg-zinc-50 p-5 text-sm text-[#191A23]/70">
            No available start times at {duration} min. Try a shorter length.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {days.map((day) => (
              <li
                key={day.date}
                className={`rounded-2xl border-2 p-4 ${
                  day.blocked
                    ? "border-red-300 bg-red-50"
                    : "border-[#191A23]/15 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">
                    {day.weekday} · {day.label}
                  </span>
                  <span className="font-mono text-xs text-[#191A23]/50">
                    {day.date}
                  </span>
                </div>
                {day.blocked ? (
                  <p className="text-xs text-red-700">Blocked</p>
                ) : day.starts.length === 0 ? (
                  <p className="text-xs text-[#191A23]/40">No starts</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {day.starts.map((s) => (
                      <button
                        key={s.iso}
                        type="button"
                        onClick={() => setSelectedStart(s)}
                        className={`rounded-full px-3 py-1 font-mono text-xs transition ${
                          selectedStart?.iso === s.iso
                            ? "bg-[#191A23] text-white"
                            : "bg-[#B9FF66] text-[#191A23] hover:bg-[#aaf053]"
                        }`}
                      >
                        {s.local}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
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
