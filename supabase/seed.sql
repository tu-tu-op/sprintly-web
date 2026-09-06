-- Local-only seed data. It contains no production credentials or activity data.
do $$
begin
  if to_regclass('auth.users') is not null then
    insert into auth.users (
      id,
      email,
      raw_user_meta_data,
      aud,
      role,
      email_confirmed_at
    )
    values (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'sprintly.test@example.com',
      '{"display_name":"Sprintly Test User"}'::jsonb,
      'authenticated',
      'authenticated',
      now()
    )
    on conflict (id) do nothing;
  end if;
end;
$$;

update public.user_preferences
set
  sync_preference = 'completed',
  retention_duration_days = 365,
  ai_usage_visibility = true,
  terminal_activity_visibility = true
where user_id = '00000000-0000-0000-0000-000000000001'::uuid;
