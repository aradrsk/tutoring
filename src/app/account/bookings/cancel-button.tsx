"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cancelBookingAction } from "./actions";

export function CancelButton({
  bookingId,
  whenLabel,
  durationMinutes,
}: {
  bookingId: string;
  whenLabel: string;
  durationMinutes: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", bookingId);
      try {
        await cancelBookingAction(fd);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError((err as Error).message ?? "Couldn't cancel. Try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border-2 border-red-500/30 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Cancel
      </button>

      <ConfirmDialog
        open={open}
        tone="danger"
        title="Cancel this session?"
        body={
          <>
            <p>
              You&apos;re about to cancel your{" "}
              <strong>{durationMinutes}-minute session</strong> on{" "}
              <strong>{whenLabel}</strong>.
            </p>
            <p className="mt-3">
              The slot opens up for someone else right away. Your first free
              session resets — you can rebook whenever works for you.
            </p>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border-2 border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </>
        }
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep the booking"
        pending={pending}
        onConfirm={confirm}
        onCancel={() => {
          setError(null);
          setOpen(false);
        }}
      />
    </>
  );
}
