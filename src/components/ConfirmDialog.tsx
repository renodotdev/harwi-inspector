"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./ui";

export type ConfirmTone = "primary" | "danger";

export type ConfirmRequest = {
  title: string;
  /** Short explanation, plus anything worth reviewing before committing. */
  body?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void;
};

/**
 * A focused confirmation modal. Replaces window.confirm so the prompt can show
 * real context (what is about to be saved, what is about to be lost) and match
 * the rest of the UI.
 */
export function ConfirmDialog({
  request,
  onCancel,
  busy = false,
}: {
  request: ConfirmRequest | null;
  onCancel: () => void;
  busy?: boolean;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Kept in refs so the effects below depend only on *whether* the dialog is
  // open. Otherwise a new onCancel identity (or `busy` flipping during a save)
  // re-runs the effect, and its cleanup steals focus back to the trigger.
  const latest = useRef({ onCancel, busy });
  useEffect(() => {
    latest.current = { onCancel, busy };
  });

  const open = Boolean(request);

  // Focus the confirm action on open, and hand focus back on close.
  useEffect(() => {
    if (!open) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    return () => restoreTo?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !latest.current.busy) {
        latest.current.onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      // Keep focus inside the dialog: without this, Tab walks straight into the
      // form behind the backdrop, which is still fully interactive.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!request) return null;

  const { title, body, confirmLabel, cancelLabel = "Cancel", tone } = request;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-auto bg-scrim pt-8 print:hidden sm:items-center sm:px-4 sm:py-8"
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[430px] rounded-t-2xl bg-surface p-5 shadow-[0_24px_60px_oklch(0.2_0.02_260/0.35)] sm:rounded-2xl sm:p-6"
      >
        <h2 id="confirm-title" className="m-0 text-[16px] font-extrabold">
          {title}
        </h2>
        {body ? (
          <div className="mt-2 text-[13.5px] leading-relaxed text-ink-subtle">
            {body}
          </div>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
            className="max-sm:w-full"
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={request.onConfirm}
            disabled={busy}
            className="max-sm:w-full"
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
