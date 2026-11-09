import type { ConstellationListing } from "./night-sky.types";

// 🔭 Defaults

export const DEFAULT_OPTIONS = {
  backgroundBottomColor: "#0d1533",
  backgroundTopColor: "#04060f",
  bottomAltitudeDegrees: 0,
  debug: false,
  ecliptic: true,
  eclipticColor: "#ffffff",
  eclipticOpacity: 0.12,
  eclipticWidth: 1,
  faintestMagnitude: 6.5,
  lineColor: "#ffffff",
  lineOpacity: 0.24,
  lineWidth: 0.8,
  pixelsPerSecond: 3,
  starScale: 1,
  still: false,
  verticalFieldOfViewDegrees: 90,
} as const;

/**
 * The default observer, at the north pole, where the view shows the northern ecliptic; longitude is New York's.
 */
export const DEFAULT_OBSERVER = {
  latitudeDegrees: 90,
  longitudeDegrees: -74,
} as const;

// ⏱ Page

/**
 * How long the window must stay the same size before the sky is asked for
 * again to fit it.
 */
export const RESIZE_DEBOUNCE_MILLISECONDS = 250;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// 📐 Geometry

/**
 * The pole stays at least this many degrees beyond the top edge.
 */
export const POLE_MARGIN_DEGREES = 1;

/**
 * The lowest bottom altitude `sky.altBottom` takes: below the horizon, so a pole view reaches the southern ecliptic.
 */
export const MINIMUM_BOTTOM_ALTITUDE_DEGREES = -45;

// 🎨 Color

// Three or six hexadecimal digits, with or without the leading `#`, which a
// link can only carry as `%23`.
export const COLOR_DIGITS_PATTERN = /^#?(?:[\da-f]{3}|[\da-f]{6})$/iu;

// ✳️ Constellations

/**
 * The words `sky.constellations` takes besides names: every figure, the
 * twelve zodiac constellations', or none.
 */
export const CONSTELLATION_WORDS = ["all", "none", "zodiac"] as const;

/**
 * The figures drawn when the link names none: the zodiac, faint enough to sit behind the calendar.
 */
export const DEFAULT_CONSTELLATIONS: readonly string[] = ["zodiac"];

/** The opacities `sky.lineOpacity` is clamped to. */
export const LINE_OPACITY_RANGE = { maximum: 1, minimum: 0 } as const;

/** The widths, in on-screen pixels, `sky.lineWidth` is clamped to. */
export const LINE_WIDTH_RANGE = { maximum: 10, minimum: 0 } as const;

/**
 * Every constellation with a figure, by Latin name, flagged when it is one of the zodiac's twelve.
 */
export const CONSTELLATIONS: readonly ConstellationListing[] = [
  { name: "Andromeda", zodiac: false },
  { name: "Antlia", zodiac: false },
  { name: "Apus", zodiac: false },
  { name: "Aquarius", zodiac: true },
  { name: "Aquila", zodiac: false },
  { name: "Ara", zodiac: false },
  { name: "Aries", zodiac: true },
  { name: "Auriga", zodiac: false },
  { name: "Boötes", zodiac: false },
  { name: "Caelum", zodiac: false },
  { name: "Camelopardalis", zodiac: false },
  { name: "Cancer", zodiac: true },
  { name: "Canes Venatici", zodiac: false },
  { name: "Canis Major", zodiac: false },
  { name: "Canis Minor", zodiac: false },
  { name: "Capricornus", zodiac: true },
  { name: "Carina", zodiac: false },
  { name: "Cassiopeia", zodiac: false },
  { name: "Centaurus", zodiac: false },
  { name: "Cepheus", zodiac: false },
  { name: "Cetus", zodiac: false },
  { name: "Chamaeleon", zodiac: false },
  { name: "Circinus", zodiac: false },
  { name: "Columba", zodiac: false },
  { name: "Coma Berenices", zodiac: false },
  { name: "Corona Austrina", zodiac: false },
  { name: "Corona Borealis", zodiac: false },
  { name: "Corvus", zodiac: false },
  { name: "Crater", zodiac: false },
  { name: "Crux", zodiac: false },
  { name: "Cygnus", zodiac: false },
  { name: "Delphinus", zodiac: false },
  { name: "Dorado", zodiac: false },
  { name: "Draco", zodiac: false },
  { name: "Equuleus", zodiac: false },
  { name: "Eridanus", zodiac: false },
  { name: "Fornax", zodiac: false },
  { name: "Gemini", zodiac: true },
  { name: "Grus", zodiac: false },
  { name: "Hercules", zodiac: false },
  { name: "Horologium", zodiac: false },
  { name: "Hydra", zodiac: false },
  { name: "Hydrus", zodiac: false },
  { name: "Indus", zodiac: false },
  { name: "Lacerta", zodiac: false },
  { name: "Leo", zodiac: true },
  { name: "Leo Minor", zodiac: false },
  { name: "Lepus", zodiac: false },
  { name: "Libra", zodiac: true },
  { name: "Lupus", zodiac: false },
  { name: "Lynx", zodiac: false },
  { name: "Lyra", zodiac: false },
  { name: "Mensa", zodiac: false },
  { name: "Microscopium", zodiac: false },
  { name: "Monoceros", zodiac: false },
  { name: "Musca", zodiac: false },
  { name: "Norma", zodiac: false },
  { name: "Octans", zodiac: false },
  { name: "Ophiuchus", zodiac: false },
  { name: "Orion", zodiac: false },
  { name: "Pavo", zodiac: false },
  { name: "Pegasus", zodiac: false },
  { name: "Perseus", zodiac: false },
  { name: "Phoenix", zodiac: false },
  { name: "Pictor", zodiac: false },
  { name: "Pisces", zodiac: true },
  { name: "Piscis Austrinus", zodiac: false },
  { name: "Puppis", zodiac: false },
  { name: "Pyxis", zodiac: false },
  { name: "Reticulum", zodiac: false },
  { name: "Sagitta", zodiac: false },
  { name: "Sagittarius", zodiac: true },
  { name: "Scorpius", zodiac: true },
  { name: "Sculptor", zodiac: false },
  { name: "Scutum", zodiac: false },
  { name: "Serpens", zodiac: false },
  { name: "Sextans", zodiac: false },
  { name: "Taurus", zodiac: true },
  { name: "Telescopium", zodiac: false },
  { name: "Triangulum", zodiac: false },
  { name: "Triangulum Australe", zodiac: false },
  { name: "Tucana", zodiac: false },
  { name: "Ursa Major", zodiac: false },
  { name: "Ursa Minor", zodiac: false },
  { name: "Vela", zodiac: false },
  { name: "Virgo", zodiac: true },
  { name: "Volans", zodiac: false },
  { name: "Vulpecula", zodiac: false },
];
