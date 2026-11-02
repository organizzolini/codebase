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
 * The numbers the menu sets, in the order it lists them. The ranges are what
 * looks right facing north, inside the wider ones the link accepts.
 */
export const SKY_SLIDERS: readonly SkySliderControl[] = [
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
 * The colors the menu picks.
 */
export const SKY_COLORS: readonly SkyColorControl[] = [
  { field: "backgroundTopColor", key: "sky.top", label: "Sky top" },
  { field: "backgroundBottomColor", key: "sky.bottom", label: "Sky bottom" },
  { field: "lineColor", key: "sky.lineColor", label: "Lines" },
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
  "py-3 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:w-full " +
  "[&_[data-slot=slider-track]]:bg-foreground/20 [&_[data-slot=slider-range]]:h-full " +
  "[&_[data-slot=slider-thumb]]:size-4";
