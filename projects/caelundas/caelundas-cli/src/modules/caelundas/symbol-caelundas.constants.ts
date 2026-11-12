// 🪧 Signs

/** Maps each zodiac sign to its Unicode symbol. */
export const symbolBySign = {
  aquarius: "♒︎",
  aries: "♈",
  cancer: "♋︎",
  capricorn: "♑︎",
  gemini: "♊︎",
  leo: "♌︎",
  libra: "♎︎",
  pisces: "♓︎",
  sagittarius: "♐︎",
  scorpio: "♏︎",
  taurus: "♉︎",
  virgo: "♍︎",
} as const;

// 🔟 Decans

/** Maps each decan number (1-3) to its emoji. */
export const symbolByDecan = {
  "1": "1️⃣",
  "2": "2️⃣",
  "3": "3️⃣",
} as const;

// 🪐 Planets

/** Maps each classical and modern planet to its Unicode symbol. */
export const symbolByPlanet = {
  jupiter: "♃",
  mars: "♂️",
  mercury: "☿",
  moon: "🌙",
  neptune: "♆",
  pluto: "♇",
  saturn: "♄",
  sun: "☀️",
  uranus: "♅",
  venus: "♀️",
} as const;

// 💫 Asteroids

/** Maps each asteroid to its Unicode symbol. */
export const symbolByAsteroid = {
  ceres: "⚳",
  chiron: "⚷",
  juno: "⚵",
  lilith: "⚸",
  pallas: "⚴",
  vesta: "⚶",
} as const;

// ☄️ Comets

/**
 * Maps each comet to its emoji representation.
 * Currently includes Halley's comet as the most notable periodic comet.
 */
// export const symbolByComet = {
//   halley: "☄",
// } as const;

// 🌕 Nodes

/** Maps lunar nodes and apsides to their symbols. */
export const symbolByNode = {
  "lunar apogee": "🌚",
  "lunar perigee": "🌝",
  "north lunar node": "☊",
  "south lunar node": "☋",
} as const;

// 🔭 Bodies

/** Maps every celestial body to its symbol. */
export const symbolByBody = {
  ...symbolByPlanet,
  ...symbolByAsteroid,
  ...symbolByNode,
} as const;

// 🧭 Aspects

// 📐 Major Aspects

/** Maps each Ptolemaic aspect to its Unicode symbol. */
export const symbolByMajorAspect = {
  conjunct: "☌",
  opposite: "☍",
  sextile: "⚹",
  square: "□",
  trine: "△",
} as const;

// 🖇️ Minor Aspects

/** Maps each minor aspect to its Unicode symbol. */
export const symbolByMinorAspect = {
  quincunx: "⚻",
  semisextile: "⚺",
  semisquare: "∠",
  sesquiquadrate: "⚼",
} as const;

// 🧮 Specialty Aspects

/** Maps each harmonic aspect to its symbol. */
export const symbolBySpecialtyAspect = {
  biquintile: "±",
  decile: "⊥",
  novile: "N",
  quintile: "⬠",
  septile: "S",
  tredecile: "∓",
  undecile: "U",
} as const;

// 🔺 Triple Aspects

/** Maps three-planet aspect patterns to their symbols. */
export const symbolByTripleAspect = {
  "grand trine": "△",
  hammer: "🔨",
  "t-square": "⊤",
  yod: "⚛",
} as const;

// ✖️ Quadruple Aspects

/** Maps four-planet aspect patterns to their symbols. */
export const symbolByQuadrupleAspect = {
  boomerang: "🪃",
  butterfly: "🦋",
  cradle: "🛏",
  "grand cross": "➕",
  hourglass: "⏳",
  kite: "🪁",
  "mystic rectangle": "🚪",
} as const;

// ⭐ Quintuple Aspects

/** Maps five-planet aspect patterns to their symbols. */
export const symbolByQuintupleAspect = {
  pentagram: "⭐",
} as const;

// 🔯 Sextuple Aspects

/** Maps six-planet aspect patterns to their symbols. */
export const symbolBySextupleAspect = {
  hexagram: "🔯",
} as const;

