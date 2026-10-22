// ♟️ Constants
import type { Aspect, Body, Sign } from "../caelundas/caelundas.types";

/** The element of each sign, which an event in the sign also carries. */
export const ELEMENT_BY_SIGN: Record<Sign, string> = {
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

/** The modality of each sign, which an event in the sign also carries. */
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

/**
 * The polarity of each element: fire and air signs are positive, earth and
 * water signs negative.
 */
export const POLARITY_BY_ELEMENT: Readonly<Record<string, string>> = {
  Air: "Positive",
  Earth: "Negative",
  Fire: "Positive",
  Water: "Negative",
};

/**
 * The kind of each point of the annual solar cycle, and the season the Sun
 * is in at it: spring from the vernal equinox, summer from the summer
 * solstice, autumn from the autumnal equinox and winter from the winter
 * solstice, as the Sun's ecliptic longitude marks them.
 */
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

/**
 * The signs each of the seven traditional planets is dignified or debilitated
 * in, by dignity, strongest first. An ingress into a sign takes the first
 * dignity that lists it, so Mercury in Virgo is in its domicile though Virgo
 * is its exaltation as well; a sign no dignity lists leaves it peregrine.
 */
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

/**
 * The stage of its synodic cycle each Mercury, Venus and Mars phase event
 * marks. New and full fall at the conjunctions, the first and last morning
 * or evening sighting count as a rise or a set, and a morning or evening
 * star, like a visibility span, is a stage of visibility.
 */
export const SYNODIC_STAGE_BY_PHASE: Readonly<Record<string, string>> = {
  brightest: "Brightest",
  conjunction: "Conjunction",
  "eastern brightest": "Brightest",
  "eastern elongation": "Elongation",
  "epimethian conjunction": "Conjunction",
  "evening last": "Rise and set",
  "evening rise": "Rise and set",
  "evening set": "Rise and set",
  "evening star": "Visibility",
  "evening station": "Station",
  "evening visibility": "Visibility",
  full: "Conjunction",
  "inferior conjunction": "Conjunction",
  "morning first": "Rise and set",
  "morning rise": "Rise and set",
  "morning set": "Rise and set",
  "morning star": "Visibility",
  "morning station": "Station",
  "morning visibility": "Visibility",
  new: "Conjunction",
  opposition: "Opposition",
  "promethian conjunction": "Conjunction",
  "superior conjunction": "Conjunction",
  "western brightest": "Brightest",
  "western elongation": "Elongation",
};

/**
 * Where Mars's stages differ from the inner planets': as an outer planet it
 * is full at opposition, not at a superior conjunction.
 */
export const MARTIAN_SYNODIC_STAGE_BY_PHASE: Readonly<Record<string, string>> =
  {
    full: "Opposition",
  };

/** The class of each body, which an event involving the body also carries. */
export const BODY_CLASS_BY_BODY: Record<Body, string> = {
  ceres: "Asteroid",
  chiron: "Asteroid",
  juno: "Asteroid",
  jupiter: "Social",
  lilith: "Point",
  "lunar apogee": "Point",
  "lunar perigee": "Point",
  mars: "Personal",
  mercury: "Personal",
  moon: "Luminary",
  neptune: "Outer",
  "north lunar node": "Node",
  pallas: "Asteroid",
  pluto: "Outer",
  saturn: "Social",
  "south lunar node": "Node",
  sun: "Luminary",
  uranus: "Outer",
  venus: "Personal",
  vesta: "Asteroid",
};

/**
 * The nature and harmonic of each simple aspect: hard aspects divide the
 * circle by two and four, soft ones flow, and the rest are neutral. The
 * harmonic is the number the aspect divides the circle by.
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

/**
 * The nature and harmonic of each compound pattern, from the aspects that
 * make it up. A stellium is a cluster of conjunctions; a yod and a boomerang
 * rest on quincunxes, a hammer on sesquiquadrate aspects, and a grand cross and an
 * hourglass on squares and oppositions.
 */
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
