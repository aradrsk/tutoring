import Link from "next/link";
import { headers } from "next/headers";
import { asc } from "drizzle-orm";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import {
  DOW_SHORT,
  iterateTorontoDays,
  torontoDow,
  torontoWallToUtc,
  TZ,
} from "@/lib/availability";

const LIME = "#B9FF66";
const INK = "#191A23";

export const dynamic = "force-dynamic";

type PublicDay = {
  date: string;
  dow: number;
  weekday: string;
  label: string;
  blocked: boolean;
  windows: { start: string; end: string }[];
};

async function loadPublicAvailability(): Promise<PublicDay[]> {
  const [rules, blocks] = await Promise.all([
    db
      .select()
      .from(schema.availabilityRules)
      .orderBy(asc(schema.availabilityRules.startTime)),
    db.select().from(schema.availabilityBlocks),
  ]);

  const activeRules = rules.filter((r) => r.active);
  const blockedSet = new Set(blocks.map((b) => b.date));

  const dates = iterateTorontoDays(new Date(), 30);
  return dates.map((date) => {
    const midday = torontoWallToUtc(date, "12:00");
    const dow = torontoDow(midday);
    const blocked = blockedSet.has(date);
    const windows = activeRules
      .filter((r) => r.dayOfWeek === dow)
      .map((r) => ({
        start: r.startTime.slice(0, 5),
        end: r.endTime.slice(0, 5),
      }));
    return {
      date,
      dow,
      weekday: DOW_SHORT[dow],
      label: new Date(`${date}T12:00:00Z`).toLocaleDateString("en-CA", {
        timeZone: TZ,
        month: "short",
        day: "numeric",
      }),
      blocked,
      windows,
    };
  });
}

function primaryCtaHref(session: {
  user: { emailVerified?: boolean };
} | null) {
  if (!session) return "/signup";
  return "/book";
}

