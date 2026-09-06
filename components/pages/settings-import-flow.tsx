"use client";

import { useRef, useState } from "react";
import { FileJson, X } from "lucide-react";

import { useSprintly } from "@/components/sprintly-provider";
import { aggregateSessions, formatDuration } from "@/lib/sprintly/analytics";
import { isSupportedImportFileSize, MAX_IMPORT_FILE_BYTES, parseSprintlyImportText, SPRINTLY_CONTRACT, type ImportValidation } from "@/lib/sprintly/contract";

export function SettingsImportFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sessions, importSessions } = useSprintly();
  const inputRef = useRef<HTMLInputElement>(null);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  if (!open) return null;

  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    if (!isSupportedImportFileSize(file.size)) {
      setValidation({ ok: false, sessions: [], duplicates: [], issues: [{ index: -1, message: `Choose an export under ${Math.floor(MAX_IMPORT_FILE_BYTES / 1_000_000)} MB.` }], contract: SPRINTLY_CONTRACT });
      return;
    }
    setReading(true);
    setValidation(parseSprintlyImportText(await file.text(), new Set(sessions.map((session) => session.record.sessionId))));
    setReading(false);
  };
  const close = () => { setValidation(null); setFileName(""); onClose(); };
  const confirm = () => { if (!validation?.sessions.length || validation.issues.length) return; importSessions(validation.sessions); close(); };
  const aggregate = validation ? aggregateSessions(validation.sessions) : null;

  return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] shadow-2xl"><div className="flex items-start justify-between border-b border-white/[.07] p-5"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[#bdbdbd]">Explicit handoff - Sprintly session v1</p><h2 className="mt-2 text-xl font-semibold">Import Sprintly JSON</h2><p className="mt-2 text-xs leading-5 text-[#858585]">Nothing enters local history until you confirm the validated preview.</p></div><button onClick={close} aria-label="Close import dialog" className="grid size-10 place-items-center rounded-lg text-[#7a7a7a]"><X className="size-4" /></button></div><div className="space-y-4 p-5"><input ref={inputRef} type="file" accept=".json,application/json" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} /><button onClick={() => inputRef.current?.click()} className="flex min-h-[132px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/[.16] bg-white/[.02] text-sm text-[#c1c1c1]"><FileJson className="mb-3 size-6" />{reading ? "Reading export..." : fileName || "Select a .json export"}<span className="mt-2 text-[10px] text-[#777777]">Local file access is limited to this explicit selection.</span></button>{validation && <>{aggregate && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl border border-white/[.07] p-3"><p className="mono text-lg font-semibold">{validation.sessions.length}</p><p className="text-[10px] text-[#7d7d7d]">sessions ready</p></div><div className="rounded-xl border border-white/[.07] p-3"><p className="mono text-lg font-semibold">{formatDuration(aggregate.activeDurationSeconds)}</p><p className="text-[10px] text-[#7d7d7d]">coding time</p></div><div className="rounded-xl border border-white/[.07] p-3"><p className="mono text-lg font-semibold">{aggregate.coding.manualPercent}%</p><p className="text-[10px] text-[#7d7d7d]">manual</p></div><div className="rounded-xl border border-white/[.07] p-3"><p className="mono text-lg font-semibold">{aggregate.reliability.recoveryRate}%</p><p className="text-[10px] text-[#7d7d7d]">recovery</p></div></div>}{validation.issues.length > 0 && <div className="rounded-xl border border-[#b7b7b7]/25 p-4"><p className="text-sm font-medium">{validation.issues.length} record{validation.issues.length === 1 ? "" : "s"} rejected</p><ul className="mt-2 space-y-1 text-xs leading-5 text-[#9f9f9f]">{validation.issues.slice(0, 5).map((issue) => <li key={`${issue.index}-${issue.message}`}>Record {issue.index + 1}: {issue.message}</li>)}</ul></div>}{validation.duplicates.length > 0 && <p className="rounded-xl border border-white/[.07] p-4 text-xs text-[#9b9b9b]">{validation.duplicates.length} duplicate record{validation.duplicates.length === 1 ? "" : "s"} will be skipped.</p>}</>}</div><div className="flex justify-end gap-2 border-t border-white/[.07] p-5"><button onClick={close} className="min-h-11 rounded-lg border border-white/[.09] px-4 text-sm">Cancel</button><button onClick={confirm} disabled={!validation?.sessions.length || Boolean(validation.issues.length)} className="min-h-11 rounded-lg bg-[#f2f2f2] px-4 text-sm font-semibold text-[#0b0b0b] disabled:opacity-40">Import validated sessions</button></div></div></div>;
}

