// ♟️ Constants
import type { Aspect, Body, Sign } from "../caelundas/caelundas.types";
import type { TagElement } from "./tags.types";

/** Element of each sign, also carried by events in it. */
export const ELEMENT_BY_SIGN: Record<Sign, TagElement> = {
  aquarius: "Air",
  aries: "Fire",
  cancer: "Water",
  capricorn: "Earth",
  gemini: "Air",
  leo: "Fire",
  libra: "Air",
  pisces: "Water",
  sagittarius: "Fire",
  scorpio: "Water",
  taurus: "Earth",
  virgo: "Earth",
};

/** Modality of each sign, also carried by events in it. */
export const MODALITY_BY_SIGN: Record<Sign, string> = {
  aquarius: "Fixed",
  aries: "Cardinal",
  cancer: "Cardinal",
  capricorn: "Cardinal",
  gemini: "Mutable",
  leo: "Fixed",
  libra: "Cardinal",
  pisces: "Mutable",
  sagittarius: "Mutable",
  scorpio: "Fixed",
  taurus: "Fixed",
  virgo: "Mutable",
};

/** Element polarity: fire and air positive; earth and water negative. */
export const POLARITY_BY_ELEMENT: Readonly<Record<TagElement, string>> = {
  Air: "Positive",
  Earth: "Negative",
  Fire: "Positive",
  Water: "Negative",
};

/** Kind and season of each annual solar cycle point. */
export const KIND_AND_SEASON_BY_SOLAR_CYCLE_POINT: Readonly<
  Record<string, readonly [string, string]>
> = {
  "Autumnal Equinox": ["Equinox", "Autumn"],
  Beltane: ["Cross-Quarter Day", "Spring"],
  "Eleventh Hexadecan": ["Hexadecan", "Autumn"],
  "Fifteenth Hexadecan": ["Hexadecan", "Winter"],
  "Fifth Hexadecan": ["Hexadecan", "Summer"],
  "First Hexadecan": ["Hexadecan", "Spring"],
  Imbolc: ["Cross-Quarter Day", "Winter"],
  Lammas: ["Cross-Quarter Day", "Summer"],
  "Ninth Hexadecan": ["Hexadecan", "Autumn"],
  Samhain: ["Cross-Quarter Day", "Autumn"],
  "Seventh Hexadecan": ["Hexadecan", "Summer"],
  "Summer Solstice": ["Solstice", "Summer"],
  "Third Hexadecan": ["Hexadecan", "Spring"],
  "Thirteenth Hexadecan": ["Hexadecan", "Winter"],
  "Vernal Equinox": ["Equinox", "Spring"],
  "Winter Solstice": ["Solstice", "Winter"],
};

/** Signs each planet is dignified or debilitated in, strongest first. */
export const SIGNS_BY_DIGNITY_BY_PLANET: Readonly<
  Record<string, readonly (readonly [string, readonly Sign[]])[]>
> = {
  jupiter: [
    ["Domicile", ["sagittarius", "pisces"]],
    ["Exaltation", ["cancer"]],
    ["Detriment", ["gemini", "virgo"]],
    ["Fall", ["capricorn"]],
  ],
  mars: [
    ["Domicile", ["aries", "scorpio"]],
    ["Exaltation", ["capricorn"]],
    ["Detriment", ["libra", "taurus"]],
    ["Fall", ["cancer"]],
  ],
  mercury: [
    ["Domicile", ["gemini", "virgo"]],
    ["Exaltation", ["virgo"]],
    ["Detriment", ["sagittarius", "pisces"]],
    ["Fall", ["pisces"]],
  ],
  moon: [
    ["Domicile", ["cancer"]],
    ["Exaltation", ["taurus"]],
    ["Detriment", ["capricorn"]],
    ["Fall", ["scorpio"]],
  ],
  saturn: [
    ["Domicile", ["capricorn", "aquarius"]],
    ["Exaltation", ["libra"]],
    ["Detriment", ["cancer", "leo"]],
    ["Fall", ["aries"]],
  ],
  sun: [
    ["Domicile", ["leo"]],
    ["Exaltation", ["aries"]],
    ["Detriment", ["aquarius"]],
    ["Fall", ["libra"]],
  ],
  venus: [
    ["Domicile", ["taurus", "libra"]],
    ["Exaltation", ["pisces"]],
    ["Detriment", ["scorpio", "aries"]],
    ["Fall", ["virgo"]],
  ],
};

/** Which of tradition's two fortunes a planet is, so it also sits under that group. */
export const FORTUNE_BY_PLANET: Readonly<Partial<Record<Body, string>>> = {
  jupiter: "Benefic",
  mars: "Malefic",
  saturn: "Malefic",
  venus: "Benefic",
};

