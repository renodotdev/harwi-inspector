"use client";

import { useEffect, type ReactNode } from "react";
import type { Report } from "@/lib/report";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[12.5px]">
      <span className="text-ink-subtle">{label}:</span>{" "}
      <b className="font-semibold">{value}</b>
    </div>
  );
}

function Tally({ color, children }: { color: string; children: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span
        className="size-2.5 rounded-[3px]"
        style={{ background: color }}
        aria-hidden
      />
      {children}
    </div>
  );
}

/**
 * The report card itself. Carries `#printArea`, which the print stylesheet
 * isolates, so this is the only thing that reaches paper.
 */
export function ReportCard({
  report,
  footer,
  scroll = true,
}: {
  report: Report;
  footer?: ReactNode;
  /** Overlay constrains body height; the standalone page lets it run long. */
  scroll?: boolean;
}) {
  return (
    <div
      id="printArea"
      className="w-full max-w-[740px] overflow-hidden rounded-xl bg-surface shadow-[0_24px_60px_oklch(0.2_0.02_260/0.35)] sm:rounded-2xl"
    >
      <div className="border-b border-line px-4 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 mb-1 text-xl font-extrabold tracking-[-0.01em]">
              Inspection Report
            </h2>
            <p className="m-0 text-[13px] text-ink-subtle">
              {report.deviceName} · {report.generatedAt}
            </p>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
              Grade
            </div>
            <div
              className="text-[22px] font-extrabold"
              style={{ color: report.gradeColor }}
            >
              {report.grade}
            </div>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-[18px] gap-y-1.5 border-t border-line-faint pt-3.5">
          <Fact label="Owner" value={report.ownerName} />
          <Fact label="Contact" value={report.ownerContact} />
          <Fact label="Address" value={report.ownerAddress} />
          <Fact label="Inspector" value={report.inspectorName} />
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <Tally color="var(--color-grade-excellent)">
            {`${report.counts.pass} pass`}
          </Tally>
          <Tally color="var(--color-grade-poor)">
            {`${report.counts.fail} fail`}
          </Tally>
          <Tally color="var(--color-na-swatch)">
            {`${report.counts.na} N/A`}
          </Tally>
        </div>
      </div>

      <div
        id="printBody"
        className={`px-4 py-5 sm:px-7 ${scroll ? "max-h-[58dvh] overflow-auto sm:max-h-[54vh]" : ""}`}
      >
        <div className="mb-5 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-x-5 gap-y-1.5">
          {report.deviceRows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-2.5 border-b border-dotted border-line-strong py-[5px] text-[13px]"
            >
              <span className="text-ink-subtle">{row.label}</span>
              <span className="text-right font-semibold">{row.value}</span>
            </div>
          ))}
        </div>

        {report.sections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="m-0 text-sm font-bold">{section.title}</h3>
              <span className="text-xs text-ink-subtle">{section.tally}</span>
            </div>
            {section.hasFails ? (
              <div className="mt-[5px] text-[12.5px] text-fail-ink">
                ⚠ Failed: {section.failList}
              </div>
            ) : null}
            {section.notes.map((note) => (
              <div key={note.label} className="mt-1 text-[12.5px] text-ink-label">
                <b className="font-semibold text-ink-strong">{note.label}:</b>{" "}
                <i>{note.note}</i>
              </div>
            ))}
          </div>
        ))}

        {report.overallNotes ? (
          <div className="mt-1.5 rounded-[10px] border border-track bg-surface-sunken px-3.5 py-3">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-subtle">
              Overall notes
            </div>
            <div className="whitespace-pre-wrap text-[13px] text-ink-body">
              {report.overallNotes}
            </div>
          </div>
        ) : null}
      </div>

      {footer ? (
        <div
          id="printControls"
          className="flex flex-col gap-2.5 border-t border-line bg-surface-muted px-4 py-4 max-sm:[&>button]:w-full sm:flex-row sm:flex-wrap sm:justify-end sm:px-7"
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Modal wrapper used by the live form's Review step. */
export function ReportOverlay({
  report,
  onClose,
  footer,
}: {
  report: Report;
  onClose: () => void;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      id="printScrim"
      onClick={(e) => {
        // Only a backdrop click closes: clicks inside the card bubble up here
        // but carry a different target.
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Inspection report"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-scrim p-2 sm:px-4 sm:py-8"
    >
      <ReportCard report={report} footer={footer} />
    </div>
  );
}
