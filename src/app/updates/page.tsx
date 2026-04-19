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
    date: "2026-04-19",
    tag: "fix",
    title: "Cancellation window: 24h → 12h",
    body: [
      "You can now cancel a booking up to 12 hours before the start time (down from 24). Dashboard, signup copy, terms, booking review, and confirmation email all updated.",
      "The Resend-hosted email template still needs a matching edit in the Resend UI (we can only change template copy there, not in code).",
    ],
  },
  {
    date: "2026-04-19",
    tag: "shipped",
    title: "Stripe payments + first session free",
    body: [
      "Every account gets one free session to start. After that, sessions are paid: 30 min / 45 min / 60 min priced in CAD, configurable via env.",
      "Paid bookings now redirect through Stripe Checkout. The slot is locked when you click confirm (via the Postgres exclusion constraint), held for 30 min while you finish checkout, and released if you abandon.",
      "After payment, Stripe sends you back to /book/success which verifies the session with Stripe, marks the booking paid, and fires the confirmation email.",
      "Cancelling a booking — even a paid one — resets you to the free tier. Next booking is on the house again. Deliberate: we want you to actually show up, not get stuck.",
      "Dashboard now shows a payment status pill on every booking: Free, Paid, Payment pending.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "design",
    title: "Brand mark lands on every page",
    body: [
      "Replaced the plain ink squares in the nav, footer, and every page header with the actual tutor. brand mark — a lime T with a period, on an ink rounded-square background.",
      "Same mark is now the browser favicon and the iOS home-screen icon.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Post-Google-signup profile step",
    body: [
      "Google sign-in doesn't give us age (Google won't share it) — so after Google signup you land on /get-started to fill in age (5–18) and confirm your name.",
      "Returning users skip the page automatically; the route bounces straight to the dashboard if the profile is already complete.",
      "Trying to hit /book without a complete profile now redirects back to finish it. Age is required for picking the right material.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Privacy policy + terms of service",
    body: [
      "Added /privacy and /terms pages written in plain language — what we collect, how long we keep it, cancellation rules, contact.",
      "Covers K-12 specifics: parental guidance for under-13 accounts, account deletion on request.",
      "Linked from the footer. Firebase OAuth consent can now point at these URLs for the 'App privacy policy' and 'App terms' links.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "fix",
    title: "Human-readable auth errors",
    body: [
      "Raw Firebase errors like 'auth/popup-closed-by-user' are now translated into plain English on the signup and login pages.",
      "Cancelling the Google popup is silent (no red error splashed across the form). Wrong password, network errors, blocked popups, and similar all have friendly messages.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "infra",
    title: "Auth swapped from better-auth to Firebase",
    body: [
      "Email + password and Google sign-in both go through Firebase now.",
      "Firebase owns identity (password hashing, OAuth, email verification); our database keeps the app-specific bits — role, age, and booking relationships keyed by Firebase UID.",
      "Session is a signed httpOnly cookie created from a verified Firebase ID token. No more custom session table.",
      "Anyone who made a test account earlier will need to sign up again — the user table was reset during the migration.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "infra",
    title: "Email design now lives in Resend",
    body: [
      "Booking confirmation emails are now sent via a Resend-hosted template (alias: session-confirmation).",
      "Design edits happen in Resend's UI — no redeploy needed for copy or layout tweaks.",
      "Server sends only the eight variables the template expects: student_name, teacher_name, date_label, time_label, duration_minutes, address, cancel_url, site_url.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Booking confirmation emails via Resend",
    body: [
      "Every confirmed booking now fires a branded HTML email: session time, duration, where, and a link back to the dashboard.",
      "Lime-and-ink system carried over into the email so the brand stays consistent. Table-based layout with inline styles, renders everywhere from Gmail to Outlook.",
      "Fire-and-forget: if the email fails to send, the booking still succeeds. The DB is the source of truth, not the email.",
      "While the custom sending domain (mail.tutoring.aradrsk.com) verifies with DNS, we're sending from Resend's shared onboarding@resend.dev. Flip the EMAIL_FROM env once verification completes.",
      "Preview the template live at /dev/email/booking.",
    ],
  },
  {
    date: "2026-04-18",
    tag: "shipped",
    title: "Dashboard shows your real bookings",
    body: [
      "The /account/bookings page now reads from the database instead of showing a placeholder.",
      "Upcoming sessions appear in a chunky card list with date, time, and duration. Past sessions collapse into a muted list below.",
      "Students can cancel upcoming sessions more than 24 hours out. Closer than that, the cancel button is hidden and a note explains why. Teachers can cancel any session (emergencies happen).",
      "Teachers see every confirmed booking with the student's name and email, not just their own.",
    ],
  },
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
