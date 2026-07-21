/**
 * The inspection catalog and the canonical record shape.
 *
 * Item ids are stable slugs, never array indexes: a stored result references
 * `screen.touch_responsive`, so reordering, inserting or retiring a check never
 * remaps historical data. Renaming an `id` here is a data migration; changing a
 * `label` is not.
 */

export type Verdict = "pass" | "fail" | "na";

export const VERDICTS: Verdict[] = ["pass", "fail", "na"];

export const VERDICT_LABELS: Record<Verdict, string> = {
  pass: "Pass",
  fail: "Fail",
  na: "N/A",
};

export type ChecklistItem = {
  /** Unique within its section. Combined into `${sectionId}.${itemId}`. */
  id: string;
  label: string;
};

export type ChecklistSection = {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
};

export const SECTIONS: ChecklistSection[] = [
  {
    id: "screen",
    title: "Screen / display",
    icon: "smartphone",
    items: [
      { id: "touch_responsive", label: "Touch fully responsive" },
      { id: "no_dead_pixels", label: "No dead / stuck pixels" },
      { id: "no_cracks", label: "No cracks or deep scratches" },
      { id: "even_brightness", label: "Even brightness, no discoloration" },
      { id: "no_burn_in", label: "No burn-in or ghosting" },
    ],
  },
  {
    id: "body",
    title: "Body & frame",
    icon: "scan-line",
    items: [
      { id: "no_dents", label: "No dents on frame" },
      { id: "no_deep_scratches", label: "No deep scratches" },
      { id: "frame_straight", label: "Frame straight (not bent)" },
      { id: "back_glass_intact", label: "Back glass intact" },
      { id: "buttons_flush", label: "Buttons sit flush" },
    ],
  },
  {
    id: "battery",
    title: "Battery health",
    icon: "battery-charging",
    items: [
      { id: "health_85_plus", label: "Health 85% or above" },
      { id: "holds_charge", label: "Holds charge normally" },
      { id: "no_swelling", label: "No swelling" },
      { id: "charges_ok", label: "Charges without issue" },
    ],
  },
  {
    id: "cameras",
    title: "Cameras",
    icon: "camera",
    items: [
      { id: "rear_focus", label: "Rear camera focuses" },
      { id: "front_focus", label: "Front camera focuses" },
      { id: "flash_works", label: "Flash / torch works" },
      { id: "no_lens_cracks", label: "No lens cracks" },
      { id: "no_lens_fungus", label: "No lens fungus" },
      { id: "stable_video", label: "Video recording is stable" },
      { id: "no_color_dots", label: "No green / pink dots" },
      { id: "video_audio", label: "Video records + audio" },
    ],
  },
  {
    id: "buttons",
    title: "Buttons & ports",
    icon: "power",
    items: [
      { id: "power_button", label: "Power button" },
      { id: "volume_buttons", label: "Volume buttons" },
      { id: "mute_switch", label: "Mute / action switch" },
      { id: "charging_port", label: "Charging port" },
      { id: "sim_tray", label: "SIM tray reads card" },
    ],
  },
  {
    id: "connectivity",
    title: "Connectivity",
    icon: "wifi",
    items: [
      { id: "wifi", label: "Wi-Fi connects" },
      { id: "cellular", label: "Cellular signal" },
      { id: "bluetooth", label: "Bluetooth pairs" },
      { id: "gps", label: "GPS locks" },
    ],
  },
  {
    id: "biometrics",
    title: "Biometrics",
    icon: "fingerprint",
    items: [
      { id: "fingerprint", label: "Fingerprint enrolls & unlocks" },
      { id: "face_unlock", label: "Face unlock works" },
    ],
  },
  {
    id: "audio",
    title: "Speakers & mic",
    icon: "volume-2",
    items: [
      { id: "earpiece", label: "Earpiece speaker" },
      { id: "loudspeaker", label: "Loudspeaker" },
      { id: "microphone", label: "Microphone records" },
      {
        id: "front_camera_audio",
        label: "Front-camera video records audio",
      },
      {
        id: "rear_camera_audio",
        label: "Rear-camera video records audio",
      },
      { id: "no_distortion", label: "No distortion / rattle" },
    ],
  },
  {
    id: "water",
    title: "Water / damage indicators",
    icon: "droplet",
    items: [
      { id: "indicators_clear", label: "Liquid indicators clear" },
      { id: "no_water_damage", label: "No signs of water damage" },
      { id: "no_prior_repair", label: "No signs of prior repair" },
    ],
  },
  {
    id: "accessories",
    title: "Accessories included",
    icon: "package",
    items: [
      { id: "box", label: "Original box" },
      { id: "charger", label: "Charger / cable" },
      { id: "earphones", label: "Earphones" },
      { id: "documentation", label: "Documentation" },
      { id: "sim_tool", label: "SIM ejector tool" },
    ],
  },
];

/** Fully-qualified, storage-stable id for one check. */
export const itemKey = (sectionId: string, itemId: string) =>
  `${sectionId}.${itemId}`;

