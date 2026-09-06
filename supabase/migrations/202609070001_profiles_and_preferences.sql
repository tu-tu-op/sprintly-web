create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Sprintly user',
  handle text not null unique,
  bio text not null default '',
  avatar_url text,
  avatar_style text not null default 'gradient',
  country text,
  region text,
  city_label text,
  profile_visibility text not null default 'private'
    check (profile_visibility in ('private', 'public')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_handle_format check (
    handle = lower(handle)
    and handle ~ '^[a-z0-9_][a-z0-9_-]{2,31}$'
  ),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_bio_length check (char_length(bio) <= 1000)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sync_preference text not null default 'never'
    check (sync_preference in ('never', 'selected', 'completed', 'leaderboard')),
  timezone text not null default 'UTC',
  retention_duration_days integer not null default 365
    check (retention_duration_days between 1 and 3650),
  ai_usage_visibility boolean not null default false,
  terminal_activity_visibility boolean not null default false,
  leaderboard_opt_in boolean not null default false,
  leaderboard_scope text not null default 'global'
    check (leaderboard_scope in ('global', 'country', 'region')),
  public_profile_consent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    user_id,
    display_name,
    handle
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Sprintly user'),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
  )
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

