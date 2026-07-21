"use client";

import { useMemo, useReducer, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DEVICE_FIELDS,
  GRADES,
  GRADE_COLORS,
  OWNER_FIELDS,
  SECTIONS,
  TOTAL_ITEMS,
  emptyDevice,
  itemKey,
  localToday,
} from "@/lib/inspection";
import { draftToInput, formReducer, initialState } from "@/lib/formState";
import { buildReport } from "@/lib/report";
import { saveInspection } from "@/app/actions";
import { ChecklistCard } from "./ChecklistCard";
import { ConfirmDialog, type ConfirmRequest } from "./ConfirmDialog";
import { Icon } from "./Icon";
import { ReportOverlay } from "./InspectionReport";
import { LocaleDate } from "./LocaleDate";
import { AppHeader } from "./AppHeader";
import { Button, Card, CardHeading, LabeledInput } from "./ui";

const GRADE_BUTTON =
  "px-4 py-2.5 rounded-[9px] border text-[13.5px] font-bold cursor-pointer transition-all duration-[120ms]";

/** Catalog order, so saved items always come back in a predictable sequence. */
const ITEM_ORDER = SECTIONS.flatMap((s) =>
  s.items.map((i) => itemKey(s.id, i.id)),
);

export function InspectionForm({ initialDate }: { initialDate: string }) {
  const [state, dispatch] = useReducer(formReducer, initialDate, initialState);
  const [error, setError] = useState<string | null>(null);
  const [confirmRequest, setConfirm] = useState<ConfirmRequest | null>(null);
  const [saving, startSaving] = useTransition();
  const router = useRouter();

  const { draft } = state;
  const decided = Object.values(draft.results).filter((r) => r.verdict).length;
  const progressPct = Math.round((decided / TOTAL_ITEMS) * 100);

  const input = useMemo(() => draftToInput(draft, ITEM_ORDER), [draft]);
  // Cheap and pure, so it also backs the save-confirmation summary.
  const report = useMemo(() => buildReport(input), [input]);

  /** True once anything has been entered — drives the leave/reset guards. */
  const pristineDevice = emptyDevice();
  const dirty =
    Object.keys(draft.results).length > 0 ||
    Boolean(draft.inspectorName || draft.grade || draft.overallNotes) ||
    Object.values(draft.owner).some(Boolean) ||
    DEVICE_FIELDS.some((f) => draft.device[f.key] !== pristineDevice[f.key]);

  const runSave = () => {
    setConfirm(null);
    setError(null);
    startSaving(async () => {
      const result = await saveInspection(input);
      if (result.ok) router.push(`/inspections/${result.id}`);
      else setError(result.error);
    });
  };

  const askSave = () => {
    const { pass, fail, na } = report.counts;
    setConfirm({
      title: "Save this inspection?",
      body: (
        <>
          <p className="m-0">
            <b className="font-semibold text-ink">{report.deviceName}</b> will be
            saved to the inspection history.
          </p>
          <ul className="m-0 mt-2 list-none space-y-1 p-0">
            <li>
              {decided} of {TOTAL_ITEMS} checks completed — {pass} pass, {fail}{" "}
              fail, {na} N/A
            </li>
            <li>Grade: {draft.grade ?? "not set"}</li>
            <li>Inspector: {draft.inspectorName || "not set"}</li>
          </ul>
          {decided < TOTAL_ITEMS ? (
            <p className="m-0 mt-2 font-semibold text-fail-ink">
              {TOTAL_ITEMS - decided} checks are still undecided.
            </p>
          ) : null}
        </>
      ),
      confirmLabel: "Save inspection",
      onConfirm: runSave,
    });
  };

  const askReset = () =>
    setConfirm({
      title: "Clear the whole checklist?",
      body: "Every verdict, note and field on this form will be discarded. This cannot be undone.",
      confirmLabel: "Clear everything",
      tone: "danger",
      onConfirm: () => {
        setConfirm(null);
        setError(null);
        dispatch({ type: "reset", date: localToday() });
      },
    });

  const askLeave = () => {
    if (!dirty) {
      router.push("/");
      return;
    }
    setConfirm({
      title: "Leave without saving?",
      body: "This inspection has not been saved. Going back to the dashboard will discard it.",
      confirmLabel: "Discard and leave",
      cancelLabel: "Stay on this form",
      tone: "danger",
      onConfirm: () => router.push("/"),
    });
  };

  return (
    <div className="min-h-screen pb-10 sm:pb-16">
      <AppHeader
        sticky
        logoHref={null}
        left={
          <Button
            variant="ghost"
            onClick={askLeave}
            className="inline-flex shrink-0 items-center gap-1 px-2.5 sm:pr-4 sm:pl-2.5"
            aria-label="Back to dashboard"
          >
            <Icon name="chevron-left" className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        }
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={askReset}
              disabled={saving}
              className="hidden sm:block"
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "review" })}
              className="hidden sm:block"
            >
              Review
            </Button>
            <Button onClick={askSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="mx-auto flex max-w-[820px] flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <div className="flex justify-between text-xs font-semibold text-ink-muted">
              <span>Checklist progress</span>
              <span className="tabular-nums">
                {decided}/{TOTAL_ITEMS} checked
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-track">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-250 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-[9px] border border-line bg-surface px-[11px] py-1.5 text-xs font-semibold text-ink-muted">
            <Icon name="calendar" className="size-[14px] text-brand-ink" />
            <LocaleDate iso={draft.inspectionDate} />
          </div>
        </div>

        {error ? (
          <div className="-mx-4 mt-3 border-t border-fail/30 bg-fail-soft sm:-mx-5">
            <p
              role="alert"
              className="mx-auto max-w-[820px] px-5 py-2.5 text-[13px] font-semibold text-fail"
            >
              {error}
            </p>
          </div>
        ) : null}
      </AppHeader>

      <main className="mx-auto flex max-w-[820px] flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-6">
        <div className="mb-1">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-ink">
            Smartphone checklist
          </p>
          <h1 className="m-0 mt-1 text-[24px] font-extrabold tracking-[-0.025em] text-ink sm:text-[28px]">
            New inspection
          </h1>
          <p className="m-0 mt-1 text-[13px] text-ink-subtle sm:text-sm">
            Record the device identity, complete each check, then review and save.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Card>
            <CardHeading
              icon="user-round"
              title="Owner details"
              trailing={
                <span className="rounded-full bg-line-soft px-2.5 py-[3px] text-[11px] font-semibold text-ink-faint">
                  Optional
                </span>
              }
            />
            <div className="flex flex-col gap-3.5">
              {OWNER_FIELDS.map((field) => (
                <LabeledInput
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={draft.owner[field.key]}
                  onChange={(value) =>
                    dispatch({ type: "setOwner", key: field.key, value })
                  }
                />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeading icon="user-check" title="Inspector" />
            <div className="flex flex-col gap-3.5">
              <LabeledInput
                label="Inspector name"
                placeholder="Your name"
                value={draft.inspectorName}
                onChange={(value) =>
                  dispatch({ type: "setInspectorName", value })
                }
              />
              <LabeledInput
                type="date"
                label="Inspection date"
                value={draft.inspectionDate}
                onChange={(value) =>
                  dispatch({ type: "setDate", date: value || localToday() })
                }
              />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeading icon="info" title="Device identity" />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {DEVICE_FIELDS.map((field) => (
              <LabeledInput
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                options={field.options}
                listId={`${field.key}-list`}
                value={draft.device[field.key]}
                onChange={(value) =>
                  dispatch({ type: "setDevice", key: field.key, value })
                }
              />
            ))}
          </div>
        </Card>

        {SECTIONS.map((section) => (
          <ChecklistCard
            key={section.id}
            section={section}
            results={draft.results}
            openNotes={state.openNotes}
            onVerdict={(key, verdict) =>
              dispatch({ type: "setVerdict", key, verdict })
            }
            onToggleNoteEditor={(key) =>
              dispatch({ type: "toggleNoteEditor", key })
            }
            onNote={(key, note) => dispatch({ type: "setNote", key, note })}
          />
        ))}

        <Card>
          <CardHeading icon="award" title="Overall grade" />
          <div className="mb-[18px] grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {GRADES.map((grade) => {
              const active = draft.grade === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  aria-pressed={active}
                  onClick={() => dispatch({ type: "setGrade", grade })}
                  className={`${GRADE_BUTTON} w-full sm:w-auto ${active ? "text-white" : "border-line-strong bg-surface"}`}
                  style={
                    active
                      ? {
                          borderColor: GRADE_COLORS[grade],
                          background: GRADE_COLORS[grade],
                        }
                      : { color: GRADE_COLORS[grade] }
                  }
                >
                  {grade}
                </button>
              );
            })}
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-bold text-ink-label">
              Overall inspection notes
            </span>
            <textarea
              value={draft.overallNotes}
              onChange={(e) =>
                dispatch({ type: "setOverallNotes", notes: e.target.value })
              }
              placeholder="Summary, deductions, anything the buyer should know…"
              rows={3}
              className="w-full resize-y rounded-[9px] border border-line bg-surface-muted px-3 py-2.5 text-[13px] text-ink-soft"
            />
          </label>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="ghost"
            size="lg"
            className="sm:hidden"
            onClick={askReset}
            disabled={saving}
          >
            Reset inspection
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => dispatch({ type: "review" })}
          >
            Review inspection
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={askSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save inspection"}
          </Button>
        </div>
      </main>

      {state.reviewing ? (
        <ReportOverlay
          report={report}
          onClose={() => dispatch({ type: "edit" })}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "edit" })}
                className="inline-flex items-center gap-1 pr-4 pl-2.5"
              >
                <Icon name="chevron-left" className="size-4" />
                Back to edit
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
              <Button onClick={askSave} disabled={saving}>
                {saving ? "Saving…" : "Save inspection"}
              </Button>
            </>
          }
        />
      ) : null}

      <ConfirmDialog
        request={confirmRequest}
        busy={saving}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
