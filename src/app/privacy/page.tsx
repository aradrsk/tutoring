import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal information tutor. collects, how we use it, and how long we keep it.",
};

const UPDATED = "April 18, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteNav />
      <article className="mx-auto max-w-3xl px-6 pt-10 pb-16 md:pt-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
          Last updated · {UPDATED}
        </p>
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Privacy{" "}
          <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
            policy
          </span>
          .
        </h1>

        <Prose>
          <p>
            This is a small tutoring-scheduling app operated by Arad Raeisi
            (aradrsk) for a single independent English tutor in Toronto,
            Ontario. This page explains what personal information we collect,
            how we use it, and how to reach us if you have questions.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Account info</strong>: your name, age (we tutor K-12 so
              age is between 5 and 18), email address, and a password hash. If
              you sign in with Google we also receive your Google profile name
              and photo.
            </li>
            <li>
              <strong>Booking info</strong>: the sessions you book — date,
              time, duration, and status (confirmed or cancelled).
            </li>
            <li>
              <strong>Technical info</strong>: normal server logs (IP address,
              browser type, timestamps) collected by our hosting provider for
              security and reliability.
            </li>
          </ul>

          <h2>What we don&apos;t collect</h2>
          <ul>
            <li>No payment information — sessions are currently free.</li>
            <li>No analytics pixels, no ad trackers, no third-party embeds.</li>
            <li>
              No precise location data beyond what&apos;s inferred from your IP.
            </li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To let you sign in, book sessions, and cancel them.</li>
            <li>
              To send you transactional emails about bookings (confirmation,
              cancellation).
            </li>
            <li>To prevent abuse (rate-limiting, blocking suspicious activity).</li>
          </ul>
          <p>We do not sell your data, ever.</p>

          <h2>Who sees it</h2>
          <ul>
            <li>
              <strong>The teacher</strong> sees the name, age, email, and
              booking history of anyone who books with her.
            </li>
            <li>
              <strong>Our infrastructure providers</strong> process your data
              on our behalf: Firebase (authentication), Neon (Postgres
              database), Vercel (hosting), Resend (email), Cloudflare (DNS).
              Each has its own privacy policy.
            </li>
          </ul>

          <h2>How long we keep it</h2>
          <p>
            Account and booking records are kept as long as your account is
            open. You can ask us to delete your account at any time by emailing{" "}
            <a href="mailto:aradrsk@gmail.com">aradrsk@gmail.com</a> and we
            will remove your account and bookings within 30 days.
          </p>

          <h2>Children under 13</h2>
          <p>
            Because the service is designed for K-12 students (ages 5-18), we
            ask a parent or guardian to create and manage the account for any
            child under 13. If you are under 13 and have created an account
            without parental consent, email us and we will remove the account.
          </p>

          <h2>Security</h2>
          <p>
            Passwords are hashed by Firebase; they never reach our database in
            plain text. All traffic is over HTTPS. Database connections use
            TLS. No system is perfect — if something changes we&apos;ll update
            this page.
          </p>

          <h2>Changes</h2>
          <p>
            If we materially change what we collect or how we use it, we will
            update this page and change the &quot;Last updated&quot; date at the
            top. Continuing to use the service after a change means you accept
            the update.
          </p>

          <h2>Contact</h2>
          <p>
            Questions, data requests, or complaints:{" "}
            <a href="mailto:aradrsk@gmail.com">aradrsk@gmail.com</a>.
          </p>

          <p className="text-sm text-[#191A23]/60">
            This policy is written in plain language for a small prototype. It
            is not legal advice; if you are using this project as a template
            for a commercial service, get real legal review.
          </p>
        </Prose>
      </article>
      <SiteFooter />
    </main>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-zinc mt-8 max-w-none space-y-5 text-[15px] leading-relaxed text-[#191A23]/85 [&_a]:text-[#191A23] [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-[#191A23] [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
      {children}
    </div>
  );
}
