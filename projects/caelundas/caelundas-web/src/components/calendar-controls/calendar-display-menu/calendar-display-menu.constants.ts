import {
  CalendarDays,
  CalendarRange,
  ChartGantt,
  Grid2x2,
  Orbit,
  Square,
  Sun,
  Table,
} from "lucide-react";

import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

export const TITLE = "Display";

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

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

/** The branch whose content is the view radio group. */
export const LAYOUT_BRANCH = "branch:layout";

/** The branch whose content is the glyphs or emojis radio group. */
export const SYMBOLS_BRANCH = "branch:symbols";

/** The branch whose content is the timeline scale radio group. */
export const SCALE_BRANCH = "branch:scale";

/**
 * The icon each timeline scale carries beside its name.
 */
export const SCALE_ICONS: Readonly<Record<TimelineScale, LucideIcon>> = {
  day: Sun,
  month: CalendarDays,
  quarter: Grid2x2,
  week: CalendarRange,
  year: Orbit,
};

/**
 * The icon each calendar view carries beside its name.
 */
export const VIEW_ICONS: Readonly<Record<CalendarViewName, LucideIcon>> = {
  day: Square,
  month: CalendarDays,
  table: Table,
  timeline: ChartGantt,
  week: CalendarRange,
};
