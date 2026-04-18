import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-500/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl dark:bg-amber-500/10" />

      <nav className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">
          🎓 tutor<span className="text-rose-500">.</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-14 px-6 pt-12 pb-24 sm:pt-20 lg:flex-row lg:items-start lg:gap-20 lg:pt-24">
        {/* left — hero copy */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-3 py-1 text-xs font-medium text-rose-700 shadow-sm backdrop-blur dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Now accepting bookings
          </span>

          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-white">
            1:1 English tutoring,
            <br className="hidden sm:block" /> built for{" "}
            <span className="relative inline-block">
              <span className="relative z-10">K-12 students</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-amber-300/70 dark:bg-amber-500/30" />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pick a time, pay nothing, show up. In-person sessions in Toronto —
            30, 45, or 60 minutes. No DMs, no back-and-forth, just a confirmed
            slot in your calendar.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Book a session
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white/70 px-7 text-sm font-medium text-zinc-800 backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              How it works
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-6 text-center lg:text-left">
            <Stat label="Session lengths" value="30 / 45 / 60" suffix="min" />
            <Stat label="Format" value="In-person" />
            <Stat label="Location" value="Toronto" />
          </dl>
        </div>

        {/* right — teacher card */}
        <div className="relative w-full max-w-sm">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-rose-200/70 via-amber-200/70 to-rose-300/60 blur-xl dark:from-rose-500/20 dark:via-amber-500/20 dark:to-rose-500/20" />
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-amber-300 text-2xl font-semibold text-white shadow-md">
                T
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Your Teacher
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  English · K-12 · ESL & essay coaching
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Patient, structured, and kid-friendly. I help students read with
              confidence, write with clarity, and actually enjoy the process.
            </p>

            <div className="mt-5 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800/50">
              <Row label="Availability" value="Mon-Fri, afternoons" />
              <Row label="Where" value="Teacher's home (Toronto)" />
              <Row label="Pricing" value="Prototype — free" />
            </div>

            <Link
              href="/signup"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              See available times
            </Link>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-5xl px-6 pb-28"
      >
        <h2 className="mb-2 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Three steps. No DMs.
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-zinc-600 dark:text-zinc-400">
          Everything lives in one link. Book, show up, learn.
        </p>
        <ol className="grid gap-6 sm:grid-cols-3">
          <Step
            n="1"
            title="Sign up"
            body="Name, age, email, password. Takes a minute. K-12 only."
          />
          <Step
            n="2"
            title="Pick a slot"
            body="Choose 30, 45, or 60 minutes and a time that works for you."
          />
          <Step
            n="3"
            title="Show up"
            body="You'll get an email with the address. That's it. See you there."
          />
        </ol>
      </section>

      <footer className="relative z-10 border-t border-zinc-200/60 py-8 text-center text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-500">
        Built as a free prototype. All sessions in America/Toronto.
      </footer>
    </main>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-zinc-500">{suffix}</span>}
      </dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
        {n}
      </div>
      <h3 className="mb-1 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{body}</p>
    </li>
  );
}
