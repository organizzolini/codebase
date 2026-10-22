// 🔖 Type

/**
 * One piece of an event's symbols: an icon that stands for a symbol, or the
 * text of whatever has no icon, such as a hyphen or an emoji.
 */
export type GlyphPart =
  | { file: string; id: string; kind: "icon"; symbol: string; url: string }
  | { id: string; kind: "text"; text: string };

// 🔖 Constants

/**
 * The icon file of each symbol an ingested event's name is written with,
 * keyed by its code point alone, without a variation selector.
 */
const FILE_BY_SYMBOL: Readonly<Record<string, string>> = {
  // Bodies
  "☀": "sun-icon.svg",
  "☊": "north-node-icon.svg",
  "☋": "south-node-icon.svg",
  "☿": "mercury-icon.svg",
  "♀": "venus-icon.svg",
  "♂": "mars-icon.svg",
  "♃": "jupiter-icon.svg",
  "♄": "saturn-icon.svg",
  "♅": "uranus-icon.svg",
  "♆": "neptune-icon.svg",
  "♇": "pluto-icon.svg",
  "⚳": "ceres-icon.svg",
  "⚴": "pallas-icon.svg",
  "⚵": "juno-icon.svg",
  "⚶": "vesta-icon.svg",
  "⚷": "chiron-icon.svg",
  "⚸": "lilith-icon.svg",
  "🌙": "moon-icon.svg",
  // Signs
  "♈": "aries-icon.svg",
  "♉": "taurus-icon.svg",
  "♊": "gemini-icon.svg",
  "♋": "cancer-icon.svg",
  "♌": "leo-icon.svg",
  "♍": "virgo-icon.svg",
  "♎": "libra-icon.svg",
  "♏": "scorpio-icon.svg",
  "♐": "sagitarius-icon.svg",
  "♑": "capricorn-icon.svg",
  "♒": "aquarius-icon.svg",
  "♓": "pisces-icon.svg",
  // Aspects
  "±": "biquintile-144-icon.png",
  "∓": "tridecile-108-icon.png",
  "∠": "octile-45-icon.png",
  "⊥": "decile-36-icon.png",
  "□": "square-90-icon.png",
  "△": "trine-120-icon.png",
  "☌": "conjunction-0-icon.png",
  "☍": "opposition-180-icon.png",
  "⚹": "sextile-60-icon.png",
  "⚺": "semisextile-30-icon.png",
  "⚻": "quincunx-150-icon.png",
  "⚼": "trioctile-135-icon.png",
  "⬠": "quintile-72-icon.png",
  N: "novile-40-icon.png",
  S: "septile-51.43-icon.png",
  // Patterns and the stellium the data writes
  "⊤": "t-square-icon.png",
  "⏳": "hourglass-icon.png",
  "⚛": "yod-icon.png",
  "✨": "triple-stellium-icon.png",
  "➕": "grand-cross-icon.png",
  "⭐": "pentagram-icon.png",
  "🌟": "quadruple-stellium-icon.png",
  "💫": "sextuple-stellium-icon.png",
  "🔨": "hammer-icon.png",
  "🔯": "hexagram-icon.png",
  "🦋": "butterfly-icon.png",
  "🪁": "kite-icon.png",
  "🪃": "boomerang-icon.png",
  "🚪": "mystic-rectangle-icon.png",
  "🛏": "cradle-icon.png",
  // Lunar phases
  "🌑": "new-moon-icon.png",
  "🌒": "waxing-crescent-moon-icon.png",
  "🌓": "first-quarter-moon-icon.png",
  "🌔": "waxing-gibbous-moon-icon.png",
  "🌕": "full-moon-icon.png",
  "🌖": "waning-gibbous-moon-icon.png",
  "🌗": "last-quarter-moon-icon.png",
  "🌘": "waning-crescent-moon-icon.png",
  // Daily cycles and phases of the inner planets
  "⏫": "zenith-icon.svg",
  "⏬": "nadir-icon.svg",
  "🌄": "morning-star-icon.svg",
  "🌇": "evening-star-icon.svg",
  "🔆": "maximum-brightness-icon.svg",
  "🔼": "rising-icon.svg",
  "🔽": "setting-2-icon.svg",
  // Seasons
  "☃": "yule-icon.png",
  "🌞": "litha-icon.png",
  "🌸": "ostara-icon.png",
  "🌼": "beltane-icon.png",
  "🌾": "lammas-icon.png",
  "🍂": "mabon-icon.png",
  "🎃": "samhain-icon.png",
  "🐑": "imbolc-icon.png",
};

/**
 * The icons of the arrows that open an aspect's name: forming and
 * dissolving. Elsewhere the same arrows mean east and west, which have none.
 */
const FILE_BY_LEADING_SYMBOL: Readonly<Record<string, string>> = {
  "➡": "waxing-icon.png",
  "⬅": "waning-icon.png",
};

/**
 * Where the files are served from, by file name.
 */
const URL_BY_FILE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../../assets/icons/*", {
      eager: true,
      import: "default",
      query: "?url",
    }),
  ).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1), url]),
);

/**
 * The variation selectors that ask for a text or an emoji look; an icon is
 * the same for either.
 */
const VARIATION_SELECTORS = new Set(["︎", "️"]);

// 🧩 Functions

/**
 * Splits an event's symbols into the icons that stand for them and the text
 * of what has no icon, one icon for each symbol and in the symbols' order, so
 * that icons run together as the emoji do.
 */
export function toGlyphParts(glyphs: string): GlyphPart[] {
  const parts: GlyphPart[] = [];

  for (const symbol of glyphs) {
    const last = parts.at(-1);
    const file =
      parts.length === 0
        ? (FILE_BY_LEADING_SYMBOL[symbol] ?? FILE_BY_SYMBOL[symbol])
        : FILE_BY_SYMBOL[symbol];
    const url = file === undefined ? undefined : URL_BY_FILE[file];

    if (VARIATION_SELECTORS.has(symbol)) {
      if (last?.kind === "text") {
        last.text += symbol;
      }
    } else if (file === undefined || url === undefined) {
      if (last?.kind === "text") {
        last.text += symbol;
      } else {
        parts.push({ id: String(parts.length), kind: "text", text: symbol });
      }
    } else {
      parts.push({ file, id: String(parts.length), kind: "icon", symbol, url });
    }
  }

  return parts;
}
