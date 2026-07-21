"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type InspectionSummary,
  GRADE_COLORS,
  GRADES,
  deviceName,
} from "@/lib/inspection";
import { Icon } from "./Icon";
import { LocaleDate } from "./LocaleDate";

const TH =
  "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-ink-subtle whitespace-nowrap";
const TD = "px-4 py-3 text-[13.5px] text-ink-body align-middle";
const CONTROL =
  "h-[42px] box-border rounded-[9px] border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink-body focus:border-transparent focus:outline-2 focus:outline-brand";
const PAGE_SIZE = 20;

type GradeFilter = "all" | "ungraded" | NonNullable<InspectionSummary["grade"]>;
type SortOption =
  | "date-desc"
  | "date-asc"
  | "device-asc"
  | "device-desc"
  | "owner-asc";

const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Date: newest first",
  "date-asc": "Date: oldest first",
  "device-asc": "Device: A–Z",
  "device-desc": "Device: Z–A",
  "owner-asc": "Owner: A–Z",
};

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const visible = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  visible.forEach((page, index) => {
    if (index > 0 && page - visible[index - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
}

function GradePill({ grade }: { grade: InspectionSummary["grade"] }) {
  if (!grade) {
    return <span className="text-[13px] text-ink-ghost">—</span>;
  }
  return (
    <span
      className="inline-block rounded-full px-2.5 py-[3px] text-[11.5px] font-bold text-white"
      style={{ background: GRADE_COLORS[grade] }}
    >
      {grade}
    </span>
  );
}

function Counts({ counts }: { counts: InspectionSummary["counts"] }) {
  const cells = [
    { n: counts.pass, color: "var(--color-grade-excellent)", label: "pass" },
    { n: counts.fail, color: "var(--color-grade-poor)", label: "fail" },
    { n: counts.na, color: "var(--color-na-swatch)", label: "N/A" },
  ];
  return (
    <div className="flex items-center gap-3">
      {cells.map((c) => (
        <span
          key={c.label}
          title={`${c.n} ${c.label}`}
          className="flex items-center gap-1.5 text-[13px] tabular-nums"
        >
          <span
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ background: c.color }}
            aria-hidden
          />
          {c.n}
        </span>
      ))}
    </div>
  );
}

function InspectionCard({ row }: { row: InspectionSummary }) {
  return (
    <Link
      href={`/inspections/${row.id}`}
      className="block rounded-xl border border-line bg-surface p-4 active:bg-surface-sunken"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 truncate text-[15px] font-bold text-ink">
            {deviceName(row)}
          </h2>
          <p className="m-0 mt-0.5 truncate text-[13px] text-ink-subtle">
            {row.ownerName || "No owner"} · {row.inspectorName || "No inspector"}
          </p>
        </div>
        <GradePill grade={row.grade} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line-soft pt-3">
        <Counts counts={row.counts} />
        <span className="shrink-0 text-xs font-semibold text-ink-muted">
          <LocaleDate iso={row.inspectionDate} />
        </span>
      </div>
    </Link>
  );
}

export function InspectionsTable({ rows }: { rows: InspectionSummary[] }) {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<GradeFilter>("all");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const [page, setPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesQuery =
        !q ||
        [deviceName(row), row.ownerName, row.inspectorName, row.grade ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesGrade =
        grade === "all" ||
        (grade === "ungraded" ? row.grade === null : row.grade === grade);
      return matchesQuery && matchesGrade;
    });

    return filtered.toSorted((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.inspectionDate.localeCompare(b.inspectionDate);
        case "device-asc":
          return deviceName(a).localeCompare(deviceName(b));
        case "device-desc":
          return deviceName(b).localeCompare(deviceName(a));
        case "owner-asc":
          return a.ownerName.localeCompare(b.ownerName);
        case "date-desc":
          return b.inspectionDate.localeCompare(a.inspectionDate);
      }
    });
  }, [rows, query, grade, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstResult = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = filteredAndSorted.slice(firstResult, firstResult + PAGE_SIZE);
  const hasFilters = query.trim() !== "" || grade !== "all";

  function clearFilters() {
    setQuery("");
    setGrade("all");
    setPage(1);
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
          <Icon name="clipboard-check" className="size-6" />
        </div>
        <h2 className="m-0 mb-1.5 text-[15px] font-bold">No inspections yet</h2>
        <p className="m-0 text-[13.5px] text-ink-subtle">
          Start a checklist and press Save — it will show up here.
        </p>
        <Link
          href="/inspections/new"
          className="mt-5 inline-block rounded-[9px] bg-brand px-5 py-2.5 text-[13px] font-bold text-ink hover:bg-brand-strong"
        >
          + New inspection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <label className="col-span-2 min-w-0 sm:min-w-[240px] sm:flex-1">
          <span className="sr-only">Search inspections</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search device, owner or inspector…"
            className={`${CONTROL} w-full`}
          />
        </label>
        <label className="min-w-0">
          <span className="sr-only">Filter by grade</span>
          <select
            value={grade}
            onChange={(event) => {
              setGrade(event.target.value as GradeFilter);
              setPage(1);
            }}
            className={`${CONTROL} w-full`}
          >
            <option value="all">All grades</option>
            {GRADES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="ungraded">Ungraded</option>
          </select>
        </label>
        <label className="min-w-0">
          <span className="sr-only">Sort inspections</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortOption);
              setPage(1);
            }}
            className={`${CONTROL} w-full`}
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {visibleRows.map((row) => (
          <InspectionCard key={row.id} row={row} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
        <table className="w-full min-w-[700px] border-collapse">
          <thead className="border-b border-line bg-surface-muted">
            <tr>
              <th className={TH}>Device</th>
              <th className={TH}>Owner</th>
              <th className={`${TH} hidden lg:table-cell`}>Inspector</th>
              <th className={TH}>Date</th>
              <th className={TH}>Results</th>
              <th className={TH}>Grade</th>
              <th className={TH} />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line-soft last:border-b-0 hover:bg-surface-sunken"
              >
                <td className={`${TD} font-semibold`}>
                  <Link
                    href={`/inspections/${row.id}`}
                    className="hover:underline"
                  >
                    {deviceName(row)}
                  </Link>
                </td>
                <td className={TD}>{row.ownerName || "—"}</td>
                <td className={`${TD} hidden lg:table-cell`}>
                  {row.inspectorName || "—"}
                </td>
                <td className={`${TD} whitespace-nowrap text-ink-muted`}>
                  <LocaleDate iso={row.inspectionDate} />
                </td>
                <td className={TD}>
                  <Counts counts={row.counts} />
                </td>
                <td className={TD}>
                  <GradePill grade={row.grade} />
                </td>
                <td className={`${TD} text-right`}>
                  <Link
                    href={`/inspections/${row.id}`}
                    className="whitespace-nowrap text-[13px] font-bold text-brand-text hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="px-1 py-6 text-center text-[13.5px] text-ink-subtle">
          <p className="m-0">No inspections match the selected filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 cursor-pointer font-bold text-brand-text hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
          <p className="m-0 text-[13px] font-semibold text-ink-subtle tabular-nums">
            Showing {firstResult + 1}–
            {Math.min(firstResult + PAGE_SIZE, filteredAndSorted.length)} of {filteredAndSorted.length}
            {hasFilters ? ` (filtered from ${rows.length})` : ""}
          </p>

          {totalPages > 1 ? (
            <nav
              aria-label="Inspection pages"
              className="flex w-full items-center justify-center gap-1 sm:w-auto"
            >
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="min-h-11 flex-1 cursor-pointer rounded-lg border border-line-strong bg-surface px-3 py-2 text-[13px] font-bold text-ink-label hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                Previous
              </button>
              <span className="px-2 text-[13px] font-bold text-ink-label tabular-nums sm:hidden">
                {currentPage} / {totalPages}
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                {pageItems(currentPage, totalPages).map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex size-11 items-center justify-center text-ink-subtle"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-current={item === currentPage ? "page" : undefined}
                      aria-label={`Page ${item}`}
                      className={`size-11 cursor-pointer rounded-lg border text-[13px] font-bold tabular-nums ${
                        item === currentPage
                          ? "border-brand-edge bg-brand-soft text-brand-text"
                          : "border-line-strong bg-surface text-ink-label hover:bg-surface-sunken"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage === totalPages}
                className="min-h-11 flex-1 cursor-pointer rounded-lg border border-line-strong bg-surface px-3 py-2 text-[13px] font-bold text-ink-label hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                Next
              </button>
            </nav>
          ) : null}
        </div>
      )}
    </div>
  );
}
