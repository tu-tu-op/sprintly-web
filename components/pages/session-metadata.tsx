"use client";

import { useSprintly } from "@/components/sprintly-provider";
import type { StoredSession } from "@/lib/sprintly/storage";

function sourceLabel(source: StoredSession["source"]) {
  return source === "extension" ? "Extension" : source === "imported" ? "Imported" : "Local";
}

export function SessionMetadata({ sessionId }: { sessionId: string }) {
  const { sessions } = useSprintly();
  const stored = sessions.find((item) => item.record.sessionId === sessionId);
  if (!stored) return null;
  const received = stored.receivedAt ?? stored.importedAt;
  return <div className="flex flex-wrap items-center gap-2 border-b border-white/[.07] px-4 py-3 text-[10px] text-[#858585]"><span className="rounded-full border border-white/[.1] px-2 py-1">Source: {sourceLabel(stored.source)}</span><span className="rounded-full border border-white/[.1] px-2 py-1">Sync: {stored.syncStatus}</span><span className="rounded-full border border-white/[.1] px-2 py-1">Verification: {stored.verified ? "Verified" : "Server validated / unverified signature"}</span><span className="rounded-full border border-white/[.1] px-2 py-1">Received: {new Date(received).toLocaleString()}</span></div>;
}