/** Synodic stage each Mercury, Venus, or Mars phase marks. */
export const SYNODIC_STAGE_BY_PHASE: Readonly<Record<string, string>> = {
  brightest: "Brightest",
  conjunction: "Conjunction",
  "eastern brightest": "Brightest",
  "eastern elongation": "Elongation",
  "epimethian conjunction": "Conjunction",
  "evening closing": "Closing",
  "evening last": "Rise and set",
  "evening rise": "Rise and set",
  "evening set": "Rise and set",
  "evening star": "Visibility",
  "evening station": "Station",
  "evening visibility": "Visibility",
  "evening widening": "Widening",
  full: "Conjunction",
  "inferior conjunction": "Conjunction",
  "morning closing": "Closing",
  "morning first": "Rise and set",
  "morning rise": "Rise and set",
  "morning set": "Rise and set",
  "morning star": "Visibility",
  "morning station": "Station",
  "morning visibility": "Visibility",
  "morning widening": "Widening",
  new: "Conjunction",
  opposition: "Opposition",
  "promethian conjunction": "Conjunction",
  "superior conjunction": "Conjunction",
  "western brightest": "Brightest",
  "western elongation": "Elongation",
};

/** Mars's stages where they differ: full at opposition, not conjunction. */
export const MARTIAN_SYNODIC_STAGE_BY_PHASE: Readonly<Record<string, string>> =
  {
    full: "Opposition",
  };

/** Where each body sits beneath Body: its class, and a planet's kind. */
export const BODY_CLASS_BY_BODY: Record<Body, readonly string[]> = {
  ceres: ["Asteroid"],
  chiron: ["Asteroid"],
  juno: ["Asteroid"],
  jupiter: ["Planet", "Social"],
  lilith: ["Point"],
  "lunar apogee": ["Point"],
  "lunar perigee": ["Point"],
  mars: ["Planet", "Personal"],
  mercury: ["Planet", "Personal"],
  moon: ["Luminary"],
  neptune: ["Planet", "Outer"],
  "north lunar node": ["Point"],
  pallas: ["Asteroid"],
  pluto: ["Planet", "Outer"],
  saturn: ["Planet", "Social"],
  "south lunar node": ["Point"],
  sun: ["Luminary"],
  uranus: ["Planet", "Outer"],
  venus: ["Planet", "Personal"],
  vesta: ["Asteroid"],
};

/**
 * The nature (hard, soft or neutral) and harmonic of each simple aspect.
 */
export const NATURE_AND_HARMONIC_BY_ASPECT: Record<
  Aspect,
  readonly [string, number]
> = {
  biquintile: ["Soft", 5],
  conjunct: ["Neutral", 1],
  decile: ["Soft", 10],
  novile: ["Soft", 9],
  opposite: ["Hard", 2],
  quincunx: ["Neutral", 12],
  quintile: ["Soft", 5],
  semisextile: ["Soft", 12],
  semisquare: ["Hard", 8],
  septile: ["Neutral", 7],
  sesquiquadrate: ["Hard", 8],
  sextile: ["Soft", 6],
  square: ["Hard", 4],
  tredecile: ["Soft", 10],
  trine: ["Soft", 3],
  undecile: ["Neutral", 11],
};

/** Nature and harmonic of each compound pattern, from its aspects. */
export const NATURE_AND_HARMONIC_BY_PATTERN: Readonly<
  Record<string, readonly [string, number]>
> = {
  Boomerang: ["Neutral", 12],
  Butterfly: ["Soft", 6],
  Cradle: ["Soft", 6],
  "Grand Cross": ["Hard", 4],
  "Grand Trine": ["Soft", 3],
  Hammer: ["Hard", 8],
  Hexagram: ["Soft", 6],
  Hourglass: ["Hard", 4],
  Kite: ["Soft", 6],
  "Mystic Rectangle": ["Soft", 6],
  Pentagram: ["Soft", 5],
  Stellium: ["Neutral", 1],
  "T Square": ["Hard", 4],
  Yod: ["Neutral", 12],
};

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const MINUTES_PER_YEAR = 365 * MINUTES_PER_DAY;

/**
 * Duration units, shortest first, with the minutes that reach each.
 */
export const DURATION_UNITS: readonly (readonly [
  name: string,
  minimumMinutes: number,
])[] = [
  ["Minutes", 1],
  ["Hours", MINUTES_PER_HOUR],
  ["Days", MINUTES_PER_DAY],
  ["Weeks", 7 * MINUTES_PER_DAY],
  ["Months", 30 * MINUTES_PER_DAY],
  ["Quarters", 91 * MINUTES_PER_DAY],
  ["Years", MINUTES_PER_YEAR],
  ["Decades", 10 * MINUTES_PER_YEAR],
  ["Centuries", 100 * MINUTES_PER_YEAR],
];
