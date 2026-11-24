import { createContext } from "react";

// ♟️ Constants

/**
 * The icon a tag gets when it has none and its name has no symbol.
 */
export const GENERIC_TAG_ICON = "tag";

/**
 * No tag has an icon.
 */
export const NO_TAG_ICONS: ReadonlyMap<string, string> = new Map();

/**
 * Passes each tag's lucide icon, by the tag's id, from the facets to the pills drawing tags.
 */
export const TagIconsContext =
  createContext<ReadonlyMap<string, string>>(NO_TAG_ICONS);

/**
 * The symbol a tag is known by when it has no icon, by its name: bodies, signs, and aspects.
 */
export const GLYPH_BY_TAG_NAME: Readonly<Record<string, string>> = {
  // Bodies
  Ceres: "⚳",
  Chiron: "⚷",
  Juno: "⚵",
  Jupiter: "♃",
  Lilith: "⚸",
  Mars: "♂",
  Mercury: "☿",
  Moon: "🌙",
  Neptune: "♆",
  "North Node": "☊",
  Pallas: "⚴",
  Pluto: "♇",
  Saturn: "♄",
  "South Node": "☋",
  Sun: "☀️",
  Uranus: "♅",
  Venus: "♀",
  Vesta: "⚶",
  // Signs
  Aquarius: "♒",
  Aries: "♈",
  Cancer: "♋",
  Capricorn: "♑",
  Gemini: "♊",
  Leo: "♌",
  Libra: "♎",
  Pisces: "♓",
  Sagittarius: "♐",
  Scorpio: "♏",
  Taurus: "♉",
  Virgo: "♍",
  // Aspects
  Biquintile: "±",
  Conjunct: "☌",
  Decile: "⊥",
  Opposite: "☍",
  Quincunx: "⚻",
  Quintile: "⬠",
  Semisextile: "⚺",
  Semisquare: "∠",
  Sesquiquadrate: "⚼",
  // Moon phases and the Moon's apsides
  Apogee: "🌚",
  "First Quarter": "🌓",
  Full: "🌕",
  "Last Quarter": "🌗",
  "Lunar Apogee": "🌚",
  "Lunar Perigee": "🌝",
  New: "🌑",
  Perigee: "🌝",
  Sextile: "⚹",
  Square: "□",
  Tridecile: "∓",
  Trine: "△",
  "Waning Crescent": "🌘",
  "Waning Gibbous": "🌖",
  "Waxing Crescent": "🌒",
  "Waxing Gibbous": "🌔",
};
