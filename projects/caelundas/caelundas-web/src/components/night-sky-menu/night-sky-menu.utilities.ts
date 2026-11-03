import { normalizeConstellationName } from "../../hooks/use-night-sky/use-night-sky.utilities";

import {
  MENU_KEYS,
  RESET_SKY_KEYS,
  SKY_DEFAULTS,
} from "./night-sky-menu.constants";

import type { ConstellationListing } from "../../hooks/use-night-sky/night-sky.types";
import type {
  FolderState,
  SkyParameterKey,
  SkySearchChange,
  SkySliderControl,
} from "./night-sky-menu.types";
import type { KeyboardEvent } from "react";

// 🔏 Private Functions

/**
 * A slider's value with its unit, rounded to its step.
 */
export function formatSliderValue(
  value: number,
  control: SkySliderControl,
): string {
  return `${String(roundToStep(value, control.step))}${control.unit}`;
}

// 🌎 Public Functions

/**
 * Keeps a key pressed in the panel from the menu around it, whose arrows
 * and type-to-find would take focus from a slider, except Escape and Tab.
 */
export function keepKeysInPanel(event: KeyboardEvent<HTMLElement>): void {
  if (!MENU_KEYS.has(event.key)) {
    event.stopPropagation();
  }
}

/**
 * The names of the constellations a choice of figures shows.
 */
export function listShownConstellations(
  words: readonly string[],
  listing: readonly ConstellationListing[],
): Set<string> {
  const wanted = new Set(words);

  return new Set(
    listing
      .filter(
        ({ name, zodiac }) =>
          wanted.has("all") ||
          (zodiac && wanted.has("zodiac")) ||
          wanted.has(normalizeConstellationName(name)),
      )
      .map(({ name }) => name),
  );
}

/**
 * Whether a folder's constellations all show, some do, or none.
 */
export function readFolderState(
  shown: ReadonlySet<string>,
  names: readonly string[],
): FolderState {
  const count = names.filter((name) => shown.has(name)).length;

  if (count === 0) {
    return "unchecked";
  }

  return count === names.length ? "checked" : "partial";
}

/**
 * A slider's moved value, rounded to its step, or the value it had for
 * anything it cannot read.
 */
export function readSliderValue(
  next: number | readonly number[],
  control: SkySliderControl,
  fallback: number,
): number {
  const value = typeof next === "number" ? next : (next[0] ?? fallback);

  return roundToStep(value, control.step);
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
 * The constellations filed in the picker's two folders: the zodiac's, then
 * every other, each in name order.
 */
export function splitConstellations(
  listing: readonly ConstellationListing[],
): Record<"other" | "zodiac", ConstellationListing[]> {
  const ordered = listing.toSorted((first, second) =>
    first.name.localeCompare(second.name),
  );

  return {
    other: ordered.filter((constellation) => !constellation.zodiac),
    zodiac: ordered.filter((constellation) => constellation.zodiac),
  };
}

/**
 * The change that writes a choice of figures: removed for the zodiac, the
 * default, `none` for no figure, and the words joined otherwise.
 */
export function toConstellationsChange(
  words: readonly string[],
): SkySearchChange {
  if (words.length === 1 && words[0] === "zodiac") {
    return { "sky.constellations": undefined };
  }

  return {
    "sky.constellations": words.length === 0 ? "none" : words.join(","),
  };
}

/**
 * The change that hides the ecliptic, with `sky.ecliptic=false`, or removes
 * the key to draw it, its default.
 */
export function toEclipticChange(visible: boolean): SkySearchChange {
  return { "sky.ecliptic": visible ? undefined : false };
}

/**
 * Shows or hides one constellation's figure among those chosen, naming the
 * choice again in its fewest words.
 */
export function toggleConstellation(
  words: readonly string[],
  listing: readonly ConstellationListing[],
  name: string,
): string[] {
  return toggleConstellations(words, listing, [name]);
}

/**
 * Shows every constellation of a folder when any is hidden, or hides them
 * all when all show, naming the choice again in its fewest words.
 */
export function toggleConstellations(
  words: readonly string[],
  listing: readonly ConstellationListing[],
  names: readonly string[],
): string[] {
  const shown = listShownConstellations(words, listing);
  const hide = names.every((name) => shown.has(name));

  for (const name of names) {
    if (hide) {
      shown.delete(name);
    } else {
      shown.add(name);
    }
  }

  return toConstellationWords(shown, listing);
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
 * The fewest words that name a set of constellations: `all`, the zodiac with
 * any others, or each by name.
 */
function toConstellationWords(
  shown: ReadonlySet<string>,
  listing: readonly ConstellationListing[],
): string[] {
  if (listing.length > 0 && listing.every(({ name }) => shown.has(name))) {
    return ["all"];
  }

  const zodiac = listing.filter((constellation) => constellation.zodiac);
  const withZodiac =
    zodiac.length > 0 && zodiac.every(({ name }) => shown.has(name));
  const others = listing
    .filter(
      ({ name, zodiac: isZodiac }) =>
        shown.has(name) && !(withZodiac && isZodiac),
    )
    .map(({ name }) => normalizeConstellationName(name));

  return withZodiac ? ["zodiac", ...others] : others;
}
