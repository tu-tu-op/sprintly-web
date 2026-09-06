create or replace function public.get_public_profile(target_handle text)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  bio text,
  avatar_url text,
  avatar_style text,
  country text,
  region text,
  city_label text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.user_id,
    p.display_name,
    p.handle,
    p.bio,
    p.avatar_url,
    p.avatar_style,
    p.country,
    p.region,
    p.city_label
  from public.profiles as p
  join public.user_preferences as up on up.user_id = p.user_id
  where p.handle = lower(trim(target_handle))
    and p.profile_visibility = 'public'
    and up.public_profile_consent = true;
$$;

create or replace function public.get_public_leaderboard(
  target_period_id uuid,
  target_scope_type text,
  target_scope_key text
)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  handle text,
  score numeric,
  focus_time_seconds integer,
  session_count integer,
  consistency_score numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    row_number() over (
      order by e.score desc, e.focus_time_seconds desc, e.session_count desc, e.created_at asc
    ) as rank,
    e.user_id,
    p.display_name,
    p.handle,
    e.score,
    e.focus_time_seconds,
    e.session_count,
    e.consistency_score
  from public.leaderboard_entries as e
  join public.profiles as p on p.user_id = e.user_id
  join public.user_preferences as up on up.user_id = e.user_id
  where e.period_id = target_period_id
    and e.scope_type = lower(trim(target_scope_type))
    and e.scope_key = trim(target_scope_key)
    and e.revoked_at is null
    and e.retention_expires_at > timezone('utc', now())
    and up.leaderboard_opt_in = true
  order by e.score desc, e.focus_time_seconds desc, e.session_count desc, e.created_at asc
  limit 100;
$$;

create or replace function public.revoke_user_leaderboard_entries(target_user_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
  with revoked as (
    update public.leaderboard_entries
    set revoked_at = timezone('utc', now())
    where user_id = target_user_id
      and revoked_at is null
    returning 1
  )
  select count(*)::integer from revoked;
$$;

create or replace function public.cleanup_expired_sprintly_data()
returns table (
  deleted_sessions bigint,
  revoked_leaderboard_entries bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_session_count bigint;
  revoked_leaderboard_count bigint;
begin
  delete from public.sessions
  where retention_expires_at <= timezone('utc', now());
  get diagnostics deleted_session_count = row_count;

  update public.leaderboard_entries
  set revoked_at = timezone('utc', now())
  where retention_expires_at <= timezone('utc', now())
    and revoked_at is null;
  get diagnostics revoked_leaderboard_count = row_count;

  return query select deleted_session_count, revoked_leaderboard_count;
end;
$$;

revoke all on function public.get_public_profile(text) from public, anon, authenticated;
grant execute on function public.get_public_profile(text) to anon, authenticated;

revoke all on function public.get_public_leaderboard(uuid, text, text) from public, anon, authenticated;
grant execute on function public.get_public_leaderboard(uuid, text, text) to anon, authenticated;

revoke all on function public.revoke_user_leaderboard_entries(uuid) from public, anon, authenticated;
grant execute on function public.revoke_user_leaderboard_entries(uuid) to service_role;

revoke all on function public.cleanup_expired_sprintly_data() from public, anon, authenticated;
grant execute on function public.cleanup_expired_sprintly_data() to service_role;

