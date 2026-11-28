import { Shapes, Smile } from "lucide-react";

import type { CalendarSymbols } from "../../calendar-events/event-glyphs/calendar-symbols.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

export const DISPLAY_MENU_TITLE = "Display";

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/** The icon and name of each symbol set. */
export const SYMBOL_CHOICES: Readonly<
  Record<CalendarSymbols, { icon: LucideIcon; label: string }>
> = {
  emojis: { icon: Smile, label: "Emojis" },
  glyphs: { icon: Shapes, label: "Glyphs" },
};

/** Tightens the tree: one indent step fewer. */
export const TREE_CLASS_NAME = [
  "[&_[data-slot=cascader-item]]:ps-[max(var(--cascader-row-inset,6px),calc(var(--cascader-row-inset,6px)+var(--cascader-indent,0px)-16px))]!",
].join(" ");

/** The figure choices the sky can draw, each named. */
export const CONSTELLATION_CHOICES = [
  { label: "All", value: "all", words: ["all"] },
  { label: "Zodiac", value: "zodiac", words: ["zodiac"] },
  { label: "None", value: "none", words: [] },
] as const;

/** The sky colors the list offers, each named. */
export const COLOR_SWATCHES = [
  { label: "Midnight", value: "#04060f" },
  { label: "Navy", value: "#0d1533" },
  { label: "Indigo", value: "#1b2a5c" },
  { label: "Plum", value: "#3b1f5e" },
  { label: "Wine", value: "#5c1f2a" },
  { label: "White", value: "#ffffff" },
  { label: "Sky blue", value: "#7dd3fc" },
  { label: "Amber", value: "#fbbf24" },
] as const;

/** How many values a numeric setting offers, least to most. */
export const STEP_COUNT = 5;

/** The branch whose content is the glyphs or emojis radio group. */
export const SYMBOLS_BRANCH = "branch:symbols";

/**
 * What every other option does, by the value of its row.
 */
export const DISPLAY_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "branch:constellations": "Which star figures the skyfield draws.",
  "branch:others": "Figures outside the zodiac.",
  "branch:sky": "The night sky drawn behind the calendar.",
  "branch:sky-Angles": "Where and how wide the sky is viewed.",
  "branch:sky-Background": "The colors the sky fades between.",
  "branch:sky-Constellation lines": "How the figures' lines are drawn.",
  "branch:sky-Ecliptic": "The path of the sun across the sky.",
  "branch:sky-Stars": "How the stars are drawn.",
  "branch:skyfield.altBottom": "The lowest altitude shown above the horizon.",
  "branch:skyfield.bottom": "The color at the bottom of the sky.",
  "branch:skyfield.eclipticColor": "The color of the ecliptic line.",
  "branch:skyfield.eclipticOpacity": "How see-through the ecliptic line is.",
  "branch:skyfield.eclipticWidth": "How thick the ecliptic line is.",
  "branch:skyfield.lat": "The latitude the sky is viewed from.",
  "branch:skyfield.lineColor": "The color of the figures' lines.",
  "branch:skyfield.lineOpacity": "How see-through the figures' lines are.",
  "branch:skyfield.lineWidth": "How thick the figures' lines are.",
  "branch:skyfield.lon": "The longitude the sky is viewed from.",
  "branch:skyfield.maxMag": "The dimmest stars drawn.",
  "branch:skyfield.opacity": "How see-through the whole sky is.",
  "branch:skyfield.pixelsPerSecond": "How fast the stars drift across the sky.",
  "branch:skyfield.starScale": "How large the stars are drawn.",
  "branch:skyfield.top": "The color at the top of the sky.",
  "branch:skyfield.vFov": "How much of the sky fits the height of the view.",
  "branch:symbols": "How bodies and signs are drawn.",
  "branch:zodiac": "The figures of the twelve signs.",
  colors: "Color events by their first group.",
  compare: "Show each metric's change from the period before.",
  "constellations:all": "Draw every figure.",
  "constellations:none": "Draw no figures.",
  "constellations:zodiac": "Draw only the zodiac figures.",
  hideEmpty:
    "Leave out groups with no events in these days, on the table, timeline, charts and totals.",
  "sky:ecliptic": "Draw the sun's path across the sky.",
  "sky:reset": "Put every skyfield setting back to its default.",
  "sky:visible": "Draw the night sky behind the calendar.",
  "symbols:emojis": "Symbols written as emoji.",
  "symbols:glyphs": "Astrological symbols drawn as icons.",
};
