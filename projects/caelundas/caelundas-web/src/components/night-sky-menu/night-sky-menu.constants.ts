import {
  DEFAULT_OBSERVER,
  DEFAULT_OPTIONS,
  LINE_OPACITY_RANGE,
  MINIMUM_BOTTOM_ALTITUDE_DEGREES,
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
export const ANGLE_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "latitudeDegrees",
    key: "sky.lat",
    label: "Latitude",
    maximum: 90,
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
    minimum: MINIMUM_BOTTOM_ALTITUDE_DEGREES,
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
    label: "Star drift speed",
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
    label: "Constellation line opacity",
    maximum: LINE_OPACITY_RANGE.maximum,
    minimum: LINE_OPACITY_RANGE.minimum,
    step: 0.01,
    unit: "",
  },
  {
    field: "lineWidth",
    key: "sky.lineWidth",
    label: "Constellation line width",
    maximum: 4,
    minimum: 0,
    step: 0.1,
    unit: " pixels",
  },
];

/**
 * How the ecliptic's dashed path is stroked.
 */
export const ECLIPTIC_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "eclipticOpacity",
    key: "sky.eclipticOpacity",
    label: "Ecliptic line opacity",
    maximum: LINE_OPACITY_RANGE.maximum,
    minimum: LINE_OPACITY_RANGE.minimum,
    step: 0.01,
    unit: "",
  },
  {
    field: "eclipticWidth",
    key: "sky.eclipticWidth",
    label: "Ecliptic line width",
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
  ...ANGLE_SLIDERS,
  ...STAR_SLIDERS,
  ...LINE_SLIDERS,
  ...ECLIPTIC_SLIDERS,
];

/**
 * The colors of the sky's gradient, top then bottom.
 */
export const BACKGROUND_COLORS: readonly SkyColorControl[] = [
  { field: "backgroundTopColor", key: "sky.top", label: "Sky top color" },
  {
    field: "backgroundBottomColor",
    key: "sky.bottom",
    label: "Sky bottom color",
  },
];

/**
 * The color of the constellation figures' lines.
 */
export const LINE_COLOR: SkyColorControl = {
  field: "lineColor",
  key: "sky.lineColor",
  label: "Constellation line color",
};

/**
 * The color of the ecliptic's dashed path.
 */
export const ECLIPTIC_COLOR: SkyColorControl = {
  field: "eclipticColor",
  key: "sky.eclipticColor",
  label: "Ecliptic line color",
};

/**
 * Every color the menu picks.
 */
export const SKY_COLORS: readonly SkyColorControl[] = [
  ...BACKGROUND_COLORS,
  LINE_COLOR,
  ECLIPTIC_COLOR,
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
  "sky.eclipticColor": DEFAULT_OPTIONS.eclipticColor,
  "sky.eclipticOpacity": DEFAULT_OPTIONS.eclipticOpacity,
  "sky.eclipticWidth": DEFAULT_OPTIONS.eclipticWidth,
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
 * The keys the Default button removes: every key the menu sets. `sky.debug`
 * stays, since only a link sets it.
 */
export const RESET_SKY_KEYS: readonly SkyParameterKey[] = [
  "sky",
  "sky.constellations",
  "sky.ecliptic",
  ...SKY_SLIDERS.map((slider) => slider.key),
  ...SKY_COLORS.map((color) => color.key),
];

/**
 * The menu's panel: four columns wide on a wide screen and as wide as a
 * phone allows on one, no taller than the room below the toolbar, scrolling
 * on its own only when even that is too short, as on a phone.
 */
export const PANEL_CLASS_NAME =
  "w-[min(20rem,calc(100vw-1rem))] md:w-[min(40rem,calc(100vw-1rem))] lg:w-[min(68rem,calc(100vw-1rem))] max-h-(--available-height) overflow-y-auto";

/**
 * The first of the presets' joined pill: round on the left, square where it
 * meets the next, and raised while focused so its ring shows whole.
 */
export const PRESET_FIRST_CLASS_NAME =
  "relative rounded-l-full rounded-r-none focus-visible:z-10";

/**
 * The last of the presets' joined pill: round on the right, its left border
 * laid over the first's so the two share one.
 */
export const PRESET_LAST_CLASS_NAME =
  "relative -ml-0.25 rounded-l-none rounded-r-full focus-visible:z-10";

/**
 * The settings the Full button writes: the whole sky above the horizon, seen
 * from the pole.
 */
export const FULL_VIEW: readonly (readonly [SkyParameterKey, number])[] = [
  ["sky.altBottom", 0],
  ["sky.lat", 90],
  ["sky.pixelsPerSecond", 3],
  ["sky.vFov", 90],
];

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
 * A group of controls: no heading, so each control's own label carries its
 * meaning; a column divides its groups with a hairline.
 */
export const SECTION_CLASS_NAME = "flex flex-col gap-1 py-2";

/**
 * A column of the panel: its groups one under another, a hairline between.
 */
export const COLUMN_CLASS_NAME = "divide-y";

/**
 * The constellation tree's box: as tall as the panel's other columns on a
 * wide screen, where its column takes no height of its own, and bounded on a
 * phone; it scrolls inside either way.
 */
export const TREE_CLASS_NAME =
  "max-h-80 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border p-1 lg:max-h-none";

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
