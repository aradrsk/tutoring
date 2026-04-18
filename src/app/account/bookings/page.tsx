import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export default async function AccountBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { user } = session;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {user.role === "teacher" ? "Teacher" : "Student"} account
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi{user.name ? `, ${user.name}` : ""}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-2 text-lg font-medium">Your bookings</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Bookings list lands in TU-11. Booking flow lands in TU-8.
        </p>
      </section>
    </main>
  );
}
