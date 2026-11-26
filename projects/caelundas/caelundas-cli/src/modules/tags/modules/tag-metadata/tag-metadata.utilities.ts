import { TAG_MENU_EXCLUSIONS } from "./tag-metadata-flags.constants";
import { TAG_NOTES } from "./tag-metadata-notes.constants";
import { TAG_ICON_BY_NAME, TAG_METADATA } from "./tag-metadata.constants";

import type {
  TagMenuFlag,
  TagMenuFlags,
  TagMetadata,
} from "./tag-metadata.types";

/**
 * Whether each menu offers the node at `path`: all do unless the path is among the exclusions.
 */
export function tagMenuFlags(path: readonly string[]): TagMenuFlags {
  const key = path.join(" / ");
  const offers = (flag: TagMenuFlag): boolean =>
    !TAG_MENU_EXCLUSIONS[flag].includes(key);

  return {
    isFilterable: offers("isFilterable"),
    isGroupable: offers("isGroupable"),
    isSelectable: offers("isSelectable"),
    isSortable: offers("isSortable"),
  };
}

/**
 * The icon and note of the node at `path`, from its metadata entry or the notes.
 */
export function tagMetadata(path: readonly string[]): TagMetadata {
  const key = path.join(" / ");
  const [, note = null] = TAG_METADATA[key] ?? [];

  return {
    icon: tagIcon(path),
    note:
      note ??
      TAG_NOTES[key] ??
      (key.startsWith("Planetary / Phase / ") && path.length === 4
        ? "A phase of the planet's cycle with the Sun."
        : null),
  };
}

/**
 * The icon of the node at `path`: its own entry, else one for its name or its last word, else the nearest ancestor's.
 */
function tagIcon(path: readonly string[]): null | string {
  const name = path.at(-1) ?? "";
  const own =
    TAG_METADATA[path.join(" / ")]?.[0] ??
    TAG_ICON_BY_NAME[name] ??
    TAG_ICON_BY_NAME[name.split(" ").at(-1) ?? ""];

  if (own !== undefined) {
    return own;
  }

  for (let length = path.length - 1; length > 0; length -= 1) {
    const inherited = TAG_METADATA[path.slice(0, length).join(" / ")]?.[0];

    if (inherited !== undefined) {
      return inherited;
    }
  }

  return null;
}
