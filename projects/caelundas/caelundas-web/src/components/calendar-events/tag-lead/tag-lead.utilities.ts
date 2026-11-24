import type { CalendarSymbols } from "../event-glyphs/calendar-symbols.types";
import type { TagLead } from "../tag-pill-label/tag-pill-label.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * How a lead is drawn: an icon, a symbol as an icon of the glyphs setting, or its emoji as text.
 */
export function getLeadMode(
  lead: TagLead,
  symbols: CalendarSymbols,
): "emoji" | "glyphs" | "icon" {
  if (lead.kind === "icon") {
    return "icon";
  }

  return symbols === "glyphs" ? "glyphs" : "emoji";
}
