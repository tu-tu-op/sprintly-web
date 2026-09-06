alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.extension_devices enable row level security;
alter table public.extension_pairing_codes enable row level security;
alter table public.sessions enable row level security;
alter table public.consent_events enable row level security;
alter table public.leaderboard_periods enable row level security;
alter table public.leaderboard_entries enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.user_preferences from anon;
revoke all on table public.extension_devices from anon;
revoke all on table public.extension_pairing_codes from anon, authenticated;
revoke all on table public.sessions from anon;
revoke all on table public.consent_events from anon;
revoke all on table public.leaderboard_periods from anon;
revoke all on table public.leaderboard_entries from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;
grant select, update, delete on table public.extension_devices to authenticated;
grant select, insert, delete on table public.sessions to authenticated;
grant select, insert on table public.consent_events to authenticated;
grant select on table public.leaderboard_periods to authenticated;
grant select, delete on table public.leaderboard_entries to authenticated;

create policy profiles_select_own
on public.profiles for select to authenticated
using (user_id = auth.uid());

create policy profiles_insert_own
on public.profiles for insert to authenticated
with check (user_id = auth.uid());

create policy profiles_update_own
on public.profiles for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy profiles_delete_own
on public.profiles for delete to authenticated
using (user_id = auth.uid());

create policy preferences_select_own
on public.user_preferences for select to authenticated
using (user_id = auth.uid());

create policy preferences_insert_own
on public.user_preferences for insert to authenticated
with check (user_id = auth.uid());

create policy preferences_update_own
on public.user_preferences for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy preferences_delete_own
on public.user_preferences for delete to authenticated
using (user_id = auth.uid());

create policy devices_select_own
on public.extension_devices for select to authenticated
using (user_id = auth.uid());

create policy devices_update_own
on public.extension_devices for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy devices_delete_own
on public.extension_devices for delete to authenticated
using (user_id = auth.uid());

create policy sessions_select_own
on public.sessions for select to authenticated
using (user_id = auth.uid());

create policy sessions_insert_own_unverified
on public.sessions for insert to authenticated
with check (
  user_id = auth.uid()
  and verified = false
);

create policy sessions_delete_own
on public.sessions for delete to authenticated
using (user_id = auth.uid());

create policy consent_events_select_own
on public.consent_events for select to authenticated
using (user_id = auth.uid());

create policy consent_events_insert_own
on public.consent_events for insert to authenticated
with check (user_id = auth.uid());

create policy leaderboard_periods_read
on public.leaderboard_periods for select to authenticated
using (true);

create policy leaderboard_entries_select_own
on public.leaderboard_entries for select to authenticated
using (user_id = auth.uid());

create policy leaderboard_entries_delete_own
on public.leaderboard_entries for delete to authenticated
using (user_id = auth.uid());

