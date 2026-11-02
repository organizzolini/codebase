import {
  DEFAULT_OBSERVER,
  DEFAULT_OPTIONS,
  LINE_OPACITY_RANGE,
} from "../../hooks/use-night-sky/night-sky.constants";

import type {
  SkyColorControl,
  SkyParameterKey,
  SkySliderControl,
} from "./night-sky-menu.types";

// ♟️ Constants

/**
 * Where the observer stands and which part of the sky the window shows.
 */
export const VIEW_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "latitudeDegrees",
    key: "sky.lat",
    label: "Latitude",
    maximum: 89,
    minimum: 1,
    step: 0.5,
    unit: "°",
  },
  {
    field: "longitudeDegrees",
    key: "sky.lon",
    label: "Longitude",
    maximum: 180,
    minimum: -180,
    step: 0.5,
    unit: "°",
  },
  {
    field: "verticalFieldOfViewDegrees",
    key: "sky.vFov",
    label: "Height of view",
    maximum: 90,
    minimum: 2,
    step: 1,
    unit: "°",
  },
  {
    field: "bottomAltitudeDegrees",
    key: "sky.altBottom",
    label: "Lowest altitude",
    maximum: 60,
    minimum: 0,
    step: 1,
    unit: "°",
  },
];

/**
 * How the stars drift, how faint they are drawn, and how large.
 */
export const STAR_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "pixelsPerSecond",
    key: "sky.pixelsPerSecond",
    label: "Drift speed",
    maximum: 100,
    minimum: 1,
    step: 1,
    unit: " pixels/s",
  },
  {
    field: "faintestMagnitude",
    key: "sky.maxMag",
    label: "Faintest star",
    maximum: 6.5,
    minimum: 1,
    step: 0.1,
    unit: " mag",
  },
  {
    field: "starScale",
    key: "sky.starScale",
    label: "Star size",
    maximum: 4,
    minimum: 0.25,
    step: 0.05,
    unit: "×",
  },
];

/**
 * How the constellation figures' lines are stroked.
 */
export const LINE_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "lineOpacity",
    key: "sky.lineOpacity",
    label: "Line opacity",
    maximum: LINE_OPACITY_RANGE.maximum,
    minimum: LINE_OPACITY_RANGE.minimum,
    step: 0.01,
    unit: "",
  },
  {
    field: "lineWidth",
    key: "sky.lineWidth",
    label: "Line width",
    maximum: 4,
    minimum: 0,
    step: 0.1,
    unit: " pixels",
  },
];

/**
 * Every number the menu sets. The ranges are what looks right facing north,
 * inside the wider ones the link accepts.
 */
export const SKY_SLIDERS: readonly SkySliderControl[] = [
  ...VIEW_SLIDERS,
  ...STAR_SLIDERS,
  ...LINE_SLIDERS,
];

/**
 * The colors of the sky's gradient, top then bottom.
 */
export const BACKGROUND_COLORS: readonly SkyColorControl[] = [
  { field: "backgroundTopColor", key: "sky.top", label: "Sky top" },
  { field: "backgroundBottomColor", key: "sky.bottom", label: "Sky bottom" },
];

/**
 * The color of the constellation figures' lines.
 */
export const LINE_COLOR: SkyColorControl = {
  field: "lineColor",
  key: "sky.lineColor",
  label: "Line color",
};

/**
 * Every color the menu picks.
 */
export const SKY_COLORS: readonly SkyColorControl[] = [
  ...BACKGROUND_COLORS,
  LINE_COLOR,
];

/**
 * Each key's default, which the menu removes from the link rather than
 * write, so a link names only what differs.
 */
export const SKY_DEFAULTS: Readonly<
  Partial<Record<SkyParameterKey, number | string>>
> = {
  "sky.altBottom": DEFAULT_OPTIONS.bottomAltitudeDegrees,
  "sky.bottom": DEFAULT_OPTIONS.backgroundBottomColor,
  "sky.lat": DEFAULT_OBSERVER.latitudeDegrees,
  "sky.lineColor": DEFAULT_OPTIONS.lineColor,
  "sky.lineOpacity": DEFAULT_OPTIONS.lineOpacity,
  "sky.lineWidth": DEFAULT_OPTIONS.lineWidth,
  "sky.lon": DEFAULT_OBSERVER.longitudeDegrees,
  "sky.maxMag": DEFAULT_OPTIONS.faintestMagnitude,
  "sky.pixelsPerSecond": DEFAULT_OPTIONS.pixelsPerSecond,
  "sky.starScale": DEFAULT_OPTIONS.starScale,
  "sky.top": DEFAULT_OPTIONS.backgroundTopColor,
  "sky.vFov": DEFAULT_OPTIONS.verticalFieldOfViewDegrees,
};

/**
 * The keys Reset to defaults removes: every key the menu sets. `sky.debug`
 * stays, since only a link sets it.
 */
export const RESET_SKY_KEYS: readonly SkyParameterKey[] = [
  "sky",
  "sky.constellations",
  ...SKY_SLIDERS.map((slider) => slider.key),
  ...SKY_COLORS.map((color) => color.key),
];

/**
 * The figure choices made in one press, and the words each writes.
 */
export const CONSTELLATION_CHOICES = [
  { label: "Zodiac", words: ["zodiac"] },
  { label: "All", words: ["all"] },
  { label: "None", words: [] },
] as const;

/**
 * The submenu's panel: as wide as a phone allows, and no taller than the
 * room the menu has on screen, scrolling on its own within it.
 */
export const PANEL_CLASS_NAME =
  "w-[min(20rem,calc(100vw-1rem))] max-h-[min(var(--available-height),36rem)] overflow-y-auto";

/**
 * The keys the menu itself reads, which the panel's controls let reach it:
 * Escape closes the menu and Tab leaves the panel. Every other key stays
 * with the slider, switch or list that has focus.
 */
export const MENU_KEYS: ReadonlySet<string> = new Set(["Escape", "Tab"]);

/**
 * The slider's own classes size its track by `data-horizontal`, which this
 * version of Base UI writes as `data-orientation`, so the track and its fill
 * are drawn from here, with a thumb large enough to drag by touch.
 */
export const SLIDER_CLASS_NAME =
  "py-2 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:w-full " +
  "[&_[data-slot=slider-track]]:bg-foreground/20 [&_[data-slot=slider-range]]:h-full " +
  "[&_[data-slot=slider-thumb]]:size-4";

/**
 * A section header: small, quiet, and a full-width target to open or close.
 */
export const SECTION_TRIGGER_CLASS_NAME =
  "group text-muted-foreground hover:bg-accent flex w-full items-center justify-between rounded-md px-1 py-1 text-xs font-semibold tracking-wide uppercase";

/**
 * A constellation tree row: tall enough to tap, its checkbox and name in line.
 */
export const TREE_ROW_CLASS_NAME =
  "hover:bg-accent flex min-h-7 cursor-pointer items-center gap-2 rounded px-1 text-xs";

/**
 * A folder's checkbox, which shows a dash when some of its constellations
 * show and not all.
 */
export const FOLDER_CHECKBOX_CLASS_NAME =
  "before:hidden before:h-0.5 before:w-2 before:rounded-full before:bg-primary data-indeterminate:border-primary data-indeterminate:before:block data-indeterminate:[&_svg]:hidden";
