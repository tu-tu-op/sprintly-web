"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Flame, Timer, Trophy } from "lucide-react";
import type { ShareSource } from "@/lib/sprintly/share/types";

const groups = [
  { label: "Recent sessions", icon: Timer },
  { label: "Personal records", icon: Trophy },
  { label: "Recaps", icon: CalendarDays },
  { label: "Milestones", icon: Flame },
] as const;

export function ShareSourcePicker({ sources, onSelect }: { sources: ShareSource[]; onSelect: (source: ShareSource) => void }) {
  const [limits, setLimits] = useState<Record<string, number>>({});
  return (
    <div className="space-y-8">
      {groups.map(({ label, icon: Icon }) => {
        const items = sources.filter((source) => source.group === label);
        const limit = limits[label] ?? 4;
        if (!items.length) return null;
        return (
          <section key={label} aria-label={label}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#c4c4c4]"><Icon className="size-4" aria-hidden="true" />{label}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.slice(0, limit).map((source) => (
                <button key={source.id} type="button" data-share-source={source.id} onClick={() => onSelect(source)} className="share-source-card" aria-label={`Create post: ${source.label}, ${source.summary}`}>
                  <span className="flex items-start justify-between gap-3 text-sm text-[#b8b8b8]">
                    {source.label}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="mono mt-5 block text-2xl font-semibold tracking-tight text-[#f2f0e9]">{source.data.primaryMetric.value}</span>
                  <span className="mt-2 block text-xs leading-5 text-[#a4a4a4]">{source.kind === "session" ? `${source.data.archetype} · Focus ${source.data.scores?.focus}` : source.summary}</span>
                  <span className="mt-5 block text-xs font-medium text-[#d0dce0]">Create post <span aria-hidden="true">→</span></span>
                </button>
              ))}
            </div>
            {items.length > limit && <button type="button" className="share-secondary mt-3" onClick={() => setLimits((current) => ({ ...current, [label]: limit + 8 }))}>Show more {label.toLowerCase()}</button>}
          </section>
        );
      })}
    </div>
  );
}
