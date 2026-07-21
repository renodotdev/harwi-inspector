const STEPS = [
  "Create a project at supabase.com, then open SQL Editor.",
  "Paste and run supabase/migrations/0001_inspections.sql.",
  "Copy .env.example to .env.local.",
  "Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from Project Settings → API.",
  "Restart the dev server.",
];

export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-line-brand bg-surface-brand px-6 py-5">
      <h2 className="m-0 mb-1.5 text-[15px] font-bold text-ink">
        Connect Supabase to start saving inspections
      </h2>
      <p className="m-0 mb-3 text-[13.5px] text-ink-subtle">
        The checklist works without a database, but Save needs somewhere to put
        the record.
      </p>
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className="flex gap-2.5 text-[13px] text-ink-body"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-ink">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
