import { isIconName } from "../../calendar-query/tag-icon/tag-icon.utilities";

import {
  GENERIC_TAG_ICON,
  GLYPH_BY_TAG_NAME,
  ICON_BY_TAG_NAME,
} from "./tag-pill-label.constants";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { TagLead } from "./tag-pill-label.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The lucide slug of each tag that has an icon, by its id, across the facets' tags.
 */
export function createTagIcons(
  facets: readonly EventFacet[],
): Map<string, string> {
  const icons = new Map<string, string>();

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const facet of facets) {
    for (const value of facet.values) {
      if (typeof value.icon === "string") {
        icons.set(value.id, value.icon);
      }
    }
  }

  return icons;
}

/**
 * The symbol of a tag with no icon, by the last name of its label; none when unknown.
 */
export function getTagGlyph(label: string): string | undefined {
  return GLYPH_BY_TAG_NAME[label.split(" / ").at(-1) ?? label];
}

/**
 * What leads a name: its symbol, else the icon its name implies, else its icon, else the generic tag icon.
 */
export function getTagLead(icon: string | undefined, label: string): TagLead {
  const glyph = getTagGlyph(label);

  if (glyph !== undefined) {
    return { kind: "glyph", value: glyph };
  }

  const named = ICON_BY_TAG_NAME[label.split(" / ").at(-1) ?? label];

  if (named !== undefined) {
    return { kind: "icon", value: named };
  }

  return {
    kind: "icon",
    value: icon !== undefined && isIconName(icon) ? icon : GENERIC_TAG_ICON,
  };
}
