import Link from "next/link";
import { listInspections } from "@/lib/db/inspections";
import { isSupabaseConfigured } from "@/lib/db/client";
import type { InspectionSummary } from "@/lib/inspection";
import { InspectionsTable } from "@/components/InspectionsTable";
import { Logo } from "@/components/Logo";
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
      <header className="border-b border-line bg-header">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2.5 px-4 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
          <div className="mr-auto flex items-center gap-3">
            <Logo tagline size="large" />
            <span className="hidden h-7 w-px bg-line sm:block" />
            <h1 className="m-0 hidden text-[15px] font-bold tracking-[-0.01em] text-ink-subtle sm:block">
              Inspection History
            </h1>
          </div>
          <Link href="/inspections/new" className="shrink-0">
            <Button className="px-3 sm:px-3.5">
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">+ New inspection</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-4 sm:px-5 sm:py-6">
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
