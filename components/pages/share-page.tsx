"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSprintly } from "@/components/sprintly-provider";
import { ShareStudio } from "@/components/share/share-studio";
import { accountShareSessions } from "@/lib/sprintly/share/derive-share-data";

export function SharePage() {
  const search = useSearchParams();
  const { sessions, userId, preferences, repositoryMode, repositoryReady, syncLoading, syncError, refresh } = useSprintly();
  const records = useMemo(() => accountShareSessions(sessions, repositoryMode), [sessions, repositoryMode]);

  // LocalStorage hydration is not proof that a remote account was loaded.
  // In particular, cached/deleted/expired extension records cannot be shared.
  if (repositoryMode === "remote" && (!repositoryReady || syncLoading)) {
    return <section className="panel p-8" aria-busy={syncLoading || !syncError}>
      <h1 className="text-2xl font-semibold">Share Studio</h1>
      <p role="status" className="mt-4 text-sm text-[#b8b8b8]">{syncError ? "Couldn’t load your account activity. Reconnect and try again." : "Loading your account activity…"}</p>
      {syncError && <button type="button" onClick={() => void refresh()} className="mt-5 min-h-11 rounded-lg border border-white/20 px-4 text-sm">Retry account load</button>}
    </section>;
  }

  return <ShareStudio
    key={`${userId}:${search.toString()}`}
    sessions={records}
    privacy={preferences}
    timeZone={preferences.timeZone}
    mode={repositoryMode}
    request={{ kind: search.get("kind"), sessionId: search.get("sessionId"), achievementId: search.get("achievementId"), sourceId: search.get("sourceId") }}
    onRefresh={() => void refresh()}
  />;
}
