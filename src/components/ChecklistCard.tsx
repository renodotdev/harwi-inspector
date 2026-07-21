"use client";

import {
  type ChecklistSection,
  type Verdict,
  VERDICTS,
  VERDICT_LABELS,
  itemKey,
} from "@/lib/inspection";
import type { Draft } from "@/lib/formState";
import { Icon } from "./Icon";
import { Card, CardHeading } from "./ui";

const VERDICT_BUTTON =
  "min-h-11 min-w-[50px] flex-1 px-2.5 py-2 rounded-lg border text-[12.5px] font-bold cursor-pointer transition-all duration-[120ms] sm:flex-none";

const VERDICT_ACTIVE: Record<Verdict, string> = {
  pass: "border-pass bg-pass-soft text-pass",
  fail: "border-fail bg-fail-soft text-fail",
  na: "border-na bg-na-soft text-na",
};

const VERDICT_IDLE = "border-line-input bg-surface text-ink-faint";

const NOTE_BUTTON =
  "flex size-11 shrink-0 items-center justify-center rounded-lg border cursor-pointer transition-all duration-[120ms]";

type Props = {
  section: ChecklistSection;
  results: Draft["results"];
  openNotes: Record<string, boolean>;
  onVerdict: (key: string, verdict: Verdict) => void;
  onToggleNoteEditor: (key: string) => void;
  onNote: (key: string, note: string) => void;
};

export function ChecklistCard({
  section,
  results,
  openNotes,
  onVerdict,
  onToggleNoteEditor,
  onNote,
}: Props) {
  let decided = 0;
  let failed = 0;
  for (const item of section.items) {
    const verdict = results[itemKey(section.id, item.id)]?.verdict;
    if (verdict) decided++;
    if (verdict === "fail") failed++;
  }

  let statusText = `${decided}/${section.items.length}`;
  let statusClass = "text-ink-faint";
  if (failed > 0) {
    statusText = `${failed} issue${failed > 1 ? "s" : ""}`;
    statusClass = "text-fail";
  } else if (decided === section.items.length) {
    statusText = "Complete";
    statusClass = "text-pass";
  }

  return (
    <Card>
      <CardHeading
        icon={section.icon}
        title={section.title}
        tight
        trailing={
          <span className={`text-xs font-bold ${statusClass}`}>
            {statusText}
          </span>
        }
      />
      <div className="flex flex-col">
        {section.items.map((item) => {
          const key = itemKey(section.id, item.id);
          const result = results[key];
          const verdict = result?.verdict ?? null;
          const note = result?.note ?? "";
          const noteOpen = !!openNotes[key];

          return (
            <div key={key} className="border-t border-line-soft py-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="basis-full text-sm text-ink-body sm:flex-[1_1_160px] sm:basis-auto">
                  {item.label}
                </span>

                <button
                  type="button"
                  onClick={() => onToggleNoteEditor(key)}
                  title="Add note"
                  aria-label={`Add note for ${item.label}`}
                  aria-expanded={noteOpen}
                  className={`${NOTE_BUTTON} ${
                    noteOpen
                      ? "border-brand-edge bg-brand-tint text-brand-accent"
                      : note
                        ? "border-brand-line bg-surface text-brand-accent"
                        : "border-line-input bg-surface text-ink-ghost"
                  }`}
                >
                  <Icon
                    name={note ? "message-square-text" : "square-pen"}
                    className="size-[15px]"
                  />
                </button>

                <div className="flex min-w-0 flex-1 gap-1.5 sm:flex-none">
                  {VERDICTS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => onVerdict(key, kind)}
                      aria-pressed={verdict === kind}
                      className={`${VERDICT_BUTTON} ${
                        verdict === kind ? VERDICT_ACTIVE[kind] : VERDICT_IDLE
                      }`}
                    >
                      {VERDICT_LABELS[kind]}
                    </button>
                  ))}
                </div>
              </div>

              {noteOpen ? (
                <textarea
                  value={note}
                  onChange={(e) => onNote(key, e.target.value)}
                  placeholder="Note for this item (optional)…"
                  rows={2}
                  autoFocus
                  className="mt-2 w-full resize-y rounded-lg border border-line-brand bg-surface-brand px-[11px] py-2.5 text-[13px] text-ink-soft"
                />
              ) : null}

              {!noteOpen && note ? (
                <div className="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-ink-muted">
                  <Icon
                    name="corner-down-right"
                    className="mt-0.5 size-[13px] shrink-0 text-brand-ink"
                  />
                  <span className="italic">{note}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
