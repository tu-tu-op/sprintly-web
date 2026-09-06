create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  device_id uuid references public.extension_devices(id) on delete set null,
  contract text not null default 'devstrava.session.v1'
    check (contract = 'devstrava.session.v1'),
  schema_version smallint not null default 1
    check (schema_version = 1),
  started_at timestamptz not null,
  ended_at timestamptz,
  active_duration_seconds integer not null default 0
    check (active_duration_seconds between 0 and 604800),
  focus_score numeric(7, 3)
    check (focus_score is null or focus_score between 0 and 1000),
  dev_score integer
    check (dev_score is null or dev_score between 0 and 1000),
  consistency_score numeric(7, 3)
    check (consistency_score is null or consistency_score between 0 and 100),
  testing_discipline_score numeric(7, 3)
    check (testing_discipline_score is null or testing_discipline_score between 0 and 100),
  recovery_score numeric(7, 3)
    check (recovery_score is null or recovery_score between 0 and 100),
  ai_balance_score numeric(7, 3)
    check (ai_balance_score is null or ai_balance_score between 0 and 100),
  aggregate_payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(aggregate_payload) = 'object'),
  signature text,
  public_key_id text,
  verified boolean not null default false,
  received_at timestamptz not null default timezone('utc', now()),
  retention_expires_at timestamptz not null,
  constraint sessions_session_id_length check (char_length(session_id) between 1 and 200),
  constraint sessions_ended_after_started check (ended_at is null or ended_at >= started_at),
  unique (user_id, session_id)
);

create index sessions_user_started_idx
  on public.sessions (user_id, started_at desc);

create index sessions_user_retention_idx
  on public.sessions (user_id, retention_expires_at);

create index sessions_leaderboard_score_idx
  on public.sessions (dev_score desc, active_duration_seconds desc, started_at desc);
