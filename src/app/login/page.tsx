"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { authErrorMessage } from "@/lib/auth-errors";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function finishLogin() {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");
    const idToken = await user.getIdToken(true);
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw { code: data.error ?? "session_create_failed", message: data.error };
    }
    // /get-started redirects straight through if profile is already complete.
    router.push("/get-started");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return setError("Email and password are required.");

    setPending(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await finishLogin();
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
      await finishLogin();
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

          <GoogleButton label="Log in with Google" onClick={onGoogle} pending={pending} />

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-[#191A23]/50">
            <span className="h-px flex-1 bg-[#191A23]/10" />
            or with email
            <span className="h-px flex-1 bg-[#191A23]/10" />
          </div>

          <div className="space-y-5">
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field label="Password" name="password" type="password" required autoComplete="current-password" />
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
