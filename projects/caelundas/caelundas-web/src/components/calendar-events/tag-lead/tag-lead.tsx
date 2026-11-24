import { use } from "react";

import { TagIcon } from "../../calendar-query/tag-icon/tag-icon";
import { CalendarSymbolsContext } from "../event-glyphs/calendar-symbols.constants";
import { EventGlyphs } from "../event-glyphs/event-glyphs";
import { TagIconsContext } from "../tag-pill-label/tag-pill-label.constants";
import { getTagLead } from "../tag-pill-label/tag-pill-label.utilities";

import { getLeadMode } from "./tag-lead.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/** A name, with its tag id and icon. */
export interface TagLeadProperties {
  className?: string;
  /**
   * A lucide slug to use when the tag's id has none.
   */
  icon?: string | undefined;
  id?: string | undefined;
  label: string;
}

// 🧩 Component

/**
 * Renders the symbol that leads a name: its glyph or emoji by the calendar's setting, else its icon, else the generic tag icon.
 */
export function TagLead(properties: Readonly<TagLeadProperties>): ReactNode {
  const {
    className = "inline-flex shrink-0 items-center leading-none",
    icon,
    id,
    label,
  } = properties;

  // 🪝 Hooks
  const icons = use(TagIconsContext);
  const symbols = use(CalendarSymbolsContext);

  // 🏗 Setup
  const lead = getTagLead(
    (id === undefined ? undefined : icons.get(id)) ?? icon,
    label,
  );
  const mode = getLeadMode(lead, symbols);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-lead"
    >
      {mode === "icon" ? (
        <TagIcon
          className="size-3 shrink-0"
          name={lead.value}
        />
      ) : null}
      {mode === "glyphs" ? (
        <EventGlyphs
          glyphs={lead.value}
          name={label}
        />
      ) : null}
      {mode === "emoji" ? lead.value : null}
    </div>
  );
}
