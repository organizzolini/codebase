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
  U: "undecile-32.7-icon.svg",
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
  // Directions, ingresses, apsides and the planets' cycles
  "→": "ingress-icon.svg",
  "↥": "rising-icon.svg",
  "↧": "setting-2-icon.svg",
  "↩": "retrograde-icon.svg",
  "↪": "prograde-icon.svg",
  "⛰": "ingress-peak-icon.svg",
  "❄": "apoapsis-icon.svg",
  "➡": "east-elongation-icon.svg",
  "⬅": "west-elongation-icon.svg",
  "🌐": "geocentric-eclipse-icon.svg",
  "📍": "local-eclipse-icon.svg",
  "📏": "elongation-icon.svg",
  "🔥": "periapsis-icon.svg",
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
 * The symbols drawn as more than one icon: the moon at its farthest and its
 * nearest, which are the moon with the apsis beside it, and the dragon of an
 * eclipse, which is the lunar nodes, its head and its tail.
 */
const FILES_BY_COMPOSITE_SYMBOL: Readonly<Record<string, readonly string[]>> = {
  "🌚": ["moon-icon.svg", "apoapsis-icon.svg"],
  "🌝": ["moon-icon.svg", "periapsis-icon.svg"],
  "🐉": ["north-node-icon.svg", "south-node-icon.svg"],
};

/**
 * The icons of a decan's number, which an ingress into the decan writes as
 * a keycap: the digit, then the keycap.
 */
const FILE_BY_DECAN: Readonly<Record<string, string>> = {
  "1": "ingress-first-decan-icon.svg",
  "2": "ingress-second-decan-icon.svg",
  "3": "ingress-third-decan-icon.svg",
};

/**
 * The icon of an event that is nothing but its one symbol, by its name, where
 * the symbol alone is shared with another event: the day, the night, each of the
 * of the hexadecans, whose emoji are a season's, and the dawns, dusks and
 * twilights, whose emoji the inner planets' phases and the daily cycle share.
 */
const FILE_BY_EVENT_NAME: Readonly<Record<string, string>> = {
  "Astronomical Dawn": "astronomical-dawn-icon.svg",
  "Astronomical Dusk": "astronomical-dusk-icon.svg",
  "Astronomical Twilight (Evening)": "astronomical-dusk-icon.svg",
  "Astronomical Twilight (Morning)": "astronomical-dawn-icon.svg",
  "Civil Dawn": "civil-dawn-icon.svg",
  "Civil Dusk": "civil-dusk-icon.svg",
  "Civil Twilight (Evening)": "civil-dusk-icon.svg",
  "Civil Twilight (Morning)": "civil-dawn-icon.svg",
  Daylight: "day-icon.svg",
  "Eleventh Hexadecan": "eleventh-hexadecan-icon.svg",
  "Fifteenth Hexadecan": "fifteenth-hexadecan-icon.svg",
  "Fifth Hexadecan": "fifth-hexadecan-icon.svg",
  "First Hexadecan": "first-hexadecan-icon.svg",
  "Nautical Dawn": "nautical-dawn-icon.svg",
  "Nautical Dusk": "nautical-dusk-icon.svg",
  "Nautical Twilight (Evening)": "nautical-dusk-icon.svg",
  "Nautical Twilight (Morning)": "nautical-dawn-icon.svg",
  Night: "night-icon.svg",
  "Ninth Hexadecan": "ninth-hexadecan-icon.svg",
  "Seventh Hexadecan": "seventh-hexadecan-icon.svg",
  "Third Hexadecan": "third-hexadecan-icon.svg",
  "Thirteenth Hexadecan": "thirteenth-hexadecan-icon.svg",
};

const KEYCAP = "\u20E3";

/**
 * The icons of the arrows that open an aspect's name: forming and
 * dissolving. Elsewhere the same arrows mean east and west, which draw the
 * elongation's own.
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
const VARIATION_SELECTORS = new Set(["\uFE0E", "\uFE0F"]);

// 🧩 Functions

/**
 * Splits an event's symbols into the icons that stand for them and the text
 * of what has no icon, one icon for each symbol and in the symbols' order, so
 * that icons run together as the emoji do. An event named in
 * `FILE_BY_EVENT_NAME` whose symbols are one symbol is that icon alone.
 */
export function toGlyphParts(glyphs: string, name = ""): GlyphPart[] {
  const chars = toCharacters(glyphs);
  const named = readNamedIcon(chars, name);

  if (named !== undefined) {
    return [{ ...named, id: "0", kind: "icon", symbol: glyphs }];
  }

  const parts: GlyphPart[] = [];

  for (let index = 0; index < chars.length;) {
    const found = readSymbol(chars, index, parts.length === 0);
    const length = found?.length ?? 1;
    const symbol = chars.slice(index, index + length).join("");

    if (found === undefined) {
      appendText(parts, symbol);
    }

    for (const icon of found?.icons ?? []) {
      parts.push({ ...icon, id: String(parts.length), kind: "icon", symbol });
    }

    index += length;
  }

  return parts;
}

/**
 * Adds text to the parts: a variation selector rides with the text before
 * it and is lost after an icon, and any other text joins the text before it.
 */
function appendText(parts: GlyphPart[], text: string): void {
  const last = parts.at(-1);

  if (last?.kind === "text") {
    last.text += text;
  } else if (!VARIATION_SELECTORS.has(text)) {
    parts.push({ id: String(parts.length), kind: "text", text });
  }
}

/**
 * The icon of an event named in `FILE_BY_EVENT_NAME` whose symbols are one
 * symbol, or `undefined` for any other.
 */
function readNamedIcon(
  chars: readonly string[],
  name: string,
): undefined | { file: string; url: string } {
  const file = FILE_BY_EVENT_NAME[name];
  const url = file === undefined ? undefined : URL_BY_FILE[file];
  const symbols = chars.filter(
    (character) => !VARIATION_SELECTORS.has(character),
  );

  return file === undefined || url === undefined || symbols.length !== 1
    ? undefined
    : { file, url };
}

/**
 * Reads the symbol at an index: the icons it is drawn as and how many
 * characters it takes, or `undefined` when it has no icon, or one that is not
 * among the files. A decan's digit takes its keycap with it.
 */
function readSymbol(
  chars: readonly string[],
  index: number,
  leading: boolean,
): undefined | { icons: { file: string; url: string }[]; length: number } {
  const character = chars.slice(index, index + 1).join("");
  const decan = FILE_BY_DECAN[character];
  const skip = chars[index + 1] === "\uFE0F" ? 2 : 1;
  const isKeycap = decan !== undefined && chars[index + skip] === KEYCAP;
  const files = isKeycap
    ? [decan]
    : (FILES_BY_COMPOSITE_SYMBOL[character] ?? [
        (leading ? FILE_BY_LEADING_SYMBOL[character] : undefined) ??
          FILE_BY_SYMBOL[character],
      ]);
  const icons: { file: string; url: string }[] = [];

  for (const file of files) {
    const url = file === undefined ? undefined : URL_BY_FILE[file];

    if (file === undefined || url === undefined) {
      return undefined;
    }

    icons.push({ file, url });
  }

  return { icons, length: isKeycap ? skip + 1 : 1 };
}

/**
 * Splits text into its characters, each whole, as a loop since spreading a
 * string would split some apart.
 */
function toCharacters(text: string): string[] {
  const chars: string[] = [];

  for (const character of text) {
    chars.push(character);
  }

  return chars;
}
