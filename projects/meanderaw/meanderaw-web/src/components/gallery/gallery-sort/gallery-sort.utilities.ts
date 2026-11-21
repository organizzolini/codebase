import { DEFAULT_SORT_FIELD } from "../../../hooks/use-gallery-search/use-gallery-search.constants";

import { SHAPE_SORT_FIELDS } from "./gallery-sort.constants";

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
 * The sort a link names if it is a shape field or in the catalog, else rows.
 */
export function resolveSortField(
  sort: string | undefined,
  characteristics: readonly GalleryCharacteristic[],
): string {
  const known =
    SHAPE_SORT_FIELDS.some(({ key }) => key === sort) ||
    characteristics.some(({ key }) => key === sort);

  return known && sort !== undefined ? sort : DEFAULT_SORT_FIELD;
}
