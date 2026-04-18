"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return setError("Email and password are required.");

    setPending(true);
    const { error: err } = await signIn.email({ email, password });
    setPending(false);
    if (err) return setError(err.message ?? "Login failed.");
    router.push("/account/bookings");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="inline-block h-6 w-6 rounded-sm bg-[#191A23]" />
          tutor<span className="text-[#B9FF66]">.</span>
        </Link>
        <Link href="/signup" className="text-[15px] font-medium hover:underline">
          New here? Sign up
        </Link>
      </header>

      <section className="mx-auto flex max-w-md px-6 py-16">
        <form
          onSubmit={onSubmit}
          className="w-full rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-10"
        >
          <h1 className="mb-2 text-3xl font-medium">Welcome back.</h1>
          <p className="mb-7 text-sm text-[#191A23]/60">
            Log in to see your upcoming sessions.
          </p>

          <div className="space-y-5">
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border-2 border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-7 w-full rounded-2xl bg-[#191A23] px-5 py-4 text-[15px] font-medium text-white transition hover:bg-[#2a2b38] disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Log in"}
          </button>

          <p className="mt-5 text-center text-sm text-[#191A23]/60">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#191A23] underline">
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  ...rest
}: {
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        name={name}
        {...rest}
        className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-[#191A23]"
      />
    </label>
  );
}
