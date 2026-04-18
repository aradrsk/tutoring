import "server-only";
import { db, schema } from "@/lib/db";
import { eq, and, gte, lte, ne } from "drizzle-orm";

// America/Toronto fixed timezone per PRD.
export const TZ = "America/Toronto";
export const SLOT_GRANULARITY_MIN = 15;
export const MIN_LEAD_MIN = 60; // no booking less than 1h out
export const DEFAULT_HORIZON_DAYS = 30;

export type Duration = 30 | 45 | 60;

export type AvailabilityRule = typeof schema.availabilityRules.$inferSelect;
export type AvailabilityBlock = typeof schema.availabilityBlocks.$inferSelect;
export type Booking = typeof schema.bookings.$inferSelect;

/**
 * Convert a calendar date + "HH:MM" local time (America/Toronto) to a UTC Date.
 * We stamp the instant in Toronto's current offset — DST-correct because we
 * compute the offset by asking Intl what the offset is on that calendar date.
 */
export function torontoWallToUtc(dateYmd: string, timeHm: string): Date {
  const [hh, mm] = timeHm.split(":").map(Number);
  // Build an ISO string like "2026-04-21T16:30:00" and ask Intl what the
  // Toronto offset is at that instant.
  const noTzIso = `${dateYmd}T${hh.toString().padStart(2, "0")}:${mm
    .toString()
    .padStart(2, "0")}:00`;
  // Start from a UTC interpretation; adjust by offset diff.
  const asUtc = new Date(`${noTzIso}Z`);
  const torontoParts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(asUtc);
  const get = (t: string) =>
    Number(torontoParts.find((p) => p.type === t)?.value ?? 0);
  const tY = get("year");
  const tMo = get("month");
  const tD = get("day");
  const tH = get("hour") === 24 ? 0 : get("hour");
  const tMi = get("minute");
  const tS = get("second");
  // Difference between what "UTC time" Toronto shows vs the wall time we wanted
  const torontoAsIfUtcMs = Date.UTC(tY, tMo - 1, tD, tH, tMi, tS);
  const drift = torontoAsIfUtcMs - asUtc.getTime();
  return new Date(asUtc.getTime() - drift);
}

/**
 * Toronto-local calendar date (YYYY-MM-DD) for a given instant.
 */
export function torontoDateYmd(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${day}`;
}

/**
 * Toronto-local day-of-week (0=Sun..6=Sat) for a given instant.
 */
export function torontoDow(d: Date): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

/**
 * Iterate Toronto-local calendar dates from `from` through `from + days - 1`.
 */
export function iterateTorontoDays(from: Date, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    out.push(torontoDateYmd(d));
  }
  return out;
}

/** Round a Date up to the next 15-minute boundary (UTC epoch math). */
export function ceilToGrid(d: Date, minutes = SLOT_GRANULARITY_MIN): Date {
  const ms = d.getTime();
  const step = minutes * 60 * 1000;
  return new Date(Math.ceil(ms / step) * step);
}

export type DaySlots = {
  date: string; // YYYY-MM-DD (Toronto)
  starts: Date[]; // valid UTC start times
};

export type SlotPlan = {
  horizonDays: number;
  duration: Duration;
  days: DaySlots[];
  blockedDates: Set<string>;
};

/**
 * Generate valid start times across a horizon for a given duration.
 * Returns one entry per calendar date in the horizon, even empty ones.
 */
export function generateSlots(input: {
  rules: AvailabilityRule[];
  blocks: AvailabilityBlock[];
  confirmed: Pick<Booking, "startAt" | "durationMinutes">[];
  duration: Duration;
  now?: Date;
  horizonDays?: number;
}): SlotPlan {
  const {
    rules,
    blocks,
    confirmed,
    duration,
    now = new Date(),
    horizonDays = DEFAULT_HORIZON_DAYS,
  } = input;

  const activeRules = rules.filter((r) => r.active);
  const blockedDates = new Set(blocks.map((b) => b.date));
  const cutoff = new Date(now.getTime() + MIN_LEAD_MIN * 60 * 1000);

  const days: DaySlots[] = [];

  for (const ymd of iterateTorontoDays(now, horizonDays)) {
    if (blockedDates.has(ymd)) {
      days.push({ date: ymd, starts: [] });
      continue;
    }
    // Rules matching this day-of-week
    const dowForDate = (() => {
      // Build a noon-local time on that date just to read the weekday.
      const midday = torontoWallToUtc(ymd, "12:00");
      return torontoDow(midday);
    })();
    const dayRules = activeRules.filter((r) => r.dayOfWeek === dowForDate);
    if (dayRules.length === 0) {
      days.push({ date: ymd, starts: [] });
      continue;
    }

    const starts: Date[] = [];
    for (const rule of dayRules) {
      const winStart = torontoWallToUtc(ymd, rule.startTime.slice(0, 5));
      const winEnd = torontoWallToUtc(ymd, rule.endTime.slice(0, 5));

      // Walk the 15-min grid from winStart; each candidate start s must satisfy:
      //   s + duration <= winEnd
      //   s >= cutoff
      //   [s, s + duration) does not overlap any confirmed booking
      let cursor = ceilToGrid(winStart);
      while (cursor.getTime() + duration * 60 * 1000 <= winEnd.getTime()) {
        if (cursor.getTime() >= cutoff.getTime()) {
          const candidateEnd = new Date(cursor.getTime() + duration * 60 * 1000);
          const overlaps = confirmed.some((b) => {
            const bStart = new Date(b.startAt).getTime();
            const bEnd = bStart + b.durationMinutes * 60 * 1000;
            return cursor.getTime() < bEnd && candidateEnd.getTime() > bStart;
          });
          if (!overlaps) starts.push(new Date(cursor));
        }
        cursor = new Date(cursor.getTime() + SLOT_GRANULARITY_MIN * 60 * 1000);
      }
    }

    starts.sort((a, b) => a.getTime() - b.getTime());
    days.push({ date: ymd, starts });
  }

  return { horizonDays, duration, days, blockedDates };
}

/** Fetch all inputs needed for slot generation. */
export async function loadAvailabilityInputs(options?: {
  excludeBookingId?: string;
}) {
  const rules = await db
    .select()
    .from(schema.availabilityRules)
    .where(eq(schema.availabilityRules.active, true));

  const blocks = await db.select().from(schema.availabilityBlocks);

  const nowIso = new Date();
  const horizonEnd = new Date(
    nowIso.getTime() + DEFAULT_HORIZON_DAYS * 24 * 60 * 60 * 1000
  );

  const confirmedWhere = options?.excludeBookingId
    ? and(
        eq(schema.bookings.status, "confirmed"),
        gte(schema.bookings.startAt, nowIso),
        lte(schema.bookings.startAt, horizonEnd),
        ne(schema.bookings.id, options.excludeBookingId)
      )
    : and(
        eq(schema.bookings.status, "confirmed"),
        gte(schema.bookings.startAt, nowIso),
        lte(schema.bookings.startAt, horizonEnd)
      );

  const confirmed = await db
    .select({
      startAt: schema.bookings.startAt,
      durationMinutes: schema.bookings.durationMinutes,
    })
    .from(schema.bookings)
    .where(confirmedWhere);

  return { rules, blocks, confirmed };
}

export const DOW_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
