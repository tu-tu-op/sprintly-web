create table public.extension_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  device_name text not null default 'Sprintly extension',
  device_type text not null default 'vscode'
    check (device_type in ('vscode', 'desktop', 'other')),
  token_hash text not null unique,
  public_key_id text,
  created_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  constraint extension_devices_device_id_length check (char_length(device_id) between 8 and 160),
  constraint extension_devices_device_name_length check (char_length(device_name) between 1 and 120),
  constraint extension_devices_token_hash_length check (char_length(token_hash) = 64),
  unique (user_id, device_id)
);

create index extension_devices_user_id_idx
  on public.extension_devices (user_id, created_at desc);

create index extension_devices_active_token_idx
  on public.extension_devices (token_hash)
  where revoked_at is null;

create table public.extension_pairing_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint extension_pairing_codes_hash_length check (char_length(code_hash) = 64),
  constraint extension_pairing_codes_expiry_after_creation check (expires_at > created_at)
);

create index extension_pairing_codes_user_id_idx
  on public.extension_pairing_codes (user_id, created_at desc);

create index extension_pairing_codes_active_idx
  on public.extension_pairing_codes (code_hash, expires_at)
  where consumed_at is null;

