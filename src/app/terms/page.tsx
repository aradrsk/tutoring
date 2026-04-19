import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using tutor.",
};

const UPDATED = "April 18, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteNav />
      <article className="mx-auto max-w-3xl px-6 pt-10 pb-16 md:pt-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
          Last updated · {UPDATED}
        </p>
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Terms of{" "}
          <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
            service
          </span>
          .
        </h1>

        <Prose>
          <p>
            These are the rules for using tutor., a booking site for 1:1
            in-person English tutoring in Toronto, operated by Arad Raeisi
            (aradrsk). By creating an account or booking a session you agree
            to them. If you don&apos;t, please don&apos;t use the site.
          </p>

          <h2>Who can use it</h2>
          <ul>
            <li>
              Intended for K-12 students (ages 5-18). If the student is under
              13, a parent or guardian must create and manage the account.
            </li>
            <li>
              One account per person. Don&apos;t share logins or make accounts
              on behalf of others without their consent.
            </li>
            <li>
              Give accurate information (real name, real age, working email).
              We may cancel bookings or accounts made with fake info.
            </li>
          </ul>

          <h2>Booking and cancellation</h2>
          <ul>
            <li>
              Sessions are scheduled 1:1 and in-person at the teacher&apos;s
              address in Toronto (shown in your confirmation email).
            </li>
            <li>
              Sessions are currently free while we&apos;re in prototype. If we
              start charging in the future, you&apos;ll be told before it
              applies to you.
            </li>
            <li>
              You can cancel a booking up to 12 hours before the start time,
              from your dashboard. Inside 12 hours, cancellation requires
              contacting the teacher directly.
            </li>
            <li>
              If you cancel a paid booking 12+ hours before the start time, you
              get a full refund back to the original card — usually lands in
              5–10 business days via Stripe.
            </li>
            <li>
              The teacher can cancel any session at any time (emergencies
              happen). You&apos;ll be notified by email and can rebook.
            </li>
            <li>
              Repeated no-shows or last-minute cancellations may result in
              your account being suspended.
            </li>
          </ul>

          <h2>Behavior</h2>
          <ul>
            <li>Be respectful to the teacher. Rude, abusive, or threatening behavior ends your use of the service.</li>
            <li>Don&apos;t attempt to attack, probe, or break the site — see it as you&apos;d see any small teacher-run business.</li>
            <li>Don&apos;t upload, share, or cause us to process any content that isn&apos;t yours or isn&apos;t lawful.</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            How we handle your data is covered in our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms as the service grows. Material changes
            will bump the &quot;Last updated&quot; date above. Continuing to use
            the service after a change means you accept it.
          </p>

          <h2>No warranty</h2>
          <p>
            This is a prototype. We provide the service as-is, without
            warranties. We&apos;ll do our best to keep it running, but we
            don&apos;t guarantee it will always be available or bug-free.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the extent allowed by law, Arad Raeisi and the teacher are not
            liable for indirect or consequential damages arising from use of
            the service. If a court finds us liable anyway, total liability is
            limited to the amount you paid us in the past 12 months (which,
            while we&apos;re in prototype, is zero).
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of Ontario, Canada. Disputes
            go to the courts in Toronto.
          </p>

          <h2>Contact</h2>
          <p>
            Questions or complaints:{" "}
            <a href="mailto:aradrsk@gmail.com">aradrsk@gmail.com</a>.
          </p>

          <p className="text-sm text-[#191A23]/60">
            These terms are written in plain language for a small prototype.
            They are not legal advice; if you&apos;re using this project as a
            template for a commercial service, get real legal review.
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
