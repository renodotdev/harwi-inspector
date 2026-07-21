import "server-only";

import {
  type Inspection,
  type InspectionInput,
  type InspectionSummary,
  type ItemResult,
  type VerdictCounts,
  countVerdicts,
  isGrade,
} from "../inspection";
import { supabase } from "./client";

const TABLE = "inspections";

/** Columns the dashboard needs — deliberately excludes the `items` payload. */
const SUMMARY_COLUMNS =
  "id, created_at, inspection_date, brand, model, owner_name, inspector_name, grade, pass_count, fail_count, na_count";

const FULL_COLUMNS = `${SUMMARY_COLUMNS}, imei, storage, ram, serial, processor, color, owner_contact, owner_address, overall_notes, items`;

/** Shape of a row as it comes back from PostgREST. */
type Row = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === "string" ? value : "");

const num = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

function counts(row: Row): VerdictCounts {
  return {
    pass: num(row.pass_count),
    fail: num(row.fail_count),
    na: num(row.na_count),
  };
}

/** Defensive: `items` is JSONB, so the DB guarantees shape only loosely. */
function parseItems(value: unknown): ItemResult[] {
  if (!Array.isArray(value)) return [];
  const items: ItemResult[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const { id, verdict, note } = entry as Record<string, unknown>;
    if (typeof id !== "string" || !id) continue;
    items.push({
      id,
      verdict:
        verdict === "pass" || verdict === "fail" || verdict === "na"
          ? verdict
          : null,
      note: str(note),
    });
  }
  return items;
}

function toSummary(row: Row): InspectionSummary {
  return {
    id: str(row.id),
    createdAt: str(row.created_at),
    inspectionDate: str(row.inspection_date),
    brand: str(row.brand),
    model: str(row.model),
    ownerName: str(row.owner_name),
    inspectorName: str(row.inspector_name),
    grade: isGrade(row.grade) ? row.grade : null,
    counts: counts(row),
  };
}

function toInspection(row: Row): Inspection {
  return {
    id: str(row.id),
    createdAt: str(row.created_at),
    inspectionDate: str(row.inspection_date),
    device: {
      brand: str(row.brand),
      model: str(row.model),
      imei: str(row.imei),
      storage: str(row.storage),
      ram: str(row.ram),
      serial: str(row.serial),
      processor: str(row.processor),
      color: str(row.color),
    },
    owner: {
      name: str(row.owner_name),
      contact: str(row.owner_contact),
      address: str(row.owner_address),
    },
    inspectorName: str(row.inspector_name),
    grade: isGrade(row.grade) ? row.grade : null,
    overallNotes: str(row.overall_notes),
    items: parseItems(row.items),
    counts: counts(row),
  };
}

/** Counts are derived here, never trusted from the client. */
function toRow(input: InspectionInput): Row {
  const tally = countVerdicts(input.items);
  return {
    inspection_date: input.inspectionDate,
    brand: input.device.brand,
    model: input.device.model,
    imei: input.device.imei,
    storage: input.device.storage,
    ram: input.device.ram,
    serial: input.device.serial,
    processor: input.device.processor,
    color: input.device.color,
    owner_name: input.owner.name,
    owner_contact: input.owner.contact,
    owner_address: input.owner.address,
    inspector_name: input.inspectorName,
    grade: input.grade,
    overall_notes: input.overallNotes,
    pass_count: tally.pass,
    fail_count: tally.fail,
    na_count: tally.na,
    items: input.items,
  };
}

export async function listInspections(
  limit = 100,
): Promise<InspectionSummary[]> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load inspections: ${error.message}`);
  return (data ?? []).map(toSummary);
}

export async function getInspection(id: string): Promise<Inspection | null> {
  const { data, error } = await supabase()
    .from(TABLE)
    .select(FULL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load inspection: ${error.message}`);
  return data ? toInspection(data) : null;
}

export async function createInspection(
  input: InspectionInput,
): Promise<Inspection> {
  const { data, error } = await supabase()
    .from(TABLE)
    .insert(toRow(input))
    .select(FULL_COLUMNS)
    .single();

  if (error) throw new Error(`Could not save inspection: ${error.message}`);
  return toInspection(data);
}

export async function deleteInspection(id: string): Promise<void> {
  const { error } = await supabase().from(TABLE).delete().eq("id", id);
  if (error) throw new Error(`Could not delete inspection: ${error.message}`);
}
