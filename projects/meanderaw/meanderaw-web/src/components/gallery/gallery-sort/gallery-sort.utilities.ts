import { DEFAULT_SORTS } from "../../../hooks/use-gallery-search/use-gallery-search.constants";

import { SHAPE_SORT_FIELDS } from "./gallery-sort.constants";

import type { SortEntry } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { PickerField } from "../gallery-cascader/gallery-cascader.types";
import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Builds the checklist's fields: the shape fields, then the catalog.
 */
export function createSortFields(
  characteristics: readonly GalleryCharacteristic[],
): PickerField[] {
  return [
    ...SHAPE_SORT_FIELDS.map(({ description, key, label }): PickerField => ({
      category: "shape",
      description,
      key,
      label,
    })),
    ...characteristics.map(
      ({ category, description, key, name }): PickerField => ({
        category,
        description,
        key,
        label: name,
      }),
    ),
  ];
}

/**
 * The sorts a link names that are shape fields or in the catalog, each once;
 * rows ascending when none is left.
 */
export function resolveSorts(
  sorts: readonly SortEntry[] | undefined,
  characteristics: readonly GalleryCharacteristic[],
): SortEntry[] {
  const kept: SortEntry[] = [];

  for (const entry of sorts ?? []) {
    const known =
      SHAPE_SORT_FIELDS.some(({ key }) => key === entry.field) ||
      characteristics.some(({ key }) => key === entry.field);

    if (known && !kept.some(({ field }) => field === entry.field)) {
      kept.push(entry);
    }
  }

  return kept.length === 0 ? [...DEFAULT_SORTS] : kept;
}

/**
 * Flips the direction of the sort at a place, leaving the rest as they are.
 */
export function reverseSort(
  sorts: readonly SortEntry[],
  index: number,
): SortEntry[] {
  return sorts.map((entry, position) =>
    position === index
      ? { ...entry, direction: entry.direction === "asc" ? "desc" : "asc" }
      : entry,
  );
}
