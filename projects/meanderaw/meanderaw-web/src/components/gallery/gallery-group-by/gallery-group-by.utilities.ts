import { DEFAULT_GROUP_FIELD } from "../../../hooks/use-gallery-search/use-gallery-search.constants";

import { SHAPE_GROUP_FIELDS } from "./gallery-group-by.constants";

import type { SortEntry } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";
import type { GroupField } from "./gallery-group-by.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Builds the picker's fields: the shape fields, then the catalog.
 */
export function createGroupFields(
  characteristics: readonly GalleryCharacteristic[],
): GroupField[] {
  return [
    ...SHAPE_GROUP_FIELDS.map(({ description, key, label }): GroupField => ({
      category: "shape",
      description,
      key,
      label,
      type: "number",
    })),
    ...characteristics.map(
      ({ category, description, key, name, valueType }): GroupField => ({
        category,
        description,
        key,
        label: name,
        type: valueType === "boolean" ? "boolean" : "number",
      }),
    ),
  ];
}

/**
 * Keeps the levels the catalog groups by, once each; rows when the link
 * names none, flat when it names an empty list.
 */
export function resolveGrouping(
  grouping: readonly string[] | undefined,
  fields: readonly GroupField[],
): string[] {
  const kept: string[] = [];

  for (const key of grouping ?? [DEFAULT_GROUP_FIELD]) {
    if (fields.some((field) => field.key === key) && !kept.includes(key)) {
      kept.push(key);
    }
  }

  return kept;
}

/**
 * The sorts that make one sequence: each level ascending, then the person's
 * sorts, less any on a level.
 */
export function toSequenceSorts(
  grouping: readonly string[],
  sorts: readonly SortEntry[],
): SortEntry[] {
  return [
    ...grouping.map((field): SortEntry => ({ direction: "asc", field })),
    ...sorts.filter(({ field }) => !grouping.includes(field)),
  ];
}
