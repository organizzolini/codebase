// ♟️ Constants

/**
 * The detector families a sweep runs. A caller that checks one kind of
 * event, such as a reference test of an eclipse, can name just that family
 * and skip the rest, which dominate a sweep's cost.
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
