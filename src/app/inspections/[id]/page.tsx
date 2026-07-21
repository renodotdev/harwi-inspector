import Link from "next/link";
import { notFound } from "next/navigation";
import { getInspection } from "@/lib/db/inspections";
import { deviceName } from "@/lib/inspection";
import { buildReport } from "@/lib/report";
import { SavedInspection } from "@/components/SavedInspection";
import { AppHeader } from "@/components/AppHeader";
import { Icon } from "@/components/Icon";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inspection = await getInspection(id).catch(() => null);
  return {
    title: inspection
      ? `${deviceName(inspection.device)} — Inspection`
      : "Inspection",
  };
}

export default async function InspectionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inspection = await getInspection(id);
  if (!inspection) notFound();

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <AppHeader
        left={
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-[9px] border border-line-strong bg-surface py-2.5 pr-4 pl-2.5 text-[13px] font-bold text-ink-label hover:bg-surface-sunken"
            aria-label="Back to dashboard"
          >
            <Icon name="chevron-left" className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        }
        actions={<PrintButton />}
      />

      <main className="mx-auto flex max-w-[820px] justify-center px-3 py-4 sm:px-5 sm:py-6">
        <div className="flex w-full flex-col gap-3">
          <p className="m-0 text-right text-xs text-ink-subtle sm:text-[13px]">
            Saved {new Date(inspection.createdAt).toISOString().slice(0, 10)}
          </p>
          <SavedInspection report={buildReport(inspection)} />
        </div>
      </main>
    </div>
  );
}
