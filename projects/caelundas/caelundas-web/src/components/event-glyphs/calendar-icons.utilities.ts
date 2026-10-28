import {
  FILE_BY_DECAN,
  FILE_BY_EVENT_NAME,
  FILE_BY_LEADING_SYMBOL,
  FILE_BY_SYMBOL,
  FILES_BY_COMPOSITE_SYMBOL,
  KEYCAP,
  URL_BY_FILE,
  VARIATION_SELECTORS,
} from "./calendar-icons.constants";

import type { GlyphPart } from "./calendar-icons.types";

// 🌎 Public Functions

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
    index += appendSymbol(parts, chars, index);
  }

  return parts;
}

/**
 * Adds the symbol at an index to the parts, as its icons or as text, and
 * answers how many characters it took.
 */
function appendSymbol(
  parts: GlyphPart[],
  chars: readonly string[],
  index: number,
): number {
  const found = readSymbol(chars, index, parts.length === 0);
  const length = found?.length ?? 1;
  const symbol = chars.slice(index, index + length).join("");

  if (found === undefined) {
    appendText(parts, symbol);
  }

  for (const icon of found?.icons ?? []) {
    parts.push({ ...icon, id: String(parts.length), kind: "icon", symbol });
  }

  return length;
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
 * The files the symbol at an index is drawn with, and how many characters
 * it takes: a decan's digit with its keycap, or one character.
 */
function findSymbolFiles(
  chars: readonly string[],
  index: number,
  leading: boolean,
): { files: readonly (string | undefined)[]; length: number } {
  const character = chars.slice(index, index + 1).join("");
  const decan = FILE_BY_DECAN[character];
  const skip = chars[index + 1] === "\uFE0F" ? 2 : 1;

  if (decan !== undefined && chars[index + skip] === KEYCAP) {
    return { files: [decan], length: skip + 1 };
  }

  const leadingFile = leading ? FILE_BY_LEADING_SYMBOL[character] : undefined;

  return {
    files: FILES_BY_COMPOSITE_SYMBOL[character] ?? [
      leadingFile ?? FILE_BY_SYMBOL[character],
    ],
    length: 1,
  };
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
  const { files, length } = findSymbolFiles(chars, index, leading);
  const icons = toIcons(files);

  return icons === undefined ? undefined : { icons, length };
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

/**
 * The icons a symbol's files are drawn as, or `undefined` when one of them
 * is missing or not among the files.
 */
function toIcons(
  files: readonly (string | undefined)[],
): undefined | { file: string; url: string }[] {
  const icons: { file: string; url: string }[] = [];

  for (const file of files) {
    const url = file === undefined ? undefined : URL_BY_FILE[file];

    if (file === undefined || url === undefined) {
      return undefined;
    }

    icons.push({ file, url });
  }

  return icons;
}
