"use client";

import { useEffect, useRef } from "react";

type Tone = "default" | "danger";

/**
 * Accessible confirmation modal using the native <dialog> element.
 * Opens when `open` becomes true, closes on backdrop click or Escape,
 * and calls onConfirm / onCancel on the respective buttons.
 */
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Not yet",
  tone = "default",
  pending = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  pending?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: Event) => {
      e.preventDefault();
      onCancel();
    };
    el.addEventListener("cancel", handle);
    return () => el.removeEventListener("cancel", handle);
  }, [onCancel]);

  const confirmStyles =
    tone === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-[#191A23] text-white hover:bg-[#2a2b38]";

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        // Click outside the content closes
        if (e.target === ref.current) onCancel();
      }}
      className="mx-auto w-[calc(100%-2rem)] max-w-md rounded-[32px] border-2 border-[#191A23] bg-white p-0 shadow-[0_6px_0_0_#191A23] backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-7">
        <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
        <div className="mt-3 text-[15px] leading-relaxed text-[#191A23]/70">
          {body}
        </div>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-2xl border-2 border-[#191A23] bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-2xl px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${confirmStyles}`}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
