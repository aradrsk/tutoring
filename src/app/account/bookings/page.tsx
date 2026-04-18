import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

export default async function AccountBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  const verified = Boolean(user.email_confirmed_at);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {profile?.role === "teacher" ? "Teacher" : "Student"} account
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi{profile?.name ? `, ${profile.name}` : ""}
          </h1>
        </div>
        <form action={logout}>
          <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
            Log out
          </button>
        </form>
      </header>

      {!verified && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Your email isn&apos;t verified yet. Check your inbox for the link — you
          need to verify before booking a session.
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-medium">Your bookings</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Bookings list lands in TU-11. Booking flow lands in TU-8.
        </p>
      </section>
    </main>
  );
}
