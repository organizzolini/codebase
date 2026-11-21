import { MAXIMUM_PILLS } from "./meander-characteristics.constants";

import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "../../gallery/meander-gallery/meanders-api.types";
import type { CharacteristicPill } from "./meander-characteristics.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Lists what a meander holds, active characteristics first, each part by name, with catalog descriptions.
 */
export function listCharacteristics(
  held: GalleryMeander["characteristics"],
  catalog: readonly GalleryCharacteristic[],
  activeKeys: readonly string[] = [],
): CharacteristicPill[] {
  return held
    .map(({ key, name, value }) => {
      const entry = catalog.find((candidate) => candidate.key === key);

      return {
        description: entry?.description,
        isNumeric: entry?.valueType !== "boolean",
        key,
        name,
        value,
      };
    })
    .toSorted(
      (left, right) =>
        Number(activeKeys.includes(right.key)) -
          Number(activeKeys.includes(left.key)) ||
        left.name.localeCompare(right.name),
    );
}

/**
 * Splits pills into those shown, every active one then others up to four, and those under +N.
 */
export function splitPills(
  pills: readonly CharacteristicPill[],
  activeKeys: readonly string[],
): { hidden: CharacteristicPill[]; shown: CharacteristicPill[] } {
  const activeCount = pills.filter(({ key }) =>
    activeKeys.includes(key),
  ).length;
  const shownCount = Math.max(activeCount, MAXIMUM_PILLS);

  return {
    hidden: pills.slice(shownCount),
    shown: pills.slice(0, shownCount),
  };
}
