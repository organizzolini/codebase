// ♟️ Constants

import type { TagMenuFlag } from "./tag-metadata.types";

// The menus only offer a tag, so a saved link to one still works. Filter
// leaves out roots and headers over a dimension no preset or view filters by.
// Group leaves out a header over a single tag. Sort and Select leave out
// Benefic and Malefic.

/** Paths each menu leaves out, by flag; others keep all four. */
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
