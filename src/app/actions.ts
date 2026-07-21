"use server";

import { revalidatePath } from "next/cache";
import { createInspection, deleteInspection } from "@/lib/db/inspections";
import { MissingSupabaseConfigError } from "@/lib/db/client";
import { ValidationError, parseInspectionInput } from "@/lib/validate";

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Persists an inspection. This is the only path that writes to Supabase — the
 * form holds everything in memory until the inspector presses Save.
 */
export async function saveInspection(payload: unknown): Promise<SaveResult> {
  try {
    const input = parseInspectionInput(payload);
    const saved = await createInspection(input);
    revalidatePath("/");
    return { ok: true, id: saved.id };
  } catch (error) {
    return { ok: false, error: messageFor(error) };
  }
}

export async function removeInspection(id: string): Promise<SaveResult> {
  try {
    if (!id) throw new ValidationError("Missing inspection id.");
    await deleteInspection(id);
    revalidatePath("/");
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: messageFor(error) };
  }
}

function messageFor(error: unknown): string {
  if (
    error instanceof ValidationError ||
    error instanceof MissingSupabaseConfigError
  ) {
    return error.message;
  }
  // Anything else may carry database internals — log it, return something safe.
  console.error("[saveInspection]", error);
  return "Something went wrong saving this inspection. Please try again.";
}
