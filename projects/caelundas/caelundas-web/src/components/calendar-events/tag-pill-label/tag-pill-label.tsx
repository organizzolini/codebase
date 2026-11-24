import { use } from "react";

import { TagIcon } from "../../calendar-query/tag-icon/tag-icon";
import { CalendarSymbolsContext } from "../event-glyphs/calendar-symbols.constants";
import { EventGlyphs } from "../event-glyphs/event-glyphs";

import { TagIconsContext } from "./tag-pill-label.constants";
import { getTagLead } from "./tag-pill-label.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/** The tag's id, to find its icon by, and the name to write. */
export interface TagPillLabelProperties {
  className?: string;
  id: string;
  label: string;
}

// 🧩 Component

/**
 * Renders what a tag's pill says: its icon, else its symbol as an icon or as an emoji by the calendar's setting, else nothing, then its name.
 */
export function TagPillLabel(
  properties: Readonly<TagPillLabelProperties>,
): ReactNode {
  const {
    className = "inline-flex items-center gap-1",
    id,
    label,
  } = properties;

  // 🪝 Hooks
  const icons = use(TagIconsContext);
  const symbols = use(CalendarSymbolsContext);

  // 🏗 Setup
  const lead = getTagLead(icons.get(id), label);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-pill-label"
    >
      {lead.kind === "icon" ? (
        <TagIcon
          className="size-3 shrink-0"
          name={lead.value}
        />
      ) : (
        <span className="shrink-0 leading-none">
          {symbols === "glyphs" ? (
            <EventGlyphs
              glyphs={lead.value}
              name={label}
            />
          ) : (
            lead.value
          )}
        </span>
      )}
      {label}
    </div>
  );
}
