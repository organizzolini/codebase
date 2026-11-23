import { normalizeConstellationName } from "../../use-night-sky.utilities";

import { RESET_SKY_KEYS, SKY_DEFAULTS } from "./night-sky-controls.constants";

import type { ConstellationListing } from "../../night-sky.types";
import type {
  SkyParameterKey,
  SkySearchChange,
} from "./night-sky-controls.types";

// 🔏 Private Functions

/**
 * The names of the constellations a choice of figures draws.
 */
export function listShownFigures(
  words: readonly string[],
  listing: readonly ConstellationListing[],
): Set<string> {
  const shown = new Set<string>();

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const { name, zodiac } of listing) {
    if (
      words.includes("all") ||
      (zodiac && words.includes("zodiac")) ||
      words.includes(normalizeConstellationName(name))
    ) {
      shown.add(name);
    }
  }

  return shown;
}

/**
 * Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes
 * `0.3` to the link.
 */
export function roundToStep(value: number, step: number): number {
  const decimals = String(step).split(".")[1]?.length ?? 0;

  return Number(value.toFixed(decimals));
}

/**
 * The change that writes a choice of figures: removed for `all`, the
 * default, `none` for no figure, and the words joined otherwise.
 */
export function toConstellationsChange(
  words: readonly string[],
): SkySearchChange {
  if (words.length === 1 && words[0] === "all") {
    return { "sky.constellations": undefined };
  }

  return {
    "sky.constellations": words.length === 0 ? "none" : words.join(","),
  };
}

// 🌎 Public Functions

/**
 * The change that hides the ecliptic, with `sky.ecliptic=false`, or removes
 * the key to draw it, its default.
 */
export function toEclipticChange(visible: boolean): SkySearchChange {
  return { "sky.ecliptic": visible ? undefined : false };
}

/** Shows or hides one constellation's figure among those chosen, renaming the choice tersely: `all`, the zodiac plus others, or each name. */
export function toggleFigure(
  words: readonly string[],
  listing: readonly ConstellationListing[],
  name: string,
): string[] {
  const shown = listShownFigures(words, listing);

  if (shown.has(name)) {
    shown.delete(name);
  } else {
    shown.add(name);
  }

  if (listing.length > 0 && shown.size === listing.length) {
    return ["all"];
  }

  const zodiacWhole = isZodiacWhole(shown, listing);
  const named = nameEach(shown, listing, zodiacWhole);

  return zodiacWhole ? ["zodiac", ...named] : named;
}

/**
 * The change the Default button makes: every key the menu sets, removed.
 */
export function toResetChange(): SkySearchChange {
  return Object.fromEntries(RESET_SKY_KEYS.map((key) => [key, undefined]));
}

/**
 * The change that writes one setting, or removes it when it is set back to
 * its default, so a link names only what differs.
 */
export function toSkyParameterChange(
  key: SkyParameterKey,
  value: number | string,
): SkySearchChange {
  return { [key]: isDefault(key, value) ? undefined : value };
}

/**
 * The change that shows the sky, by removing `sky`, or hides it with
 * `sky=off`.
 */
export function toVisibilityChange(visible: boolean): SkySearchChange {
  return { sky: visible ? undefined : "off" };
}

/**
 * Whether a value is its key's default, a color in any case.
 */
function isDefault(key: SkyParameterKey, value: number | string): boolean {
  const fallback = SKY_DEFAULTS[key];

  return typeof value === "string" && typeof fallback === "string"
    ? value.toLowerCase() === fallback.toLowerCase()
    : value === fallback;
}

/**
 * Whether every figure of the zodiac is among those shown.
 */
function isZodiacWhole(
  shown: ReadonlySet<string>,
  listing: readonly ConstellationListing[],
): boolean {
  const zodiac = listing.filter((constellation) => constellation.zodiac);

  return (
    zodiac.length > 0 &&
    zodiac.every((constellation) => shown.has(constellation.name))
  );
}

/**
 * Each shown figure's name, leaving out the zodiac's when they are named as a whole.
 */
function nameEach(
  shown: ReadonlySet<string>,
  listing: readonly ConstellationListing[],
  skipZodiac: boolean,
): string[] {
  const named: string[] = [];

  for (const constellation of listing) {
    if (
      shown.has(constellation.name) &&
      !(skipZodiac && constellation.zodiac)
    ) {
      named.push(normalizeConstellationName(constellation.name));
    }
  }

  return named;
}
