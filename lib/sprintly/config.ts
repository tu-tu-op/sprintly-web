export const SPRINTLY_EXTENSION_DEV_TOKEN_ENV = "SPRINTLY_EXTENSION_DEV_TOKEN";
export const SPRINTLY_EXTENSION_DEV_USER_ID_ENV = "SPRINTLY_EXTENSION_DEV_USER_ID";

export const SPRINTLY_CONTRACT_ENV = "SPRINTLY_CONTRACT";
export const SPRINTLY_SCHEMA_VERSION_ENV = "SPRINTLY_SCHEMA_VERSION";

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

export function getSprintlyContractConfig() {
  return {
    contract: process.env[SPRINTLY_CONTRACT_ENV] ?? "devstrava.session.v1",
    schemaVersion: Number(process.env[SPRINTLY_SCHEMA_VERSION_ENV] ?? "1"),
  };
}

