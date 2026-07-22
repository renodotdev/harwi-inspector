import { InspectionForm } from "@/components/InspectionForm";
import { localToday } from "@/lib/inspection";

export const metadata = { title: "New inspection" };

export default function NewInspection() {
  // Hydration-stable seed; InspectionForm reconciles it with browser-local
  // "today" after mount.
  return <InspectionForm initialDate={localToday()} />;
}
