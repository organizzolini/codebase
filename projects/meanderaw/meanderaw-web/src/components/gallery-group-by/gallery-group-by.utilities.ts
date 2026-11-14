import { SHAPE_GROUP_FIELDS } from "./gallery-group-by.constants";

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
    ...SHAPE_GROUP_FIELDS.map(({ key, label }): GroupField => ({
      key,
      label,
      type: key === "isHardcoded" ? "boolean" : "text",
    })),
    ...characteristics.map(({ key, name, valueType }): GroupField => ({
      key,
      label: name,
      type: valueType === "boolean" ? "boolean" : "number",
    })),
  ];
}

/**
 * Keeps the levels a catalog can group by, once each, in order.
 */
export function resolveGrouping(
  grouping: readonly string[] | undefined,
  fields: readonly GroupField[],
): string[] {
  const kept: string[] = [];

  for (const key of grouping ?? []) {
    if (fields.some((field) => field.key === key) && !kept.includes(key)) {
      kept.push(key);
    }
  }

  return kept;
}
