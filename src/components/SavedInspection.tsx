import type { Report } from "@/lib/report";
import { ReportCard } from "./InspectionReport";

/** A stored inspection rendered as the standalone report card. */
export function SavedInspection({ report }: { report: Report }) {
  return <ReportCard report={report} scroll={false} />;
}
