// ♟️ Constants

import type { DetectorFamily } from "../src/modules/perfective/perfective.types";

/**
 * Summary text marking each detector family; a summary matching none is a fixture mistake, so the lookup throws.
 */
export const familyBySummaryPattern: readonly (readonly [
  RegExp,
  DetectorFamily,
])[] = [
  [/Eclipse/u, "eclipses"],
  [/Sunrise|Sunset|Moonrise|Moonset|Zenith/u, "dailyCycles"],
  [/Daylight|Night|Civil|Nautical|Astronomical Twilight/u, "twilights"],
  [/ingress/u, "ingresses"],
  [/Apogee|Perigee|Full Moon|New Moon|Quarter Moon/u, "lunarCycle"],
  [/Equinox|Solstice|Aphelion|Perihelion/u, "solarCycle"],
  [/Elongation|Brightest|Evening (?:Set|Rise)|Morning (?:Set|Rise)/u, "phases"],
  [
    /conjunct|opposite|trine|square|sextile|quincunx|yod|grand|kite|stellium|hexagram|perfective/iu,
    "aspects",
  ],
];
