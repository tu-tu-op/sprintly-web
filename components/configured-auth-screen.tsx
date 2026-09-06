"use client";

import { AuthScreen, type AuthMode } from "@/components/auth-onboarding";
import { hasSupabasePublicConfig } from "@/lib/sprintly/config";
import { SupabaseAuthScreen, type SupabaseAuthMode } from "@/components/supabase-auth-screen";

export function ConfiguredAuthScreen({ mode }: { mode: AuthMode }) {
  return hasSupabasePublicConfig()
    ? <SupabaseAuthScreen mode={mode as SupabaseAuthMode} />
    : <AuthScreen mode={mode} />;
}

