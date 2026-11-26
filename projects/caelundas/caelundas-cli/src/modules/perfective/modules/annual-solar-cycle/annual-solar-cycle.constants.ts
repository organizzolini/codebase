// ♟️ Constants

export const ANNUAL_SOLAR_CYCLE_BASE_TAGS = [
  "Astronomy",
  "Astrology",
  "Annual Solar Cycle",
  "Solar",
] as const;

export const APHELION_TAG = "Aphelion";
export const PERIHELION_TAG = "Perihelion";

/** The season each equinox or solstice begins, with its symbol. */
export const SEASON_BY_SEASON_START = {
  "Autumnal Equinox": { season: "Autumn", symbol: "🍂" },
  "Summer Solstice": { season: "Summer", symbol: "🌞" },
  "Vernal Equinox": { season: "Spring", symbol: "🌸" },
  "Winter Solstice": { season: "Winter", symbol: "☃️" },
} as const;

export const SOLAR_ADVANCING_TAG = "Advancing";
export const SOLAR_RETREATING_TAG = "Retreating";

export const SOLAR_ADVANCING_DESCRIPTION =
  "Solar Advancing (Aphelion to Perihelion)";
export const SOLAR_RETREATING_DESCRIPTION =
  "Solar Retreating (Perihelion to Aphelion)";

export const SOLAR_ADVANCING_SUMMARY = "☀️🔥 Solar Advancing";
export const SOLAR_RETREATING_SUMMARY = "☀️❄️ Solar Retreating";

export const SOLAR_CYCLE_EVENT_TIMEZONE = "America/New_York";

export const SOLAR_CYCLE_LONGITUDE_THRESHOLDS = {
  autumnalEquinox: 180,
  beltane: 45,
  eleventhHexadecan: 247.5,
  fifteenthHexadecan: 337.5,
  fifthHexadecan: 112.5,
  firstHexadecan: 22.5,
  imbolc: 315,
  lammas: 135,
  ninthHexadecan: 202.5,
  samhain: 225,
  seventhHexadecan: 157.5,
  summerSolstice: 90,
  thirdHexadecan: 67.5,
  thirteenthHexadecan: 292.5,
  winterSolstice: 270,
} as const;

/** Degrees of solar longitude between points of the year. */
export const DEGREES_PER_SOLAR_YEAR_POINT = 22.5;

/** Degrees of the Sun's longitude in one season. */
export const DEGREES_PER_SEASON = 90;

/** Minutes between search probes, inside the days between points. */
export const SOLAR_SEARCH_STEP_MINUTES = 1440;

/** The seasons in order from the vernal equinox, four points each. */
export const SEASONS_IN_ORDER = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
] as const;

/** The sixteen points of the year; named ones at even places. */
export const SOLAR_YEAR_POINTS = [
  "Vernal Equinox",
  "First Hexadecan",
  "Beltane",
  "Third Hexadecan",
  "Summer Solstice",
  "Fifth Hexadecan",
  "Lammas",
  "Seventh Hexadecan",
  "Autumnal Equinox",
  "Ninth Hexadecan",
  "Samhain",
  "Eleventh Hexadecan",
  "Winter Solstice",
  "Thirteenth Hexadecan",
  "Imbolc",
  "Fifteenth Hexadecan",
] as const;

/** The sixteen pre- and post- intervals between the points, in year order. */
export const SOLAR_INTERVAL_NAMES: readonly string[] = SOLAR_YEAR_POINTS.map(
  (point, index) =>
    index % 2 === 0
      ? `Post-${point}`
      : `Pre-${SOLAR_YEAR_POINTS[(index + 1) % SOLAR_YEAR_POINTS.length] ?? ""}`,
);
