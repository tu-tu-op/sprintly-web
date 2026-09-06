create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null
    check (consent_type in (
      'session_sync',
      'ai_usage_statistics',
      'terminal_activity_statistics',
      'leaderboard_participation',
      'public_profile',
      'geographic_leaderboard'
    )),
  action text not null check (action in ('granted', 'revoked')),
  created_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object')
);

create index consent_events_user_created_idx
  on public.consent_events (user_id, created_at desc);

create table public.leaderboard_periods (
  id uuid primary key default gen_random_uuid(),
  period_type text not null default 'weekly'
    check (period_type = 'weekly'),
  period_key text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  constraint leaderboard_periods_bounds check (ends_at > starts_at),
  unique (period_type, period_key)
);

create index leaderboard_periods_bounds_idx
  on public.leaderboard_periods (starts_at, ends_at);

create table public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.leaderboard_periods(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scope_type text not null
    check (scope_type in ('global', 'country', 'region')),
  scope_key text not null,
  score numeric(10, 3) not null check (score between 0 and 1000),
  focus_time_seconds integer not null default 0 check (focus_time_seconds >= 0),
  session_count integer not null default 0 check (session_count >= 0),
  consistency_score numeric(7, 3) not null default 0
    check (consistency_score between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  retention_expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint leaderboard_entries_scope_key_length check (char_length(scope_key) between 1 and 120),
  unique (period_id, user_id, scope_type, scope_key)
);

create index leaderboard_entries_rank_idx
  on public.leaderboard_entries (
    period_id,
    scope_type,
    scope_key,
    score desc,
    focus_time_seconds desc,
    created_at asc
  )
  where revoked_at is null;

create index leaderboard_entries_retention_idx
  on public.leaderboard_entries (retention_expires_at)
  where revoked_at is null;

