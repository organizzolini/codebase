import {
  DEFAULT_OBSERVER,
  DEFAULT_OPTIONS,
  LINE_OPACITY_RANGE,
  MINIMUM_BOTTOM_ALTITUDE_DEGREES,
  OPACITY_RANGE,
} from "../../night-sky.constants";

import type {
  SkyColorControl,
  SkyParameterKey,
  SkySliderControl,
} from "./night-sky-controls.types";

// ♟️ Constants

/**
 * Observer position and the window's view of the sky.
 */
export const ANGLE_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "latitudeDegrees",
    key: "skyfield.lat",
    label: "Latitude",
    maximum: 90,
    minimum: 1,
    step: 0.5,
    unit: "°",
  },
  {
    field: "longitudeDegrees",
    key: "skyfield.lon",
    label: "Longitude",
    maximum: 180,
    minimum: -180,
    step: 0.5,
    unit: "°",
  },
  {
    field: "verticalFieldOfViewDegrees",
    key: "skyfield.vFov",
    label: "Height of view",
    maximum: 90,
    minimum: 2,
    step: 1,
    unit: "°",
  },
  {
    field: "bottomAltitudeDegrees",
    key: "skyfield.altBottom",
    label: "Lowest altitude",
    maximum: 60,
    minimum: MINIMUM_BOTTOM_ALTITUDE_DEGREES,
    step: 1,
    unit: "°",
  },
];

/** The skyfield opacity, for readable text. */
export const OPACITY_SLIDER: SkySliderControl = {
  field: "skyOpacity",
  key: "skyfield.opacity",
  label: "Opacity",
  maximum: OPACITY_RANGE.maximum,
  minimum: OPACITY_RANGE.minimum,
  step: 0.01,
  unit: "",
};

/**
 * How the stars drift, how faint they are drawn, and how large.
 */
export const STAR_SLIDERS: readonly SkySliderControl[] = [
  {
    field: "pixelsPerSecond",
    key: "skyfield.pixelsPerSecond",
    label: "Star drift speed",
    maximum: 100,
    minimum: 1,
    step: 1,
    unit: " pixels/s",
  },
  {
    field: "faintestMagnitude",
    key: "skyfield.maxMag",
    label: "Faintest star",
    maximum: 6.5,
    minimum: 1,
    step: 0.1,
    unit: " mag",
  },
  {
    field: "starScale",
    key: "skyfield.starScale",
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
    key: "skyfield.lineOpacity",
    label: "Constellation line opacity",
    maximum: LINE_OPACITY_RANGE.maximum,
    minimum: LINE_OPACITY_RANGE.minimum,
    step: 0.01,
    unit: "",
  },
  {
    field: "lineWidth",
    key: "skyfield.lineWidth",
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
    key: "skyfield.eclipticOpacity",
    label: "Ecliptic line opacity",
    maximum: LINE_OPACITY_RANGE.maximum,
    minimum: LINE_OPACITY_RANGE.minimum,
    step: 0.01,
    unit: "",
  },
  {
    field: "eclipticWidth",
    key: "skyfield.eclipticWidth",
    label: "Ecliptic line width",
    maximum: 4,
    minimum: 0,
    step: 0.1,
    unit: " pixels",
  },
];

/**
 * Every number the menu sets, within the link's wider ranges.
 */
export const SKY_SLIDERS: readonly SkySliderControl[] = [
  ...ANGLE_SLIDERS,
  OPACITY_SLIDER,
  ...STAR_SLIDERS,
  ...LINE_SLIDERS,
  ...ECLIPTIC_SLIDERS,
];

/**
 * The colors of the sky's gradient, top then bottom.
 */
export const BACKGROUND_COLORS: readonly SkyColorControl[] = [
  {
    field: "backgroundTopColor",
    key: "skyfield.top",
    label: "Skyfield top color",
  },
  {
    field: "backgroundBottomColor",
    key: "skyfield.bottom",
    label: "Skyfield bottom color",
  },
];

/**
 * The color of the constellation figures' lines.
 */
export const LINE_COLOR: SkyColorControl = {
  field: "lineColor",
  key: "skyfield.lineColor",
  label: "Constellation line color",
};

/**
 * The color of the ecliptic's dashed path.
 */
export const ECLIPTIC_COLOR: SkyColorControl = {
  field: "eclipticColor",
  key: "skyfield.eclipticColor",
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
 * Each key's default; the menu removes a key set to it.
 */
export const SKY_DEFAULTS: Readonly<
  Partial<Record<SkyParameterKey, number | string>>
> = {
  "skyfield.altBottom": DEFAULT_OPTIONS.bottomAltitudeDegrees,
  "skyfield.bottom": DEFAULT_OPTIONS.backgroundBottomColor,
  "skyfield.eclipticColor": DEFAULT_OPTIONS.eclipticColor,
  "skyfield.eclipticOpacity": DEFAULT_OPTIONS.eclipticOpacity,
  "skyfield.eclipticWidth": DEFAULT_OPTIONS.eclipticWidth,
  "skyfield.lat": DEFAULT_OBSERVER.latitudeDegrees,
  "skyfield.lineColor": DEFAULT_OPTIONS.lineColor,
  "skyfield.lineOpacity": DEFAULT_OPTIONS.lineOpacity,
  "skyfield.lineWidth": DEFAULT_OPTIONS.lineWidth,
  "skyfield.lon": DEFAULT_OBSERVER.longitudeDegrees,
  "skyfield.maxMag": DEFAULT_OPTIONS.faintestMagnitude,
  "skyfield.opacity": DEFAULT_OPTIONS.skyOpacity,
  "skyfield.pixelsPerSecond": DEFAULT_OPTIONS.pixelsPerSecond,
  "skyfield.starScale": DEFAULT_OPTIONS.starScale,
  "skyfield.top": DEFAULT_OPTIONS.backgroundTopColor,
  "skyfield.vFov": DEFAULT_OPTIONS.verticalFieldOfViewDegrees,
};

/**
 * Keys the Default button removes; `skyfield.debug` stays.
 */
export const RESET_SKY_KEYS: readonly SkyParameterKey[] = [
  "skyfield",
  "skyfield.constellations",
  "skyfield.ecliptic",
  ...SKY_SLIDERS.map((slider) => slider.key),
  ...SKY_COLORS.map((color) => color.key),
];
