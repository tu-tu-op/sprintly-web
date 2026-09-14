"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { SprintlySession } from "@/lib/sprintly/contract";
import { deriveShareSources, resolveShareSource } from "@/lib/sprintly/share/derive-share-data";
import { recommendShare } from "@/lib/sprintly/share/recommend-share";
import { resolveShareFormat, SHARE_THEMES, supportsTemplate } from "@/lib/sprintly/share/templates";
import type { ShareFormat, SharePrivacy, ShareSourceRequest, ShareSpec, ShareTemplate, ShareTheme } from "@/lib/sprintly/share/types";
import { ShareSourcePicker } from "./share-source-picker";
import { ShareTemplatePicker } from "./share-template-picker";
import { ShareFormatPicker } from "./share-format-picker";
import { SharePreview } from "./share-preview";
import { ShareActions } from "./share-actions";
import "./share-studio.css";

type Props = {
  sessions: SprintlySession[];
  privacy: SharePrivacy;
  timeZone: string;
  mode: "local" | "remote";
  request: ShareSourceRequest;
  onRefresh: () => void;
};

export function ShareStudio({ sessions, privacy, timeZone, mode, request, onRefresh }: Props) {
  const [now] = useState(() => new Date());
  const [includeTokens, setIncludeTokens] = useState(false);
  const [includeTerminal, setIncludeTerminal] = useState(false);
  const sources = useMemo(() => deriveShareSources(sessions, {
    now, timeZone,
    privacy: { showTokenUsage: privacy.showTokenUsage, showTerminalActivity: privacy.showTerminalActivity, includeTokenUsage: includeTokens, includeTerminalActivity: includeTerminal },
  }), [sessions, now, timeZone, privacy.showTokenUsage, privacy.showTerminalActivity, includeTokens, includeTerminal]);
  const [selection, setSelection] = useState<{ id: string; template: ShareTemplate } | null>(() => {
    const source = resolveShareSource(sources, request);
    if (source) return { id: source.id, template: recommendShare(source.data) };
    const hasRequest = request.sourceId || ["session", "weekly", "achievement", "streak", "record"].includes(request.kind ?? "");
    return hasRequest ? { id: "unavailable", template: "session-hero" } : null;
  });
  const [format, setFormat] = useState<ShareFormat>("portrait");
  const [theme, setTheme] = useState<ShareTheme>("graphite");
  const source = sources.find((item) => item.id === selection?.id);
  const template = selection && source && supportsTemplate(selection.template, source.data) ? selection.template : source ? recommendShare(source.data) : "session-hero";
  const spec = useMemo<ShareSpec | null>(() => source ? ({ version: 1, data: source.data, template, format: resolveShareFormat(template, format), theme }) : null, [source, template, format, theme]);

  return (
    <div className="share-studio">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.2em] text-[#a8bec9]">Made from your work</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Share Studio</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#a4a4a4]">{selection ? "Your accomplishment. Your style. Ready to share." : "What do you want to share? Turn a session, record, or milestone into a post."}</p>
        </div>
        <button type="button" className="share-secondary inline-flex items-center gap-2" onClick={onRefresh}><RefreshCw className="size-3.5" aria-hidden="true" />Refresh activity</button>
      </header>
      {mode === "local" && <p className="mb-6 rounded-xl border border-[#30343a] px-4 py-3 text-xs leading-5 text-[#b8b8b8]">Local mode · These posts use this browser’s demo or imported sessions.</p>}

      {selection && !source ? (
        <section className="panel p-6" aria-label="Unavailable share source">
          <h2 className="text-lg font-medium">{request.kind === "session" ? "This session is no longer available." : "This activity is not available to share."}</h2>
          <p className="mt-3 text-sm leading-6 text-[#a4a4a4]">It may have expired, been deleted, or be hidden by your privacy settings.</p>
          <button type="button" onClick={() => setSelection(null)} className="share-secondary mt-5">Choose another activity</button>
        </section>
      ) : !sessions.length || !sources.length ? (
        <section className="panel p-8 text-center">
          <h2 className="text-lg font-medium">No activity to share yet.</h2>
          <p className="mt-3 text-sm text-[#a4a4a4]">Complete or import a Sprintly session first.{mode === "remote" ? " Synchronize it to your account to use it on any device." : ""}</p>
          <Link className="share-secondary mt-6 inline-flex items-center" href="/app/settings">Connect or import sessions</Link>
        </section>
      ) : !source || !spec ? (
        <>
          <ShareSourcePicker sources={sources} onSelect={(item) => setSelection({ id: item.id, template: recommendShare(item.data) })} />
          <p className="mt-8 text-xs leading-5 text-[#93999f]">Records and recaps cover your available history. Synced activity stays private until you choose to share an image.</p>
        </>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setSelection(null)} className="share-secondary inline-flex items-center gap-2"><ArrowLeft className="size-4" aria-hidden="true" />Change activity</button>
            <div className="min-w-0"><h2 className="text-sm font-medium">{source.label}</h2><p className="mt-1 text-xs text-[#a4a4a4]">{source.summary}</p></div>
          </div>
          <div className="share-editor-grid">
            <div className="share-controls">
              <ShareTemplatePicker data={source.data} selected={template} onChange={(value) => setSelection({ id: source.id, template: value })} />
              <ShareFormatPicker selected={spec.format} onChange={setFormat} />
              <fieldset>
                <legend className="share-label">{template === "stat-sticker" ? "Ink" : "Background"}</legend>
                <div className="share-options">
                  {SHARE_THEMES.map((item) => <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => setTheme(item.id)} className="share-option inline-flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-full border border-[#737373]" style={{ background: item.color }} />{template === "stat-sticker" ? item.id === "graphite" ? "Light ink" : "Dark ink" : item.label}</button>)}
                </div>
              </fieldset>
              <details className="rounded-xl border border-[#30343a] px-4 py-3 text-xs text-[#b8b8b8]">
                <summary className="cursor-pointer py-1 font-medium">Optional statistics</summary>
                <p className="mt-3 leading-5">Include these only if you want them in the exported image.</p>
                <label className="mt-3 flex min-h-11 items-center gap-3"><input type="checkbox" checked={privacy.showTokenUsage && includeTokens} onChange={(event) => setIncludeTokens(event.target.checked)} disabled={!privacy.showTokenUsage} className="size-4 accent-[#c8d7df]" />AI token counts</label>
                <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={privacy.showTerminalActivity && includeTerminal} onChange={(event) => setIncludeTerminal(event.target.checked)} disabled={!privacy.showTerminalActivity} className="size-4 accent-[#c8d7df]" />Terminal activity counts</label>
                {(!privacy.showTokenUsage || !privacy.showTerminalActivity) && <p className="mt-2 leading-5">Some statistics are private in your account. <Link className="underline underline-offset-4" href="/app/settings">Manage privacy settings</Link></p>}
              </details>
              <p className="text-xs leading-5 text-[#93999f]">Your Devprint reflects coding mix, scores, and duration. It is a metric composition, not an event timeline.</p>
            </div>
            <SharePreview spec={spec} />
            <ShareActions key={JSON.stringify(spec)} spec={spec} />
          </div>
        </>
      )}
    </div>
  );
}
