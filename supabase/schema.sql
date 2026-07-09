-- Supabase schema for the content automation pipeline.
-- Run in the Supabase SQL editor (or via `supabase db push`).

-- ---------- content_queue ----------
create table if not exists public.content_queue (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  source text not null,                 -- hackernews | github | google-trends | reddit
  score numeric not null default 0,
  category text not null,               -- dev-tools | saas | ai-tools | web-dev
  status text not null default 'queued',-- queued|drafted|approved|published|flagged|rejected
  title text,
  slug text,
  meta_description text,
  draft_markdown text,
  flags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists content_queue_status_idx on public.content_queue (status);
create index if not exists content_queue_score_idx on public.content_queue (score desc);
create unique index if not exists content_queue_slug_key on public.content_queue (slug) where slug is not null;

-- ---------- post_performance (Stage 5 monitoring) ----------
create table if not exists public.post_performance (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  page_url text not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  avg_position numeric,
  ctr numeric,
  indexed boolean default false,
  first_seen_at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);

create index if not exists post_performance_slug_idx on public.post_performance (slug);
create index if not exists post_performance_recorded_idx on public.post_performance (recorded_at desc);

-- Keep a rolling window; a scheduled job can flag declining/never-indexed posts.
-- RLS: these tables are only accessed via the service role from server code.
alter table public.content_queue enable row level security;
alter table public.post_performance enable row level security;
-- No public policies added on purpose: service role bypasses RLS.
