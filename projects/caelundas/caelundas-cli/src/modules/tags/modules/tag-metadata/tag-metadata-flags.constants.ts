// ♟️ Constants

import type { TagMenuFlag } from "./tag-metadata.types";

// The menus only offer a tag, so a saved link to one still works. Filter
// leaves out roots, headers over a dimension no preset or view filters by, and
// Dignity's values, which belong to a planet and a sign together.
// Group leaves out a header over a single tag. Sort and Select leave out
// Benefic and Malefic.

/** Paths each menu leaves out, by flag; others keep all four. */
export const TAG_MENU_EXCLUSIONS: Readonly<
  Record<TagMenuFlag, readonly string[]>
> = {
  isFilterable: [
    "Aspect",
    "Aspect / Compound / Focal Body",
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
    "Sign",
    "Sign / Decan",
    "Sign / Dignity",
    "Sign / Dignity / Detriment",
    "Sign / Dignity / Domicile",
    "Sign / Dignity / Exaltation",
    "Sign / Dignity / Fall",
    "Sign / Dignity / Peregrine",
    "Sign / Element",
    "Sign / Modality",
    "Sign / Peak",
    "Sign / Polarity",
    "Solar",
    "Solar / Annual Cycle / Interval",
    "Solar / Season",
    "Temporality",
  ],
  isGroupable: ["Aspect / Compound / Sextuple", "Planetary / Phase / Martian"],
  isSelectable: ["Body / Planet / Benefic", "Body / Planet / Malefic"],
  isSortable: ["Body / Planet / Benefic", "Body / Planet / Malefic"],
};
