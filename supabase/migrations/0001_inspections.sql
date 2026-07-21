-- Phone Inspection Checklist — inspections table.
-- Run this in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists public.inspections (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  inspection_date   date not null,

  -- Device identity
  brand             text not null default '',
  model             text not null default '',
  imei              text not null default '',
  storage           text not null default '',
  ram               text not null default '',
  serial            text not null default '',
  processor         text not null default '',
  color             text not null default '',

  -- Owner
  owner_name        text not null default '',
  owner_contact     text not null default '',
  owner_address     text not null default '',

  inspector_name    text not null default '',

  grade             text check (grade in ('Excellent', 'Good', 'Fair', 'Poor')),
  overall_notes     text not null default '',

  -- Denormalised tallies so the dashboard never has to open `items`.
  pass_count        integer not null default 0 check (pass_count >= 0),
  fail_count        integer not null default 0 check (fail_count >= 0),
  na_count          integer not null default 0 check (na_count >= 0),

  -- [{ "id": "screen.touch_responsive", "verdict": "pass", "note": "" }, ...]
  -- `id` is a stable catalog slug, never an array index.
  items             jsonb not null default '[]'::jsonb,

  constraint items_is_array check (jsonb_typeof(items) = 'array')
);

-- Dashboard lists newest first.
create index if not exists inspections_created_at_idx
  on public.inspections (created_at desc);

-- Common lookups from the dashboard's search/filter.
create index if not exists inspections_device_idx
  on public.inspections (brand, model);

create index if not exists inspections_items_gin_idx
  on public.inspections using gin (items);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- The app has no login and never talks to Supabase from the browser. All reads
-- and writes go through Next.js Server Actions using the service role key,
-- which bypasses RLS. So: enable RLS and grant no policies at all. That makes
-- the table unreachable with the anon/publishable key even if it leaks.
-- ---------------------------------------------------------------------------
alter table public.inspections enable row level security;

revoke all on public.inspections from anon, authenticated;
