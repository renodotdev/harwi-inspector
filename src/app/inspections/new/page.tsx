import { InspectionForm } from "@/components/InspectionForm";
import { localToday } from "@/lib/inspection";

export const metadata = { title: "New inspection" };

export default function NewInspection() {
  // Seeds the form; InspectionForm shows it in the browser's own locale.
  return <InspectionForm initialDate={localToday()} />;
}
