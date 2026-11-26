// ♟️ Constants

import type { TagMenuFlag } from "./tag-metadata.types";

/**
 * The paths of the tags a menu leaves out, by flag; every other tag has all four flags on. The menus only offer a tag, so a saved link to one still works.
 *
 * Filter leaves out the roots and the headers over a dimension no preset or view filters by,
 * so one picks Conjunct or Aries, never "Element". Group leaves out a header over
 * a single tag, which splits nothing. Sort and Select leave out Benefic and
 * Malefic, which Planet already orders and shows.
 */
export const TAG_MENU_EXCLUSIONS: Readonly<
  Record<TagMenuFlag, readonly string[]>
> = {
  isFilterable: [
    "Aspect",
    "Aspect / Focal Body",
    "Aspect / Harmonic",
    "Aspect / Nature",
    "Aspect / Phase",
    "Body",
    "Daily",
    "Daily / Time of Day",
    "Eclipse",
    "Eclipse / Frame",
    "Eclipse / Phase",
    "Lunar",
    "Planetary",
    "Solar",
    "Solar / Season",
    "Temporality",
    "Zodiac",
    "Zodiac / Decan",
    "Zodiac / Dignity",
    "Zodiac / Element",
    "Zodiac / Modality",
    "Zodiac / Polarity",
  ],
  isGroupable: ["Aspect / Compound / Sextuple", "Planetary / Phase / Martian"],
  isSelectable: ["Body / Benefic", "Body / Malefic"],
  isSortable: ["Body / Benefic", "Body / Malefic"],
};
