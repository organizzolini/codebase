// ♟️ Constants

export const PHASE_EVENT_BASE_TAGS = [
  "Astronomy",
  "Astrology",
  "Planetary Phase",
] as const;

export const PLANETARY_PHASE_TAG = "Planetary Phase";

export const VENUSIAN_TAG = "Venusian";
export const MERCURIAN_TAG = "Mercurian";
export const MARTIAN_TAG = "Martian";

/** Largest phase angle where magnitude minimum means greatest brilliancy. */
export const MAXIMUM_BRILLIANCY_PHASE_ANGLE_DEGREES = 160;

/** Sun elongation (degrees) where an inner planet leaves its glare. */
export const RISE_SET_ELONGATION_DEGREES = 6;

export const MORNING_RISE_TAG = "Morning Rise";
export const MORNING_SET_TAG = "Morning Set";
export const EVENING_RISE_TAG = "Evening Rise";
export const EVENING_SET_TAG = "Evening Set";
export const OPPOSITION_TAG = "Opposition";

export const VENUS_EVENING_VISIBILITY_DESCRIPTION =
  "Venus Evening Star (Evening Visibility)";
export const VENUS_MORNING_VISIBILITY_DESCRIPTION =
  "Venus Morning Star (Morning Visibility)";
export const MERCURY_EVENING_VISIBILITY_DESCRIPTION =
  "Mercury Evening Star (Evening Visibility)";
export const MERCURY_MORNING_VISIBILITY_DESCRIPTION =
  "Mercury Morning Star (Morning Visibility)";

export const VENUS_EVENING_VISIBILITY_SUMMARY = "♀️🌇 Venus Evening Star";
export const VENUS_MORNING_VISIBILITY_SUMMARY = "♀️🌄 Venus Morning Star";
export const MERCURY_EVENING_VISIBILITY_SUMMARY = "☿🌇 Mercury Evening Star";
export const MERCURY_MORNING_VISIBILITY_SUMMARY = "☿🌄 Mercury Morning Star";

export const VENUS_EVENING_VISIBILITY_PAIR_LABEL = "Venus Evening Visibility";
export const VENUS_MORNING_VISIBILITY_PAIR_LABEL = "Venus Morning Visibility";
export const MERCURY_EVENING_VISIBILITY_PAIR_LABEL =
  "Mercury Evening Visibility";
export const MERCURY_MORNING_VISIBILITY_PAIR_LABEL =
  "Mercury Morning Visibility";

export const PHASE_EVENT_TIMEZONE = "America/New_York";

/** The inner planets whose apparitions have a greatest elongation. */
export const ELONGATION_PLANETS = [
  { body: "venus", marker: VENUSIAN_TAG, name: "Venus", symbol: "♀️" },
  { body: "mercury", marker: MERCURIAN_TAG, name: "Mercury", symbol: "☿" },
] as const;

/** The bodies of the planets whose apparitions have a greatest elongation. */
export const ELONGATION_BODIES: ReadonlySet<string> = new Set(
  ELONGATION_PLANETS.map((planet) => planet.body),
);

/** Mars, whose apparition peaks at opposition, not at an elongation. */
export const MARS_PLANET = {
  body: "mars",
  marker: MARTIAN_TAG,
  name: "Mars",
  symbol: "♂️",
} as const;

/** Each side of the Sun an apparition is on. */
export const ELONGATION_SIDES = [
  {
    elongationTag: "Eastern Elongation",
    name: "Evening",
    riseTag: EVENING_RISE_TAG,
    setTag: EVENING_SET_TAG,
    symbol: "🌇",
  },
  {
    elongationTag: "Western Elongation",
    name: "Morning",
    riseTag: MORNING_RISE_TAG,
    setTag: MORNING_SET_TAG,
    symbol: "🌄",
  },
] as const;

/** Name of the span the planet widens from the Sun. */
export const WIDENING = "Widening";

/** Name of the span the planet closes on the Sun. */
export const CLOSING = "Closing";

/**
 * Mars widens from the Sun in the morning sky, from its rise to opposition,
 * then closes on it in the evening sky, from opposition to its set.
 */
export const MARS_SPAN_KINDS = [
  {
    from: MORNING_RISE_TAG,
    planet: MARS_PLANET,
    side: ELONGATION_SIDES[1],
    stage: WIDENING,
    to: OPPOSITION_TAG,
  },
  {
    from: OPPOSITION_TAG,
    planet: MARS_PLANET,
    side: ELONGATION_SIDES[0],
    stage: CLOSING,
    to: EVENING_SET_TAG,
  },
] as const;

/** Minutes between visibility search probes, inside a planet's days out. */
export const VISIBILITY_SEARCH_STEP_MINUTES = 720;

/** Minutes either side of a minute a phase detector reads. */
export const PHASE_DETECTION_MARGIN_MINUTES = 31;

/** Planets whose apparitions the edges complete. */
export const PHASE_PLANETS = ["venus", "mercury", "mars"] as const;

/** The tags that mark a rise or a set. */
export const RISE_SET_TAGS: readonly string[] = ELONGATION_SIDES.flatMap(
  (side) => [side.riseTag, side.setTag],
);

/** Mars also changes side of the Sun, at opposition, out of its glare. */
export const MARS_BOUNDARY_TAGS: readonly string[] = [
  ...RISE_SET_TAGS,
  OPPOSITION_TAG,
];

/** The tags that mark a greatest elongation. */
export const ELONGATION_TAGS: readonly string[] = ELONGATION_SIDES.map(
  (side) => side.elongationTag,
);
