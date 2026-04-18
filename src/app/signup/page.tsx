"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const ageRaw = String(form.get("age") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!name) return setError("Name is required.");
    const age = Number(ageRaw);
    if (!Number.isInteger(age) || age < 5 || age > 18) {
      return setError("Age must be a whole number between 5 and 18.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Valid email is required.");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    setPending(true);
    const { error: err } = await signUp.email({ name, email, password, age });
    setPending(false);
    if (err) return setError(err.message ?? "Signup failed.");
    router.push("/account/bookings");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* minimal nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="inline-block h-6 w-6 rounded-sm bg-[#191A23]" />
          tutor<span className="text-[#B9FF66]">.</span>
        </Link>
        <Link href="/login" className="text-[15px] font-medium hover:underline">
          Already have an account?
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        {/* Left: pitch */}
        <div>
          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            Book your first{" "}
            <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
              free session
            </span>
            .
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#191A23]/70">
            Takes under a minute. K-12 English tutoring, in-person in Toronto.
          </p>
          <ul className="mt-8 space-y-3 text-[15px]">
            {[
              "First session free",
              "30, 45, or 60 minute slots",
              "Confirmation email with teacher's address",
              "Cancel up to 24 hours before",
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

        {/* Right: form card */}
        <form
          onSubmit={onSubmit}
          className="rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-10"
        >
          <h2 className="mb-6 text-2xl font-medium">Create your account</h2>

          <div className="space-y-5">
            <Field label="Name" name="name" type="text" required autoComplete="name" />
            <Field
              label="Age"
              name="age"
              type="number"
              min={5}
              max={18}
              required
              hint="Between 5 and 18"
            />
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field
              label="Password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              hint="At least 8 characters"
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
            {pending ? "Creating account…" : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-[#191A23]/60">
            Already have one?{" "}
            <Link href="/login" className="font-medium text-[#191A23] underline">
              Log in
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
  hint,
  ...rest
}: {
  label: string;
  name: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint && (
          <span className="text-xs text-[#191A23]/50">{hint}</span>
        )}
      </span>
      <input
        name={name}
        {...rest}
        className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-[#191A23]"
      />
    </label>
  );
}
