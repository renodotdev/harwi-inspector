"use client";

import type { Report } from "@/lib/report";
import { ReportCard } from "./InspectionReport";
import { Button } from "./ui";

/**
 * A stored inspection rendered as the report card. Print is a client action,
 * so this thin wrapper is the only client boundary the detail page needs.
 */
export function SavedInspection({ report }: { report: Report }) {
  return (
    <ReportCard
      report={report}
      scroll={false}
      footer={
        <Button variant="secondary" onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      }
    />
  );
}
