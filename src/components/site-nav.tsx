import Link from "next/link";
import { getSession } from "@/lib/session";

export async function SiteNav() {
  const session = await getSession();

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold">
        <span className="inline-block h-6 w-6 rounded-sm bg-[#191A23]" />
        tutor<span className="text-[#B9FF66]">.</span>
      </Link>
      <div className="hidden items-center gap-7 text-[15px] md:flex">
        <Link href="/#services" className="hover:underline">Sessions</Link>
        <Link href="/#how" className="hover:underline">How it works</Link>
        <Link href="/#about" className="hover:underline">About</Link>
        <Link href="/updates" className="hover:underline">Updates</Link>
      </div>
      <div className="flex items-center gap-2">
        {session ? (
          <Link
            href="/account/bookings"
            className="rounded-2xl border-2 border-[#191A23] bg-[#191A23] px-5 py-2 text-[15px] font-medium text-white transition hover:bg-white hover:text-[#191A23]"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden rounded-2xl px-5 py-2 text-[15px] font-medium hover:bg-zinc-100 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl border-2 border-[#191A23] bg-[#191A23] px-5 py-2 text-[15px] font-medium text-white transition hover:bg-white hover:text-[#191A23]"
            >
              Book a session
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
