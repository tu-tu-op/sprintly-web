begin;

select plan(8);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'user_preferences', 'preferences table exists');
select has_table('public', 'extension_devices', 'devices table exists');
select has_table('public', 'sessions', 'sessions table exists');
select has_table('public', 'leaderboard_entries', 'leaderboard table exists');
select has_table('public', 'leaderboard_periods', 'leaderboard periods table exists');

insert into auth.users (id, email, aud, role, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000002'::uuid, 'rls-two@example.com', 'authenticated', 'authenticated', now())
on conflict (id) do nothing;

insert into public.sessions (
  user_id,
  session_id,
  started_at,
  ended_at,
  active_duration_seconds,
  aggregate_payload,
  retention_expires_at
)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'rls-own-session',
  now() - interval '10 minutes',
  now(),
  300,
  '{}'::jsonb,
  now() + interval '1 day'
)
on conflict (user_id, session_id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select is((select count(*)::integer from public.sessions where session_id = 'rls-own-session'), 1, 'authenticated user can read own session');
select is((select count(*)::integer from public.sessions where user_id = '00000000-0000-0000-0000-000000000002'::uuid), 0, 'authenticated user cannot read another user session');
reset role;

select * from finish();
rollback;
