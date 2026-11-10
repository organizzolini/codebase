// ♟️ Constants

/**
 * The detector families a sweep runs; a caller can name one family to skip the rest, which dominate cost.
 */
export const detectorFamilies = [
  "aspects",
  "dailyCycles",
  "eclipses",
  "ingresses",
  "lunarCycle",
  "phases",
  "retrogrades",
  "solarCycle",
  "twilights",
] as const;
