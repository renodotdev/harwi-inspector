import Link from "next/link";
import { listInspections } from "@/lib/db/inspections";
import { isSupabaseConfigured } from "@/lib/db/client";
import type { InspectionSummary } from "@/lib/inspection";
import { InspectionsTable } from "@/components/InspectionsTable";
import { AppHeader } from "@/components/AppHeader";
import { SetupNotice } from "@/components/SetupNotice";
import { Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const configured = isSupabaseConfigured();
  let rows: InspectionSummary[] = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      rows = await listInspections();
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <AppHeader
        actions={
          <Link href="/inspections/new" className="shrink-0">
            <Button className="px-3 sm:px-3.5">
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">+ New inspection</span>
            </Button>
          </Link>
        }
      />

      <main className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-4 sm:px-5 sm:py-6">
        <div className="mb-1">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-ink">
            Dashboard
          </p>
          <h1 className="m-0 mt-1 text-[24px] font-extrabold tracking-[-0.025em] text-ink sm:text-[28px]">
            Inspection history
          </h1>
          <p className="m-0 mt-1 text-[13px] text-ink-subtle sm:text-sm">
            Review saved device checks or start a new inspection.
          </p>
        </div>

        {!configured ? <SetupNotice /> : null}

        {loadError ? (
          <div
            role="alert"
            className="rounded-2xl border border-fail/40 bg-fail-soft px-6 py-5 text-[13px] font-semibold text-fail"
          >
            {loadError}
          </div>
        ) : null}

        {configured && !loadError ? <InspectionsTable rows={rows} /> : null}
      </main>
    </div>
  );
}
