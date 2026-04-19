import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { BrandMark } from "@/components/brand-mark";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function GetStartedPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Profile is complete? Skip this page.
  if (session.user.age != null && session.user.name.trim().length > 0) {
    redirect("/account/bookings");
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BrandMark size={28} colour="#B9FF66" background="#191A23" />
          tutor<span className="text-[#B9FF66]">.</span>
        </Link>
        <span className="text-sm text-[#191A23]/60">
          {session.user.email}
        </span>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
            Almost there
          </p>
          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            Let&apos;s get you{" "}
            <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
              started
            </span>
            .
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#191A23]/70">
            Two quick things so Theepa can plan for your session.
          </p>
          <ul className="mt-8 space-y-3 text-[15px]">
            {[
              "We use your age to pick the right material (grade level).",
              "Your name shows up on booking confirmations.",
              "You can update both later from your dashboard.",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B9FF66] text-sm font-bold text-[#191A23]">
                  ✓
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-10">
          <ProfileForm
            defaultName={session.user.name}
            defaultAge={session.user.age}
          />
        </div>
      </section>
    </main>
  );
}
