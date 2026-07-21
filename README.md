# Phone Inspection Checklist

Inspect used smartphones against a 42-point checklist, save each inspection to
Supabase, and browse the history from a dashboard. Mark every check Pass / Fail
/ N/A with an optional note, assign an overall grade, then save and/or print a
condition report.

There is no login — the app is public by design.

Implemented from the Claude Design project
[Phone Inspection Checklist Form](https://claude.ai/design/p/04f8abda-cfae-44f8-a22f-be34c0aa5ab4).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev                  # http://localhost:3000
```

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/migrations/0001_inspections.sql`](supabase/migrations/0001_inspections.sql).
3. From **Project Settings → API**, copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Restart the dev server.

Until those are set the dashboard shows setup instructions and Save reports that
Supabase isn't configured; the checklist itself still works.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Dashboard — table of saved inspections, searchable, with **New inspection** |
| `/inspections/new` | The checklist form |
| `/inspections/[id]` | A saved inspection, rendered as a printable report |

## Security model

The browser never talks to Supabase. Every read and write goes through a Next.js
Server Action or Server Component using the **service role** key, which stays on
the server (`src/lib/db/client.ts` imports `server-only`, so leaking it into a
Client Component is a build error).

The table therefore has RLS enabled with **no policies at all** — it is
unreachable with the anon/publishable key. That keeps a public, login-free app
from handing every visitor read/write access to the whole table.

Payloads from the browser are re-validated server-side in `src/lib/validate.ts`:
unknown item ids are dropped, text is trimmed and length-capped, and pass/fail/na
tallies are recomputed from the items rather than trusted from the client.

## Data model

One `inspections` row per inspection. The fields the dashboard sorts and filters
on are real columns; the 42 per-item results live in a JSONB `items` array:

```jsonc
{
  "id": "uuid",
  "inspection_date": "2026-07-21",
  "brand": "Apple", "model": "iPhone 14 Pro", // + imei, storage, ram, …
  "owner_name": "…", "inspector_name": "…",
  "grade": "Good",
  "pass_count": 38, "fail_count": 2, "na_count": 2,
  "items": [
    { "id": "screen.touch_responsive", "verdict": "pass", "note": "" },
    { "id": "screen.no_cracks", "verdict": "fail", "note": "Hairline scratch" }
  ]
}
```

**Item ids are stable slugs (`section.item`), never array indexes.** Reordering,
inserting or retiring a check therefore never remaps historical data. Renaming an
`id` in `src/lib/inspection.ts` is a data migration; renaming a `label` is not.

Items the inspector never touched are simply absent. `verdict: null` means they
left a note but no verdict.

## Layout

| Path | Purpose |
| --- | --- |
| `src/lib/inspection.ts` | The catalog + canonical record types — the single source of truth |
| `src/lib/formState.ts` | Reducer over an in-progress `Draft`, and `draftToInput()` |
| `src/lib/validate.ts` | Parses untrusted payloads into a safe `InspectionInput` |
| `src/lib/report.ts` | Pure `buildReport()` — drives both the live preview and saved reports |
| `src/lib/db/client.ts` | Service-role Supabase client (`server-only`) |
| `src/lib/db/inspections.ts` | Row ↔ record mapping, list/get/create/delete |
| `src/app/actions.ts` | Server Actions — the only write path |
| `src/components/InspectionsTable.tsx` | Dashboard table + search |
| `src/components/InspectionForm.tsx` | The checklist form |
| `src/components/InspectionReport.tsx` | `ReportCard` + `ReportOverlay`, shared by form and detail page |
| `src/app/globals.css` | Design tokens (`@theme`) and print rules |

## Branding

Drop the HarwiGadget logo at **`public/logo.png`** (any web image format works —
update `LOGO_SRC` in `src/components/Logo.tsx` if you use a different
extension). Until that file exists, `Logo` renders a CSS wordmark in the brand
colours, so the header is never broken. No code change is needed once you add
it.

The theme is driven by the logo's orange (`--color-brand`, `#F0A030`) and
charcoal, defined in `src/app/globals.css`. Note that brand orange is a *fill*
colour: white text on it only reaches ~2.1:1 contrast, so buttons pair it with
`ink` (≈5.5:1) and orange *text* on light surfaces uses the darkened
`--color-brand-text`.

## Notes

- **Nothing is written to Supabase until Save is confirmed.** The draft lives in
  memory, so reloading a half-finished checklist loses it.
- Save, Reset and leaving the form with unsaved changes all go through a
  confirmation dialog (`src/components/ConfirmDialog.tsx`). The save prompt
  summarises what is about to be stored and warns about undecided checks.
- Save and Print are separate actions. Print isolates `#printArea`, so only the
  report reaches paper.
- Colours come from the design's oklch palette as Tailwind v4 theme tokens in
  `globals.css` — no raw hex in components.
- `LocaleDate` defers locale-dependent date formatting to the client so
  server/client hydration stays deterministic.
