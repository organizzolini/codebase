// ♟️ Constants

import type { DetectorFamily } from "../src/modules/perfective/perfective.types";

/**
 * The summary text that marks each detector family. A summary that matches
 * none of them is a mistake in the fixture or a family missing here, and
 * {@link detectorFamiliesFor} throws rather than guess.
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
