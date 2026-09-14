import { templatesFor, recommendShare } from "@/lib/sprintly/share/recommend-share";
import type { ShareMediaData, ShareTemplate } from "@/lib/sprintly/share/types";

export function ShareTemplatePicker({ data, selected, onChange }: { data: ShareMediaData; selected: ShareTemplate; onChange: (value: ShareTemplate) => void }) {
  return (
    <fieldset>
      <legend className="share-label">Choose a style</legend>
      <div className="share-options" aria-label="Post style">
        {templatesFor(data).map((template) => (
          <button key={template.id} type="button" data-share-template={template.id} aria-pressed={selected === template.id} onClick={() => onChange(template.id)} className="share-option" title={template.description}>
            {template.shortLabel}
            {template.id === recommendShare(data) && <span className="block text-[10px] font-normal text-[#acbcc3]">Recommended</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
