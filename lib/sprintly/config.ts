export const SPRINTLY_EXTENSION_DEV_TOKEN_ENV = "SPRINTLY_EXTENSION_DEV_TOKEN";
export const SPRINTLY_EXTENSION_DEV_USER_ID_ENV = "SPRINTLY_EXTENSION_DEV_USER_ID";

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    "";

  return { url, key };
}

export function hasSupabasePublicConfig() {
  const { url, key } = getSupabasePublicConfig();
  return Boolean(url && key);
}

export function getDefaultRetentionDays() {
  const configured = Number(process.env.SPRINTLY_SESSION_RETENTION_DAYS ?? "365");
  return Number.isInteger(configured) && configured >= 1 && configured <= 3650 ? configured : 365;
}