export default async function Home() {
  const [session, days] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    loadPublicAvailability(),
  ]);

  const ctaHref = primaryCtaHref(session);
  const ctaLabel = session ? "Go to dashboard" : "Book a session";
  const hasAnyAvailability = days.some((d) => !d.blocked && d.windows.length > 0);

  return (
    <main className="min-h-screen bg-white text-[#191A23]">
      <SiteNav />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            1:1 English tutoring
            <br />
            built for{" "}
            <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
              K-12 students
            </span>
            .
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-[#191A23]/80">
            Pick a time, pay nothing, show up. In-person sessions in Toronto —
            30, 45, or 60 minutes. No DMs, just a confirmed slot in your
            calendar.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="rounded-2xl bg-[#191A23] px-8 py-4 text-[15px] font-medium text-white transition hover:bg-[#2a2b38]"
            >
              {ctaLabel}
            </Link>
            <Link
              href="#availability"
              className="rounded-2xl border-2 border-[#191A23] bg-white px-8 py-4 text-[15px] font-medium transition hover:bg-zinc-50"
            >
              See availability
            </Link>
          </div>
        </div>
        <div className="relative mx-auto h-[300px] w-full max-w-[500px] sm:h-[380px]">
          <HeroIllustration />
        </div>
      </section>

      {/* Availability preview */}
      <section id="availability" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-3xl font-medium md:text-4xl">
              Availability
            </h2>
            <p className="mt-3 max-w-md text-base text-[#191A23]/70">
              Next 30 days of open windows. All times in Toronto (ET). Pick a
              length during booking — 30, 45, or 60 minutes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Legend dot="bg-[#B9FF66]" label="Open" />
            <Legend dot="bg-red-300" label="Blocked" />
            <Legend dot="bg-zinc-200" label="No hours" />
          </div>
        </div>

        {!hasAnyAvailability ? (
          <div className="rounded-[32px] border-2 border-dashed border-[#191A23]/20 bg-zinc-50 p-10 text-center">
            <p className="text-lg font-medium">
              No availability published yet
            </p>
            <p className="mt-2 text-sm text-[#191A23]/60">
              The teacher hasn&apos;t set weekly windows. Check back shortly, or
              sign up now — you&apos;ll be first in line.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {days.slice(0, 15).map((d) => (
              <DayCard key={d.date} day={d} />
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <Link
            href={ctaHref}
            className="rounded-2xl bg-[#191A23] px-7 py-3.5 text-sm font-medium text-white hover:bg-[#2a2b38]"
          >
            {session ? "Pick a time" : "Sign up to book"} →
          </Link>
        </div>
      </section>

      {/* Sessions */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 flex flex-wrap items-end gap-5">
          <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-3xl font-medium md:text-4xl">
            Sessions
          </h2>
          <p className="max-w-md text-base text-[#191A23]/70">
            Pick the length that fits. Every session is 1:1, in-person, and
            focused on what the student actually needs that week.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ServiceCard
            title={["30", "minutes"]}
            variant="light"
            body="Quick homework help or exam prep review. Good for grades 3-6."
            illustration={<ThirtyIllustration />}
          />
          <ServiceCard
            title={["45", "minutes"]}
            variant="lime"
            body="Sweet spot. Reading, writing, and a worked example fit comfortably."
            illustration={<FortyFiveIllustration />}
          />
          <ServiceCard
            title={["60", "minutes"]}
            variant="dark"
            body="Deep session. Essay coaching, novel study, or standardized test prep."
            illustration={<SixtyIllustration />}
          />
          <ServiceCard
            title={["Free", "trial"]}
            variant="light"
            body="First session is on the house. Meet the teacher, no pressure."
            illustration={<FreeIllustration />}
          />
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col items-center gap-6 rounded-[40px] bg-zinc-100 p-10 md:flex-row md:justify-between md:gap-12 md:p-14">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-medium md:text-3xl">
              Let&apos;s get you a session.
            </h3>
            <p className="mt-3 max-w-md text-[#191A23]/70">
              Sign up takes under a minute. We&apos;ll send a confirmation email
              with the address once a time is booked.
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-2xl bg-[#191A23] px-7 py-4 text-[15px] font-medium text-white transition hover:bg-[#2a2b38]"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12 flex flex-wrap items-end gap-5">
          <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-3xl font-medium md:text-4xl">
            How it works
          </h2>
          <p className="max-w-md text-base text-[#191A23]/70">
            Three steps from Instagram bio to confirmed booking.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Step n="01" title="Sign up" body="Name, age, email, password. K-12 only. Takes a minute." />
          <Step n="02" title="Pick a slot" body="Choose 30, 45, or 60 minutes, then a time. Slot locks on confirm." />
          <Step n="03" title="Show up" body="You'll get an email with the teacher's address. That's it." />
        </div>
      </section>

      {/* Teacher profile */}
      <section id="about" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12 flex flex-wrap items-end gap-5">
          <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-3xl font-medium md:text-4xl">
            Your teacher
          </h2>
        </div>

        <div className="rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-12">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-[#B9FF66]">
              <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-[#191A23]">
                T
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest text-[#191A23]/50">
                Lead tutor
              </p>
              <h3 className="mt-1 text-3xl font-medium">Theepa Jeyapalan</h3>
              <p className="mt-4 max-w-xl text-[#191A23]/70">
                Patient, structured, and kid-friendly. Theepa helps students read
                with confidence, write with clarity, and actually enjoy the
                process. Focus areas: ESL, essay coaching, standardized test prep.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FactChip label="Availability" value="Mon-Fri" />
                <FactChip label="Format" value="In-person" />
                <FactChip label="Timezone" value="Toronto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12 flex flex-wrap items-end gap-5">
          <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-3xl font-medium md:text-4xl">
            Pricing
          </h2>
          <p className="max-w-md text-base text-[#191A23]/70">
            Prototype phase. Everything is free. Seriously.
          </p>
        </div>
        <div className="rounded-[40px] bg-[#191A23] p-10 text-white md:p-14">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-6xl font-medium md:text-7xl">
                $0<span className="text-[#B9FF66]">.</span>
              </p>
              <p className="mt-3 max-w-sm text-white/70">
                Free while we&apos;re in prototype. Payments land when the
                teacher starts charging — you&apos;ll know first.
              </p>
            </div>
            <Link
              href="/signup"
              className="rounded-2xl bg-[#B9FF66] px-7 py-4 text-[15px] font-medium text-[#191A23] transition hover:bg-white"
            >
              Claim a free session
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ========== Small building blocks ========== */

function ServiceCard({
  title,
  variant,
  body,
  illustration,
}: {
  title: [string, string];
  variant: "light" | "lime" | "dark";
  body: string;
  illustration: React.ReactNode;
}) {
  const styles = {
    light: "bg-zinc-100 text-[#191A23]",
    lime: "bg-[#B9FF66] text-[#191A23]",
    dark: "bg-[#191A23] text-white",
  }[variant];

  const pill = {
    light: "bg-[#B9FF66] text-[#191A23]",
    lime: "bg-white text-[#191A23]",
    dark: "bg-[#B9FF66] text-[#191A23]",
  }[variant];

  const arrowBg =
    variant === "dark" ? "bg-white text-[#191A23]" : "bg-[#191A23] text-white";

  return (
    <article
      className={`flex min-h-[260px] flex-col justify-between gap-4 rounded-[40px] p-8 shadow-[0_6px_0_0_#191A23] transition hover:-translate-y-0.5 md:flex-row md:p-10 ${styles}`}
    >
      <div className="flex flex-col gap-4">
        <h3 className="flex flex-col gap-1 text-3xl font-medium leading-tight">
          <span className={`inline-block w-fit rounded-md px-2 py-0.5 ${pill}`}>
            {title[0]}
          </span>
          <span className="pl-1">{title[1]}</span>
        </h3>
        <p className="max-w-xs text-sm opacity-80">{body}</p>
        <div className="mt-auto flex items-center gap-3 pt-3 text-sm font-medium">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ${arrowBg}`}
          >
            →
          </span>
          <span>Learn more</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-end justify-end">{illustration}</div>
    </article>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
      <div
        className="mb-5 text-5xl font-medium text-[#B9FF66]"
        style={{
          WebkitTextStroke: "1px #191A23",
        }}
      >
        {n}
      </div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="text-[#191A23]/70">{body}</p>
    </div>
  );
}

function FactChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-100 px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-[#191A23]/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className="text-[#191A23]/70">{label}</span>
    </span>
  );
}

function DayCard({ day }: { day: PublicDay }) {
  const openCount = day.windows.length;
  const hasWindows = openCount > 0 && !day.blocked;
  const style = day.blocked
    ? "border-red-300 bg-red-50"
    : hasWindows
    ? "border-[#191A23] bg-white"
    : "border-[#191A23]/10 bg-zinc-50 opacity-70";
  return (
    <div className={`rounded-2xl border-2 p-4 ${style}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#191A23]/60">
          {day.weekday}
        </span>
        <span className="font-mono text-xs text-[#191A23]/50">{day.label}</span>
      </div>
      {day.blocked ? (
        <p className="text-xs font-medium text-red-700">Blocked</p>
      ) : openCount === 0 ? (
        <p className="text-xs text-[#191A23]/40">—</p>
      ) : (
        <ul className="space-y-1">
          {day.windows.map((w, i) => (
            <li
              key={i}
              className="rounded-full bg-[#B9FF66] px-2.5 py-0.5 font-mono text-[11px] text-[#191A23]"
            >
              {w.start}–{w.end}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ========== Illustrations (inline SVG) ========== */

function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 380" className="h-full w-full" aria-hidden>
      <ellipse cx="250" cy="200" rx="180" ry="60" stroke={INK} strokeWidth="1.5" fill="none" />
      <ellipse cx="250" cy="200" rx="210" ry="30" stroke={INK} strokeWidth="1.5" fill="none" />
      <g transform="translate(160,140)">
        <path
          d="M0 60 L110 20 L200 0 L200 120 L110 100 L0 80 Z"
          fill="white"
          stroke={INK}
          strokeWidth="2"
        />
        <path
          d="M0 60 L110 20 L110 100 L0 80 Z"
          fill={LIME}
          stroke={INK}
          strokeWidth="2"
        />
        <circle cx="55" cy="70" r="8" fill={INK} />
      </g>
      <g>
        <circle cx="80" cy="120" r="16" fill={INK} />
        <text x="80" y="126" textAnchor="middle" fontSize="18" fill={LIME}>★</text>
      </g>
      <g>
        <circle cx="430" cy="90" r="18" fill={LIME} stroke={INK} strokeWidth="2" />
        <text x="430" y="98" textAnchor="middle" fontSize="20" fill={INK}>♥</text>
      </g>
      <g>
        <circle cx="420" cy="280" r="16" fill={INK} />
        <text x="420" y="286" textAnchor="middle" fontSize="16" fill={LIME}>✓</text>
      </g>
      <Sparkle cx={60} cy={260} fill={INK} />
      <Sparkle cx={470} cy={180} fill={LIME} stroke={INK} />
      <Sparkle cx={250} cy={360} fill={INK} />
    </svg>
  );
}

function Sparkle({
  cx,
  cy,
  fill = INK,
  stroke,
}: {
  cx: number;
  cy: number;
  fill?: string;
  stroke?: string;
}) {
  return (
    <path
      d={`M${cx} ${cy - 12} L${cx + 4} ${cy - 4} L${cx + 12} ${cy} L${cx + 4} ${cy + 4} L${cx} ${cy + 12} L${cx - 4} ${cy + 4} L${cx - 12} ${cy} L${cx - 4} ${cy - 4} Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 1.5 : 0}
    />
  );
}

function ThirtyIllustration() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-36" aria-hidden>
      <circle cx="70" cy="60" r="44" fill="white" stroke={INK} strokeWidth="2" />
      <path
        d="M70 30 V60 L92 74"
        stroke={INK}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="70" cy="60" r="3" fill={INK} />
      <Sparkle cx={20} cy={30} fill={LIME} stroke={INK} />
      <Sparkle cx={120} cy={100} fill={INK} />
    </svg>
  );
}

function FortyFiveIllustration() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-36" aria-hidden>
      <rect x="20" y="30" width="60" height="70" rx="4" fill="white" stroke={INK} strokeWidth="2" />
      <line x1="30" y1="46" x2="70" y2="46" stroke={INK} strokeWidth="2" />
      <line x1="30" y1="56" x2="65" y2="56" stroke={INK} strokeWidth="2" />
      <line x1="30" y1="66" x2="70" y2="66" stroke={INK} strokeWidth="2" />
      <line x1="30" y1="76" x2="55" y2="76" stroke={INK} strokeWidth="2" />
      <circle cx="100" cy="40" r="18" fill={INK} />
      <path
        d="M93 40 L98 45 L108 35"
        stroke={LIME}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Sparkle cx={115} cy={90} fill={INK} />
    </svg>
  );
}

function SixtyIllustration() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-36" aria-hidden>
      <rect
        x="22"
        y="26"
        width="72"
        height="56"
        rx="4"
        fill={LIME}
        stroke="white"
        strokeWidth="2"
      />
      <line x1="30" y1="40" x2="86" y2="40" stroke="white" strokeWidth="2" />
      <line x1="30" y1="50" x2="80" y2="50" stroke="white" strokeWidth="2" />
      <line x1="30" y1="60" x2="76" y2="60" stroke="white" strokeWidth="2" />
      <line x1="30" y1="70" x2="72" y2="70" stroke="white" strokeWidth="2" />
      <circle cx="110" cy="92" r="14" fill="white" />
      <path
        d="M103 92 L108 97 L118 85"
        stroke={INK}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FreeIllustration() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-36" aria-hidden>
      <rect x="30" y="42" width="80" height="60" rx="6" fill="white" stroke={INK} strokeWidth="2" />
      <path d="M30 50 L70 78 L110 50" stroke={INK} strokeWidth="2" fill="none" />
      <rect x="55" y="20" width="30" height="30" rx="4" fill={LIME} stroke={INK} strokeWidth="2" />
      <text x="70" y="40" textAnchor="middle" fontSize="16" fontWeight="bold" fill={INK}>
        0$
      </text>
      <Sparkle cx={120} cy={30} fill={INK} />
    </svg>
  );
}
