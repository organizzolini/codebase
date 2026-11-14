import { isWithinLimits } from "../gallery-filter-builder/filter-limits.utilities";

import { SHAPE_GROUP_FIELDS } from "./gallery-group-by.constants";

import type {
  FilterGroup,
  FilterRule,
} from "../gallery-filter-builder/gallery-filter-builder.types";
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
 * Whether a group's cards can still be read within the filter: its key rules
 * join the filter, and the API's caps on nesting and size hold for the whole.
 */
export function fitsGrouping(
  filter: FilterGroup | undefined,
  grouping: readonly string[],
): boolean {
  if (filter === undefined) {
    return true;
  }

  // One rule for a level, two for rows × columns, which names both.
  const keyRule: FilterRule = { field: "rows", operator: "eq", value: 0 };
  const keys = grouping.flatMap((key) =>
    key === "rowsColumns" ? [keyRule, keyRule] : [keyRule],
  );

  return isWithinLimits({
    combinator: "and",
    rules:
      filter.combinator === "and"
        ? [...keys, ...filter.rules]
        : [...keys, filter],
  });
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
