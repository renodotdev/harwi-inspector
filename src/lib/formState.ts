import {
  type DeviceDetails,
  type Grade,
  type Inspection,
  type InspectionInput,
  type ItemResult,
  type OwnerDetails,
  type Verdict,
  emptyDevice,
  emptyOwner,
} from "./inspection";

/**
 * The in-progress inspection. Field-for-field the persisted shape, except
 * results are keyed by item id for O(1) row lookups while editing.
 */
export type Draft = {
  inspectionDate: string;
  device: DeviceDetails;
  owner: OwnerDetails;
  inspectorName: string;
  grade: Grade | null;
  overallNotes: string;
  results: Record<string, { verdict: Verdict | null; note: string }>;
};

export type FormState = {
  draft: Draft;
  /** Purely presentational: which note editors are expanded. */
  openNotes: Record<string, boolean>;
  /** Whether the review overlay is showing. */
  reviewing: boolean;
};

export type FormAction =
  | { type: "setVerdict"; key: string; verdict: Verdict }
  | { type: "toggleNoteEditor"; key: string }
  | { type: "setNote"; key: string; note: string }
  | { type: "setDevice"; key: keyof DeviceDetails; value: string }
  | { type: "setOwner"; key: keyof OwnerDetails; value: string }
  | { type: "setInspectorName"; value: string }
  | { type: "setGrade"; grade: Grade }
  | { type: "setOverallNotes"; notes: string }
  | { type: "setDate"; date: string }
  | { type: "review" }
  | { type: "edit" }
  | { type: "reset"; date: string };

export function emptyDraft(date: string): Draft {
  return {
    inspectionDate: date,
    device: emptyDevice(),
    owner: emptyOwner(),
    inspectorName: "",
    grade: null,
    overallNotes: "",
    results: {},
  };
}

export function initialState(date: string): FormState {
  return { draft: emptyDraft(date), openNotes: {}, reviewing: false };
}

/** Rehydrate a saved inspection back into an editable draft. */
export function draftFromInspection(inspection: Inspection): Draft {
  return {
    inspectionDate: inspection.inspectionDate,
    device: inspection.device,
    owner: inspection.owner,
    inspectorName: inspection.inspectorName,
    grade: inspection.grade,
    overallNotes: inspection.overallNotes,
    results: Object.fromEntries(
      inspection.items.map((i) => [i.id, { verdict: i.verdict, note: i.note }]),
    ),
  };
}

/**
 * Flatten a draft into the payload the server persists. Item order follows the
 * catalog, and undecided checks are dropped unless they carry a note.
 */
export function draftToInput(
  draft: Draft,
  itemOrder: string[],
): InspectionInput {
  const items: ItemResult[] = [];
  for (const id of itemOrder) {
    const result = draft.results[id];
    // An item with only a note is still worth keeping.
    if (result && (result.verdict || result.note)) {
      items.push({ id, verdict: result.verdict, note: result.note });
    }
  }
  return {
    inspectionDate: draft.inspectionDate,
    device: draft.device,
    owner: draft.owner,
    inspectorName: draft.inspectorName,
    grade: draft.grade,
    overallNotes: draft.overallNotes,
    items,
  };
}

function patchDraft(state: FormState, draft: Partial<Draft>): FormState {
  return { ...state, draft: { ...state.draft, ...draft } };
}

/** Writes a result, dropping the entry entirely once it holds nothing. */
function withResult(
  results: Draft["results"],
  key: string,
  result: { verdict: Verdict | null; note: string },
): Draft["results"] {
  const next = { ...results };
  if (!result.verdict && !result.note) delete next[key];
  else next[key] = result;
  return next;
}

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "setVerdict": {
      const current = state.draft.results[action.key];
      // Tapping the active verdict again clears it, but keeps any note.
      const verdict = current?.verdict === action.verdict ? null : action.verdict;
      return patchDraft(state, {
        results: withResult(state.draft.results, action.key, {
          verdict,
          note: current?.note ?? "",
        }),
      });
    }
    case "setNote": {
      const current = state.draft.results[action.key];
      return patchDraft(state, {
        results: withResult(state.draft.results, action.key, {
          verdict: current?.verdict ?? null,
          note: action.note,
        }),
      });
    }
    case "toggleNoteEditor":
      return {
        ...state,
        openNotes: {
          ...state.openNotes,
          [action.key]: !state.openNotes[action.key],
        },
      };
    case "setDevice":
      return patchDraft(state, {
        device: { ...state.draft.device, [action.key]: action.value },
      });
    case "setOwner":
      return patchDraft(state, {
        owner: { ...state.draft.owner, [action.key]: action.value },
      });
    case "setInspectorName":
      return patchDraft(state, { inspectorName: action.value });
    case "setGrade":
      return patchDraft(state, {
        grade: state.draft.grade === action.grade ? null : action.grade,
      });
    case "setOverallNotes":
      return patchDraft(state, { overallNotes: action.notes });
    case "setDate":
      return patchDraft(state, { inspectionDate: action.date });
    case "review":
      return { ...state, reviewing: true };
    case "edit":
      return { ...state, reviewing: false };
    case "reset":
      return initialState(action.date);
  }
}
