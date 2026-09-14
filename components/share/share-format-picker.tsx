import { SHARE_FORMATS } from "@/lib/sprintly/share/templates";
import type { ShareFormat } from "@/lib/sprintly/share/types";

export function ShareFormatPicker({ selected, onChange }: { selected: ShareFormat; onChange: (value: ShareFormat) => void }) {
  if (selected === "sticker") return <p className="text-xs leading-5 text-[#b8b8b8]">Transparent PNG · 1080 × 760. Place it over a photo in your social app.</p>;
  return (
    <fieldset>
      <legend className="share-label">Choose a size</legend>
      <div className="share-options" aria-label="Output size">
        {(["story", "portrait", "square"] as const).map((format) => (
          <button key={format} type="button" data-share-format={format} aria-pressed={selected === format} onClick={() => onChange(format)} className="share-option" title={`${SHARE_FORMATS[format].width} × ${SHARE_FORMATS[format].height} · ${SHARE_FORMATS[format].description}`}>{SHARE_FORMATS[format].label}</button>
        ))}
      </div>
    </fieldset>
  );
}
