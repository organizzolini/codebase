import { COLOR_PALETTE } from "../constants/calendar-color-schemes.constants";
import {
  PATH_SEPARATOR,
  TAG_ROOT_ORDER,
} from "../constants/calendar-tag-colors.constants";

import type { CalendarEventTag } from "../types/events-database.types";

// 🌎 Public Functions

/**
 * The color of a tag's tree: one for each tag root, so every tag beneath a
 * root shares it. A root the list does not know takes the next color after
 * those it does, by its name's length.
 */
export function getTagColor(tag: CalendarEventTag): string {
  const [root = ""] = tag.path.split(PATH_SEPARATOR);
  const position = TAG_ROOT_ORDER.indexOf(root);

  return String(
    COLOR_PALETTE[
      (position === -1 ? TAG_ROOT_ORDER.length + root.length : position) %
        COLOR_PALETTE.length
    ],
  );
}
