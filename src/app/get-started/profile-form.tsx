"use client";

import { useActionState } from "react";
import { completeProfileAction, type ProfileFormState } from "./actions";

const initial: ProfileFormState = { error: null };

export function ProfileForm({
  defaultName,
  defaultAge,
}: {
  defaultName: string;
  defaultAge: number | null;
}) {
  const [state, action, pending] = useActionState(completeProfileAction, initial);

  return (
    <form action={action} className="space-y-5">
      <h2 className="text-2xl font-medium">Your info</h2>
      <p className="text-sm text-[#191A23]/60">
        K-12 only (ages 5–18).
      </p>

      <Field
        label="Name"
        name="name"
        type="text"
        required
        defaultValue={defaultName}
        autoComplete="name"
        hint="Shows on booking emails"
      />
      <Field
        label="Age"
        name="age"
        type="number"
        required
        min={5}
        max={18}
        defaultValue={defaultAge ?? ""}
        hint="Between 5 and 18"
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border-2 border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[#191A23] px-5 py-4 text-[15px] font-medium text-white transition hover:bg-[#2a2b38] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Continue to dashboard"}
      </button>
    </form>
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
