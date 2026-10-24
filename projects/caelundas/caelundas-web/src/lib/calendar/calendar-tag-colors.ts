import { COLOR_PALETTE } from "./calendar-color-schemes";

import type { CalendarEventTag } from "../events-database/events-database.types";

// 🔖 Constants

/**
 * The tag roots in the order they take a color of the palette, the ones an
 * event carries most together first so that they never share one.
 */
const TAG_ROOT_ORDER: readonly string[] = [
  "Type",
  "Planet",
  "Sign",
  "Aspect Nature",
  "Body Class",
  "Focal Body",
  "Element",
  "Modality",
  "Polarity",
  "Phase",
  "Temporality",
  "Motion",
  "Decan",
  "Dignity",
  "Aspect Harmonic",
  "Domain",
  "Time of Day",
  "Lunar Phase",
  "Synodic Stage",
  "Season",
  "Eclipse Frame",
];

const PATH_SEPARATOR = " / ";

// 🧩 Functions

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
