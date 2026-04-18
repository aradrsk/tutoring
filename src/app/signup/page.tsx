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
    const { error: err } = await signUp.email({
      name,
      email,
      password,
      age,
    });
    setPending(false);

    if (err) return setError(err.message ?? "Signup failed.");
    router.push("/account/bookings");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        K-12 students only.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" name="name" type="text" required autoComplete="name" />
        <Field label="Age (5-18)" name="age" type="number" min={5} max={18} required />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field
          label="Password (min. 8 chars)"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
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
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        name={name}
        {...rest}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
      />
    </label>
  );
}
