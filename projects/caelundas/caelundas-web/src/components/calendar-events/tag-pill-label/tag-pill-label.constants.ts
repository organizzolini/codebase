import { createContext } from "react";

// ♟️ Constants

/**
 * The icon a tag gets with no icon or symbol.
 */
export const GENERIC_TAG_ICON = "tag";

/**
 * The icon of a tag by name, when it has no symbol.
 */
export const ICON_BY_TAG_NAME: Readonly<Record<string, string>> = {
  Unique: "fingerprint",
};

/**
 * No tag has an icon.
 */
export const NO_TAG_ICONS: ReadonlyMap<string, string> = new Map();

/**
 * Passes each tag's icon, by id, to the pills.
 */
export const TagIconsContext =
  createContext<ReadonlyMap<string, string>>(NO_TAG_ICONS);

/**
 * A tag's symbol by name: bodies, signs, aspects, moon phases.
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
  "North Lunar Node": "☊",
  "North Node": "☊",
  Pallas: "⚴",
  Pluto: "♇",
  Saturn: "♄",
  "South Lunar Node": "☋",
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
  // Days of the Sun's year, with the symbols their events carry
  "Autumnal Equinox": "🍂",
  Beltane: "🌼",
  "Eleventh Hexadecan": "🧤",
  "Fifteenth Hexadecan": "🌨️",
  "Fifth Hexadecan": "⛱️",
  "First Hexadecan": "🌳",
  Imbolc: "🐑",
  Lammas: "🌾",
  "Ninth Hexadecan": "🍁",
  Samhain: "🎃",
  "Seventh Hexadecan": "🎑",
  "Summer Solstice": "🌞",
  "Third Hexadecan": "🌻",
  "Thirteenth Hexadecan": "❄️",
  "Vernal Equinox": "🌸",
  "Winter Solstice": "☃️",
  // Ingresses, with the symbols their events carry
  Ingress: "→",
  Peak: "⛰",
  // The twilights, with the symbols their events carry
  "Astronomical Dawn": "🌠",
  "Astronomical Dusk": "🌌",
  "Astronomical Twilight": "🌌",
  "Civil Dawn": "🌄",
  "Civil Dusk": "🌇",
  Daylight: "☀️",
  "Nautical Dawn": "🌅",
  "Nautical Dusk": "🌉",
  "Nautical Twilight": "🌉",
  Night: "🌃",
  Twilight: "🌆",
  // Compound aspects: classes, patterns and stelliums by their bodies
  "3 Body": "✨",
  "4 Body": "🌟",
  "5 Body": "⭐",
  "6 Body": "💫",
  "7 Body": "🌠",
  Boomerang: "🪃",
  Butterfly: "🦋",
  Cradle: "🛏",
  "Grand Cross": "➕",
  "Grand Trine": "△",
  Hammer: "🔨",
  Hexagram: "🔯",
  Hourglass: "⏳",
  Kite: "🪁",
  "Mystic Rectangle": "🚪",
  Pentagram: "⭐",
  Quadruple: "🌟",
  Quintuple: "⭐",
  Sextuple: "💫",
  Stellium: "🎆",
  Triple: "✨",
  "T Square": "⊤",
  Yod: "⚛",
};
