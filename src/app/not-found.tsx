import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
        Error 404
      </p>
      <h1 className="text-6xl font-medium tracking-tight md:text-7xl">
        Page{" "}
        <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
          not found
        </span>
        .
      </h1>
      <p className="mt-6 max-w-md text-lg text-[#191A23]/70">
        That URL doesn&apos;t match anything we ship. Head home and try again.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-2xl bg-[#191A23] px-7 py-4 text-[15px] font-medium text-white transition hover:bg-[#2a2b38]"
        >
          Back home
        </Link>
        <Link
          href="/updates"
          className="rounded-2xl border-2 border-[#191A23] bg-white px-7 py-4 text-[15px] font-medium transition hover:bg-zinc-50"
        >
          See what&apos;s new
        </Link>
      </div>
    </main>
  );
}
