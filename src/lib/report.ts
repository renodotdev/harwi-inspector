import {
  type Grade,
  type InspectionInput,
  type ItemResult,
  type VerdictCounts,
  DEVICE_FIELDS,
  GRADE_COLORS,
  SECTIONS,
  countVerdicts,
  deviceName,
  formatDate,
  itemKey,
} from "./inspection";

export type ReportRow = { label: string; value: string };
export type ReportNote = { label: string; note: string };

export type ReportSection = {
  title: string;
  tally: string;
  hasFails: boolean;
  failList: string;
  notes: ReportNote[];
};

export type Report = {
  deviceName: string;
  generatedAt: string;
  ownerName: string;
  ownerContact: string;
  ownerAddress: string;
  inspectorName: string;
  deviceRows: ReportRow[];
  sections: ReportSection[];
  counts: VerdictCounts;
  grade: string;
  gradeColor: string;
  overallNotes: string;
};

const DASH = "—";

const gradeColor = (grade: Grade | null) =>
  grade ? GRADE_COLORS[grade] : "var(--color-ink-muted)";

/**
 * Renders an inspection into the printable report. Works on the canonical
 * record, so it serves both the live form and a row loaded back from Supabase.
 */
export function buildReport(input: InspectionInput): Report {
  const byId = new Map<string, ItemResult>(
    input.items.map((item) => [item.id, item]),
  );

  const sections = SECTIONS.map((section) => {
    let pass = 0;
    let fail = 0;
    let na = 0;
    const fails: string[] = [];
    const notes: ReportNote[] = [];

    for (const item of section.items) {
      const result = byId.get(itemKey(section.id, item.id));
      if (!result) continue;

      if (result.verdict === "pass") pass++;
      else if (result.verdict === "fail") {
        fail++;
        fails.push(item.label);
      } else if (result.verdict === "na") na++;

      if (result.note) notes.push({ label: item.label, note: result.note });
    }

    return {
      title: section.title,
      tally: `${pass} pass · ${fail} fail · ${na} n/a`,
      hasFails: fail > 0,
      failList: fails.join(", "),
      notes,
    };
  });

  return {
    deviceName: deviceName(input.device),
    generatedAt: formatDate(input.inspectionDate),
    ownerName: input.owner.name || DASH,
    ownerContact: input.owner.contact || DASH,
    ownerAddress: input.owner.address || DASH,
    inspectorName: input.inspectorName || DASH,
    deviceRows: DEVICE_FIELDS.map((f) => ({
      label: f.label,
      value: input.device[f.key] || DASH,
    })),
    sections,
    counts: countVerdicts(input.items),
    grade: input.grade ?? DASH,
    gradeColor: gradeColor(input.grade),
    overallNotes: input.overallNotes,
  };
}
