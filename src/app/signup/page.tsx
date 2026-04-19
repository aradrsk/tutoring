"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { BrandMark } from "@/components/brand-mark";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function finishLogin(age: number | null) {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");
    const idToken = await user.getIdToken(true);
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, age }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw { code: data.error ?? "session_create_failed", message: data.error };
    }
    // /get-started redirects straight through if profile is already complete.
    router.push("/get-started");
    router.refresh();
  }

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await finishLogin(age);
    } catch (err) {
      const msg = authErrorMessage(err);
      if (msg) setError(msg);
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await finishLogin(null);
    } catch (err) {
      const msg = authErrorMessage(err);
      if (msg) setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BrandMark size={28} colour="#B9FF66" background="#191A23" />
          tutor<span className="text-[#B9FF66]">.</span>
        </Link>
        <Link href="/login" className="text-[15px] font-medium hover:underline">
          Already have an account?
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:items-center">
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

        <form
          onSubmit={onEmailSubmit}
          className="rounded-[40px] border-2 border-[#191A23] bg-white p-8 shadow-[0_6px_0_0_#191A23] md:p-10"
        >
          <h2 className="mb-6 text-2xl font-medium">Create your account</h2>

          <GoogleButton label="Sign up with Google" onClick={onGoogle} pending={pending} />

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-[#191A23]/50">
            <span className="h-px flex-1 bg-[#191A23]/10" />
            or with email
            <span className="h-px flex-1 bg-[#191A23]/10" />
          </div>

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
            <p role="alert" className="mt-5 rounded-xl border-2 border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700">
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
        {hint && <span className="text-xs text-[#191A23]/50">{hint}</span>}
      </span>
      <input
        name={name}
        {...rest}
        className="w-full rounded-xl border-2 border-[#191A23]/15 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-[#191A23]"
      />
    </label>
  );
}

function GoogleButton({
  label,
  onClick,
  pending,
}: {
  label: string;
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#191A23] bg-white px-5 py-3 text-[15px] font-medium transition hover:bg-zinc-50 disabled:opacity-60"
    >
      <GoogleIcon />
      <span>{pending ? "Redirecting…" : label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
