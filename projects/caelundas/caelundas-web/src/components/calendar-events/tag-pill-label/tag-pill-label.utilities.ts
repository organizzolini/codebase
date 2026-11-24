import { isIconName } from "../../calendar-query/tag-icon/tag-icon.utilities";

import {
  GENERIC_TAG_ICON,
  GLYPH_BY_TAG_NAME,
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
 * The symbol of a tag with no icon, from the last name of its label: a body, sign or aspect; none when no symbol is known.
 */
export function getTagGlyph(label: string): string | undefined {
  return GLYPH_BY_TAG_NAME[label.split(" / ").at(-1) ?? label];
}

/**
 * What leads a tag's pill, so none is without one: its icon when it has one lucide knows, else the symbol of its name, else the generic tag icon.
 */
export function getTagLead(icon: string | undefined, label: string): TagLead {
  if (icon !== undefined && isIconName(icon)) {
    return { kind: "icon", value: icon };
  }

  const glyph = getTagGlyph(label);

  return glyph === undefined
    ? { kind: "icon", value: GENERIC_TAG_ICON }
    : { kind: "glyph", value: glyph };
}
