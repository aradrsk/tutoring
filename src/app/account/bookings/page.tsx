import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export default async function AccountBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { user } = session;
  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Dashboard nav */}
      <header className="border-b-2 border-[#191A23]/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="inline-block h-6 w-6 rounded-sm bg-[#191A23]" />
            tutor<span className="text-[#B9FF66]">.</span>
          </Link>
          <div className="flex items-center gap-3">
            {user.role === "teacher" && (
              <Link
                href="/dashboard/availability"
                className="rounded-2xl bg-[#B9FF66] px-4 py-2 text-sm font-medium text-[#191A23] hover:bg-white hover:ring-2 hover:ring-[#191A23]"
              >
                Manage availability
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
              ? "Teacher view."
              : "Your student dashboard."}
          </p>
        </div>

        {/* Top stats */}
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          <StatCard label="Upcoming sessions" value="0" accent="lime" />
          <StatCard label="Past sessions" value="0" accent="light" />
          <StatCard label="Account status" value={user.emailVerified ? "Verified" : "Active"} accent="dark" />
        </div>

        {/* Main area */}
        <section className="rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-2xl font-medium md:text-3xl">
              Your bookings
            </h2>
          </div>

          <div className="rounded-[28px] border-2 border-dashed border-[#191A23]/20 bg-zinc-50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#B9FF66]">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-xl font-medium">No sessions yet</h3>
            <p className="mt-2 text-sm text-[#191A23]/60">
              Booking flow lands in TU-8. For now, this is a preview of where your
              upcoming sessions will live.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/book"
                className="rounded-2xl bg-[#191A23] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2a2b38]"
              >
                Book a session
              </Link>
              <Link
                href="/updates"
                className="rounded-2xl border-2 border-[#191A23] bg-white px-6 py-3 text-sm font-medium transition hover:bg-zinc-50"
              >
                What&apos;s new
              </Link>
            </div>
          </div>
        </section>

        {/* Account details */}
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <DetailCard
            title="Account details"
            rows={[
              { label: "Name", value: user.name ?? "—" },
              { label: "Email", value: user.email },
              { label: "Age", value: user.age?.toString() ?? "—" },
              { label: "Role", value: user.role ?? "user" },
            ]}
          />
          <DetailCard
            title="What's next"
            rows={[
              { label: "TU-6", value: "Teacher availability editor" },
              { label: "TU-7", value: "Public availability calendar" },
              { label: "TU-8", value: "Booking flow + slot locking" },
              { label: "TU-9", value: "Email confirmations" },
            ]}
          />
        </section>
      </div>
    </main>
  );
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

function DetailCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-[32px] border-2 border-[#191A23] bg-white p-7 shadow-[0_6px_0_0_#191A23]">
      <h3 className="mb-5 inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-lg font-medium">
        {title}
      </h3>
      <dl className="space-y-3 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 border-b border-[#191A23]/10 pb-3 last:border-0 last:pb-0">
            <dt className="text-[#191A23]/60">{r.label}</dt>
            <dd className="font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
