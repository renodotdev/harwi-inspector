import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS, so it must never be imported
 * into a Client Component — the `server-only` guard above turns any such
 * import into a build error.
 */
let cached: SupabaseClient | null = null;

export class MissingSupabaseConfigError extends Error {
  constructor(missing: string[]) {
    super(
      `Supabase is not configured. Missing ${missing.join(" and ")}. ` +
        `Copy .env.example to .env.local and fill in the values from your ` +
        `Supabase project settings (API).`,
    );
    this.name = "MissingSupabaseConfigError";
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function supabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new MissingSupabaseConfigError(missing);

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
