import { SHAPE_SORT_FIELDS } from "./gallery-sort.constants";

import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The sort a link names if it is a shape field or in the catalog, else none.
 */
export function resolveSortField(
  sort: string | undefined,
  characteristics: readonly GalleryCharacteristic[],
): string | undefined {
  const known =
    SHAPE_SORT_FIELDS.some(({ key }) => key === sort) ||
    characteristics.some(({ key }) => key === sort);

  return known ? sort : undefined;
}
