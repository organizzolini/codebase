import { COLOR_PALETTE } from "../calendar-color-by/calendar-color-schemes.constants";

import {
  PATH_SEPARATOR,
  TAG_ROOT_ORDER,
} from "./calendar-tag-colors.constants";

import type { CalendarEventTag } from "../events-calendar/calendar-records.types";

// 🌎 Public Functions

/**
 * The color of a tag's tree: one per tag root, shared by every tag beneath it; an unknown root takes the next color.
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
