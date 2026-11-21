import {
  PATTERNS_LABEL,
  UNKNOWN_CATEGORY,
} from "./meander-characteristics.constants";

import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "../../gallery/meander-gallery/meanders-api.types";
import type { CharacteristicGroup } from "./meander-characteristics.types";

// 🔏 Private Functions

/**
 * Groups what a meander holds: patterns first, then each catalog category by
 * name; an unlisted one is a number in "other".
 */
export function groupCharacteristics(
  held: GalleryMeander["characteristics"],
  catalog: readonly GalleryCharacteristic[],
): CharacteristicGroup[] {
  const groups = new Map<string, CharacteristicGroup>();

  for (const { isPattern, key, name, value } of held) {
    const entry = catalog.find((candidate) => candidate.key === key);
    const label = isPattern
      ? PATTERNS_LABEL
      : toLabel(entry?.category ?? UNKNOWN_CATEGORY);
    const group = groups.get(label) ?? { label, pills: [] };

    group.pills.push({
      description: entry?.description,
      isNumeric: entry?.valueType !== "boolean",
      key,
      name,
      value,
    });
    groups.set(label, group);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      pills: group.pills.toSorted((left, right) =>
        left.name.localeCompare(right.name),
      ),
    }))
    .toSorted((left, right) =>
      left.label === PATTERNS_LABEL
        ? -1
        : right.label === PATTERNS_LABEL
          ? 1
          : left.label.localeCompare(right.label),
    );
}

// 🌎 Public Functions

/**
 * Capitalizes a catalog category for a group's label.
 */
function toLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
