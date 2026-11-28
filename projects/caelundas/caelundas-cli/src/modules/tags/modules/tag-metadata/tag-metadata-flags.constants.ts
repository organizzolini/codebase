// ♟️ Constants

import type { TagMenuFlag } from "./tag-metadata.types";

// The menus only offer a tag, so a saved link to one still works. Filter
// leaves out roots, headers over a dimension no preset or view filters by, and
// Dignity's values, which belong to a planet and a sign together.
// Every tag is groupable: a leaf is how a user picks which tags become groups,
// and a header groups by its children. Sort and Select leave out Benefic and
// Malefic. The default grouping leaves out the attribute roots, which say what
// an event involves or how long it lasts, not what kind of event it is: Body
// and Temporality.

/** Paths each menu, or the default grouping, leaves out by flag; others keep all. */
export const TAG_MENU_EXCLUSIONS: Readonly<
  Record<TagMenuFlag, readonly string[]>
> = {
  isDefaultGroup: ["Body", "Temporality"],
  isFilterable: [
    "Aspect",
    "Aspect / Compound / Focal Body",
    "Aspect / Harmonic",
    "Aspect / Nature",
    "Aspect / Phase",
    "Body",
    "Daily",
    "Eclipse",
    "Eclipse / Frame",
    "Eclipse / Phase",
    "Ingress",
    "Ingress / Decan",
    "Ingress / Peak",
    "Ingress / Stay",
    "Lunar",
    "Planetary",
    "Sign",
    "Sign / Dignity",
    "Sign / Dignity / Detriment",
    "Sign / Dignity / Domicile",
    "Sign / Dignity / Exaltation",
    "Sign / Dignity / Fall",
    "Sign / Dignity / Peregrine",
    "Sign / Element",
    "Sign / Modality",
    "Sign / Polarity",
    "Sign / Zodiac",
    "Yearly",
    "Yearly / Interval",
    "Yearly / Season",
    "Temporality",
  ],
  isGroupable: [],
  isSelectable: ["Body / Planet / Benefic", "Body / Planet / Malefic"],
  isSortable: ["Body / Planet / Benefic", "Body / Planet / Malefic"],
};
