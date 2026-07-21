import Link from "next/link";
import { notFound } from "next/navigation";
import { getInspection } from "@/lib/db/inspections";
import { deviceName } from "@/lib/inspection";
import { buildReport } from "@/lib/report";
import { SavedInspection } from "@/components/SavedInspection";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";

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
      <header className="border-b border-line bg-header print:hidden">
        <div className="mx-auto flex max-w-[820px] flex-wrap items-center gap-2.5 px-4 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-[9px] border border-line-strong bg-surface py-2.5 pr-4 pl-2.5 text-[13px] font-bold text-ink-label hover:bg-surface-sunken"
          >
            <Icon name="chevron-left" className="size-4" />
            Dashboard
          </Link>
          <span className="hidden h-7 w-px bg-line md:block" />
          <span className="hidden md:block">
            <Logo href={null} />
          </span>
          <span className="mr-auto" />
          <span className="text-right text-xs text-ink-subtle sm:text-[13px]">
            Saved {new Date(inspection.createdAt).toISOString().slice(0, 10)}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-[820px] justify-center px-3 py-4 sm:px-5 sm:py-6">
        <SavedInspection report={buildReport(inspection)} />
      </main>
    </div>
  );
}
