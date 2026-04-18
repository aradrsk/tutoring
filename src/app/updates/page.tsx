import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "What's shipping on tutor. — a running changelog of what's new, what's next, and what's fixed.",
};

type Update = {
  date: string;
  tag: "shipped" | "infra" | "fix" | "design" | "wip";
  title: string;
  body: string[];
};

const UPDATES: Update[] = [
  {
    date: "2026-04-18",
    tag: "design",
    title: "Booking step 2 is now a calendar",
    body: [
      "The long vertical list of days in the booking wizard is gone.",
      "New month-calendar grid: green = open (shows how many start times), grey = no availability, red = blocked.",
      "Tap a date → open times appear in a panel below. Much faster than scrolling a list.",
      "Works across month boundaries with prev/next arrows when the 30-day horizon crosses a month.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "design",
    title: "Teacher has a name: Theepa Jeyapalan",
    body: [
      "The landing page 'Your teacher' card now reads Theepa Jeyapalan. Bio copy updated too.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Booking flow is live",
    body: [
      "The /book route is a three-step wizard: pick length (30/45/60), pick a start time, review & confirm.",
      "The server double-checks every booking against live availability before inserting, and catches the Postgres exclusion-violation cleanly when two people try to grab the same slot.",
      "Dashboard empty-state now points straight to /book.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Teacher availability editor + public preview",
    body: [
      "Teachers now have /dashboard/availability: add weekly windows, block specific dates, and a 14-day preview that overlays 30/45/60-minute valid start times.",
      "Landing page shows real availability for the next 15 days, with a green/grey/red legend. No more fake placeholder school logos.",
      "The whole slot-generation engine is shared across teacher preview, landing page, and booking — so all three stay in sync automatically.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "design",
    title: "Full UX rehaul + /updates page",
    body: [
      "Introduced a shared Nav + Footer across every page — logged-in users now see a Dashboard link, logged-out users see Log in + Book a session.",
      "Redesigned /signup and /login in the lime + ink system: chunky card, inline hints, proper error states, a value-prop list on signup.",
      "Dashboard at /account/bookings got stat cards, an empty-state with clear next steps, and an account-details card that reads live from the session.",
      "This /updates page is new. You're reading it.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Live at tutoring.aradrsk.com",
    body: [
      "Deployed to Vercel production with a custom domain.",
      "Cloudflare DNS A record → Vercel edge. SSL auto-provisioned.",
      "Environment variables moved out of local dev; production now reads DATABASE_URL, BETTER_AUTH_SECRET, and the site URLs from Vercel.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "infra",
    title: "Migrated to Neon Postgres",
    body: [
      "Swapped local SQLite for Neon serverless Postgres so the app works on Vercel's ephemeral filesystem.",
      "Schema ported to pg-core with real enums (user_role, booking_status), timestamptz, checks, and proper indexes.",
      "Bookings overlap exclusion constraint restored via btree_gist + a trigger-maintained end_at column — prevents a 30-min booking at 4:30 pm from colliding with a 60-min booking at 4 pm at the DB layer.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "design",
    title: "Landing page redesign",
    body: [
      "New visual system: lime #B9FF66 + ink #191A23 on white.",
      "Chunky rounded cards with offset drop-shadows, section headers in lime pills, inline SVG illustrations for sessions and the hero.",
      "Added a 4-card sessions grid (30 / 45 / 60 / free trial), 3-step how-it-works, a teacher profile card, and a dark pricing panel.",
    ],
  },
  {
    date: "2026-04-17",
    tag: "shipped",
    title: "Auth + schema for signup / login / verify flow",
    body: [
      "Users can create accounts with name, age, email, and password.",
      "Session cookies via better-auth. Dashboard redirects unauthenticated visitors to /login.",
      "Email verification is currently off in dev; it comes back on when Resend is wired in TU-9.",
    ],
  },
  {
    date: "2026-04-17",
    tag: "infra",
    title: "Project scaffold",
    body: [
      "Next.js 16 (App Router, Turbopack) on React 19, TypeScript 5, Tailwind 4, ESLint 9.",
      "drizzle-orm + drizzle-kit for schema and migrations.",
      "better-auth with a drizzle adapter. Pushed to github.com/aradrsk/tutoring.",
    ],
  },
  {
    date: "2026-04-17",
    tag: "shipped",
    title: "PRD v1 locked",
    body: [
      "Resolved the five open product questions: public landing as home, teacher's home as fixed session location, configurable 30 / 45 / 60 min sessions, 24-hour cancellation window, and Vercel subdomain for v1 (later upgraded to tutoring.aradrsk.com).",
      "Everything else in the PRD is downstream of those five decisions.",
    ],
  },
];

const ROADMAP = [
  { id: "TU-6", title: "Teacher sets weekly availability + date blocks", status: "Next up" },
  { id: "TU-7", title: "Public landing page with visible availability", status: "Planned" },
  { id: "TU-8", title: "Users can book a session with slot locking", status: "Planned" },
  { id: "TU-9", title: "Email confirmations via Resend", status: "Planned" },
  { id: "TU-10", title: "Teacher dashboard", status: "Planned" },
  { id: "TU-11", title: "User dashboard with cancel", status: "Planned" },
  { id: "TU-12", title: "Deploy to prod + onboard teacher", status: "Partial (prod live)" },
];

export default function UpdatesPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteNav />

      {/* Header */}
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-12 md:pt-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
          Changelog
        </p>
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          What&apos;s{" "}
          <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
            new
          </span>
          .
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#191A23]/70">
          Everything that&apos;s shipped on tutor., in reverse chronological order.
          Expect this page to grow as we get closer to launch.
        </p>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <ol className="space-y-6">
          {UPDATES.map((u, i) => (
            <UpdateCard key={i} update={u} />
          ))}
        </ol>
      </section>

      {/* Roadmap */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-[40px] bg-[#191A23] p-10 text-white md:p-14">
          <h2 className="mb-6 inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-2xl font-medium text-[#191A23] md:text-3xl">
            What&apos;s next
          </h2>
          <p className="mb-8 max-w-xl text-white/70">
            The remaining MVP backlog. Each row is a tracked issue; order is the
            critical path to launch.
          </p>
          <ul className="divide-y divide-white/10">
            {ROADMAP.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#B9FF66]">
                    {r.id}
                  </p>
                  <p className="mt-1 text-[15px]">{r.title}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function UpdateCard({ update }: { update: Update }) {
  const tagStyles = {
    shipped: "bg-[#B9FF66] text-[#191A23]",
    infra: "bg-[#191A23] text-white",
    fix: "bg-amber-300 text-[#191A23]",
    design: "bg-zinc-200 text-[#191A23]",
    wip: "bg-white text-[#191A23] border-2 border-[#191A23]",
  }[update.tag];

  return (
    <li className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23] md:p-9">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <time className="text-sm font-mono text-[#191A23]/60">{update.date}</time>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-widest ${tagStyles}`}
        >
          {update.tag}
        </span>
      </div>
      <h3 className="text-2xl font-medium tracking-tight">{update.title}</h3>
      <ul className="mt-4 space-y-2 text-[15px] text-[#191A23]/80">
        {update.body.map((line, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-2.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B9FF66]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