export const TOTAL_ITEMS = SECTIONS.reduce((n, s) => n + s.items.length, 0);

/** Label lookup for rendering stored results whose section may have moved. */
export const ITEM_LABELS: Record<string, string> = Object.fromEntries(
  SECTIONS.flatMap((s) =>
    s.items.map((i) => [itemKey(s.id, i.id), i.label] as const),
  ),
);

// ---------------------------------------------------------------------------
// Record shape — mirrors the `inspections` table one-for-one.
// ---------------------------------------------------------------------------

export type DeviceDetails = {
  brand: string;
  model: string;
  imei: string;
  storage: string;
  ram: string;
  serial: string;
  processor: string;
  color: string;
};

export type OwnerDetails = {
  name: string;
  contact: string;
  address: string;
};

/**
 * One recorded check. Items the inspector never touched are absent entirely;
 * `verdict: null` means they wrote a note but left the verdict undecided.
 */
export type ItemResult = {
  id: string;
  verdict: Verdict | null;
  note: string;
};

export type VerdictCounts = {
  pass: number;
  fail: number;
  na: number;
};

export const GRADES = ["Excellent", "Good", "Fair", "Poor"] as const;
export type Grade = (typeof GRADES)[number];

export const GRADE_COLORS: Record<Grade, string> = {
  Excellent: "var(--color-grade-excellent)",
  Good: "var(--color-grade-good)",
  Fair: "var(--color-grade-fair)",
  Poor: "var(--color-grade-poor)",
};

export const isGrade = (value: unknown): value is Grade =>
  typeof value === "string" && (GRADES as readonly string[]).includes(value);

/** An inspection as it is filled in — everything except server-assigned fields. */
export type InspectionInput = {
  inspectionDate: string;
  device: DeviceDetails;
  owner: OwnerDetails;
  inspectorName: string;
  grade: Grade | null;
  overallNotes: string;
  items: ItemResult[];
};

/** A persisted inspection. */
export type Inspection = InspectionInput & {
  id: string;
  createdAt: string;
  counts: VerdictCounts;
};

/** Dashboard row — the columns the table needs, without the item payload. */
export type InspectionSummary = {
  id: string;
  createdAt: string;
  inspectionDate: string;
  brand: string;
  model: string;
  ownerName: string;
  inspectorName: string;
  grade: Grade | null;
  counts: VerdictCounts;
};

// ---------------------------------------------------------------------------
// Form field definitions — drive the inputs and the record shape together.
// ---------------------------------------------------------------------------

export type FieldDef<K> = {
  key: K;
  label: string;
  placeholder: string;
  options?: string[];
};

export const DEVICE_FIELDS: FieldDef<keyof DeviceDetails>[] = [
  {
    key: "brand",
    label: "Brand",
    placeholder: "Apple, Samsung…",
    options: [
      "Apple",
      "Samsung",
      "Xiaomi",
      "Oppo",
      "Vivo",
      "Realme",
      "Infinix",
      "Tecno",
      "Poco",
      "Advan",
      "Itel",
      "Honor",
      "Huawei",
      "Asus",
      "Nokia",
      "Motorola",
    ],
  },
  { key: "model", label: "Model", placeholder: "iPhone 14 Pro" },
  { key: "imei", label: "IMEI", placeholder: "15-digit IMEI" },
  { key: "storage", label: "Storage", placeholder: "128 GB" },
  { key: "ram", label: "RAM", placeholder: "6 GB" },
  { key: "serial", label: "Serial number", placeholder: "Serial no." },
  { key: "processor", label: "Processor", placeholder: "A16 Bionic" },
  { key: "color", label: "Color", placeholder: "Graphite" },
];

export const OWNER_FIELDS: FieldDef<keyof OwnerDetails>[] = [
  { key: "name", label: "Owner name", placeholder: "Full name" },
  { key: "contact", label: "Contact", placeholder: "Phone or @social" },
  { key: "address", label: "Address", placeholder: "Street, city" },
];

export const emptyDevice = (): DeviceDetails => ({
  brand: "Apple",
  model: "",
  imei: "",
  storage: "",
  ram: "",
  serial: "",
  processor: "",
  color: "",
});

export const emptyOwner = (): OwnerDetails => ({
  name: "",
  contact: "",
  address: "",
});

export function countVerdicts(items: ItemResult[]): VerdictCounts {
  const counts: VerdictCounts = { pass: 0, fail: 0, na: 0 };
  for (const item of items) if (item.verdict) counts[item.verdict]++;
  return counts;
}

/** Display name for a device, falling back when nothing is filled in. */
export const deviceName = (device: Pick<DeviceDetails, "brand" | "model">) =>
  [device.brand, device.model].filter(Boolean).join(" ") || "Unspecified device";

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Today in the browser's local timezone as YYYY-MM-DD. */
export function localToday(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  const d = iso ? new Date(`${iso}T00:00:00`) : new Date();
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
