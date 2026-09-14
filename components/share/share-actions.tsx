"use client";

import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle, Share2 } from "lucide-react";
import type { ShareSpec } from "@/lib/sprintly/share/types";

type ExportEngine = typeof import("@/lib/sprintly/share/export");

/** Remounted for each spec so a prepared PNG can never outlive its source or privacy choices. */
export function ShareActions({ spec }: { spec: ShareSpec }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const prepared = useRef<{ file: File; engine: ExportEngine } | null>(null);
  const active = useRef(true);
  const inFlight = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  const run = async (action: "share" | "download") => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      let output = prepared.current;
      const justRendered = !output;
      if (!output) {
        const engine = await import("@/lib/sprintly/share/export");
        const blob = await engine.renderShareImage(spec);
        if (!active.current) return;
        output = { file: new File([blob], engine.shareFilename(spec), { type: "image/png" }), engine };
        prepared.current = output;
      }
      // On a second tap this path has no async work before navigator.share.
      if (action === "download") {
        output.engine.downloadShareFile(output.file);
        setMessage("Your PNG is ready in downloads.");
        setReady(false);
      } else {
        const outcome = await output.engine.shareOrDownload(output.file, spec.data.title, justRendered);
        if (!active.current) return;
        setReady(outcome === "ready");
        setMessage(outcome === "ready" ? "Your image is ready. Tap Share image to open your share sheet." : outcome === "downloaded" ? "File sharing isn’t available here. Your PNG was downloaded." : outcome === "shared" ? "Image shared." : "");
      }
    } catch {
      if (active.current) setMessage("Couldn’t create this image. Please try again or use Download PNG.");
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  };

  return (
    <div className="share-actions" aria-busy={busy}>
      <p role="status" aria-live="polite" className="share-actions-message">{busy ? "Preparing your image…" : message}</p>
      <div className="flex gap-2">
        <button type="button" data-share-action="share" onClick={() => void run("share")} disabled={busy} className="share-primary">
          {busy ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
          {ready ? "Share image" : "Share"}
        </button>
        <button type="button" data-share-action="download" onClick={() => void run("download")} disabled={busy} className="share-secondary inline-flex items-center justify-center gap-2"><Download className="size-4" aria-hidden="true" />Download PNG</button>
      </div>
    </div>
  );
}