// ✨ Stellium

/** Maps stelliums (3+ planets together) to emoji. */
export const symbolByStellium = {
  "decuple stellium": "☀️",
  "duodecuple stellium": "🔥",
  "nonuple stellium": "🔆",
  "octuple stellium": "✴️",
  "quadruple stellium": "🌟",
  "quintuple stellium": "⭐",
  "septuple stellium": "🌠",
  "sextuple stellium": "💫",
  "triple stellium": "✨",
  "undecuple stellium": "🌞",
} as const;

// 🔁 Orbital Directions

/** Maps orbital motion directions to emoji symbols. */
export const symbolByOrbitalDirection = {
  direct: "↪️",
  prograde: "↪️",
  retrograde: "↩️",
} as const;

// ⏫ Planetary Directions

// export const symbolByPlanetaryDirection = {
//   rise: "🔼",
//   ascendant: "🔼",

//   zenith: "⏫",
//   "medium coeli": "⏫",
//   culmination: "⏫",

//   set: "🔽",
//   descendant: "🔽",

//   nadir: "⏬",
//   "imum coeli": "⏬",
//   declination: "⏬",
// } as const;

// 🧭 Directions

// export const symbolByDirection = {
//   ...symbolByOrbitalDirection,
//   ...symbolByPlanetaryDirection,
// };

// 🌐 Positions

// export const symbolByApsis = {
//   perihelion: "🔥",
//   aphelion: "❄️",
//   perigee: "🔥",
//   apogee: "❄️",
//   periapsis: "🔥",
//   apoapsis: "❄️",
// } as const;

// 🌓 Phases

/** Maps lunar phases to their emoji. */
export const symbolByLunarPhase = {
  "first quarter": "🌓",
  full: "🌕",
  "last quarter": "🌗",
  new: "🌑",
  "waning crescent": "🌘",
  "waning gibbous": "🌖",
  "waxing crescent": "🌒",
  "waxing gibbous": "🌔",
} as const;

// ♀️ Venusian Phases

/** Maps Venus's phases and synodic events to emoji combinations. */
export const symbolByVenusianPhase = {
  "inferior conjunction": "🌑☌",
  new: "🌑",

  "morning rise": "🌄↥",
  "morning set": "🌄↧",
  "morning station": "🌄⏹️",
  "western brightest": "🔆",
  "western elongation": "⬅️📏",

  full: "🌕",
  "superior conjunction": "🌕☌",

  "eastern brightest": "🔆",
  "eastern elongation": "📏➡️",
  "evening rise": "🌇↥",
  "evening set": "🌇↧",
  "evening station": "🌇⏹️",
} as const;

// ☿️ Mercurian Phases

/** Maps Mercury's phases and synodic events to emoji combinations. */
export const symbolByMercurianPhase = {
  "inferior conjunction": "🌑☌",
  new: "🌑",
  "promethian conjunction": "🌑☌",

  "morning rise": "🌄↥",
  "morning set": "🌄↧",
  "western brightest": "🔆",
  "western elongation": "⬅️📏",

  "epimethian conjunction": "🌕☌",
  full: "🌕",
  "superior conjunction": "🌕☌",

  "eastern brightest": "🔆",
  "eastern elongation": "📏➡️",
  "evening rise": "🌇↥",
  "evening set": "🌇↧",
} as const;

// ♂️ Martian Phases

/** Maps Mars's phases and synodic events to emoji combinations. */
export const symbolByMartianPhase = {
  conjunction: "🌑☌",
  "morning star": "🌄🌟",
  new: "🌑",

  "morning first": "🌄🌖",
  "morning rise": "🌄↥",
  "morning set": "🌄↧",
  "morning station": "🌄⏹️",

  "evening star": "🌇🌟",
  full: "🌕",
  opposition: "🌕☍",

  brightest: "🌟",

  "evening last": "🌇🌘",
  "evening rise": "🌇↥",
  "evening set": "🌇↧",
  "evening station": "🌇⏹️",
} as const;
