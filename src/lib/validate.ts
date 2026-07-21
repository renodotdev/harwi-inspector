import {
  type DeviceDetails,
  type InspectionInput,
  type ItemResult,
  type OwnerDetails,
  ITEM_LABELS,
  isGrade,
} from "./inspection";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const MAX_TEXT = 200;
const MAX_NOTE = 2_000;

const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Trims and caps a free-text field; anything non-string becomes "". */
const text = (value: unknown, max = MAX_TEXT): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses an untrusted payload from the browser into an InspectionInput.
 * Unknown item ids are dropped rather than stored, so a stale client can't
 * write results for checks that no longer exist.
 */
export function parseInspectionInput(payload: unknown): InspectionInput {
  const root = obj(payload);

  const inspectionDate = text(root.inspectionDate, 10);
  if (!ISO_DATE.test(inspectionDate)) {
    throw new ValidationError("Inspection date must be a valid date.");
  }
  if (Number.isNaN(Date.parse(`${inspectionDate}T00:00:00Z`))) {
    throw new ValidationError("Inspection date is not a real date.");
  }

  const rawDevice = obj(root.device);
  const device: DeviceDetails = {
    brand: text(rawDevice.brand),
    model: text(rawDevice.model),
    imei: text(rawDevice.imei, 32),
    storage: text(rawDevice.storage, 32),
    ram: text(rawDevice.ram, 32),
    serial: text(rawDevice.serial, 64),
    processor: text(rawDevice.processor),
    color: text(rawDevice.color, 64),
  };

  const rawOwner = obj(root.owner);
  const owner: OwnerDetails = {
    name: text(rawOwner.name),
    contact: text(rawOwner.contact),
    address: text(rawOwner.address, 300),
  };

  const inspectorName = text(root.inspectorName);
  if (!inspectorName) {
    throw new ValidationError("Inspector name is required to save.");
  }
  if (!device.brand && !device.model) {
    throw new ValidationError("Enter at least a brand or model to save.");
  }

  const seen = new Set<string>();
  const items: ItemResult[] = [];
  for (const entry of Array.isArray(root.items) ? root.items : []) {
    const raw = obj(entry);
    const id = text(raw.id, 128);
    if (!id || seen.has(id)) continue;
    if (!(id in ITEM_LABELS)) continue; // retired or forged check
    seen.add(id);

    const verdict = raw.verdict;
    items.push({
      id,
      verdict:
        verdict === "pass" || verdict === "fail" || verdict === "na"
          ? verdict
          : null,
      note: text(raw.note, MAX_NOTE),
    });
  }

  return {
    inspectionDate,
    device,
    owner,
    inspectorName,
    grade: isGrade(root.grade) ? root.grade : null,
    overallNotes: text(root.overallNotes, MAX_NOTE),
    items,
  };
}
