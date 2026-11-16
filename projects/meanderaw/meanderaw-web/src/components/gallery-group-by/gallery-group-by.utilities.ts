import {
  countEntries,
  measureDepth,
} from "../gallery-filter-builder/filter-limits.utilities";

import {
  API_MAXIMUM_DEPTH,
  API_MAXIMUM_ENTRIES,
  SHAPE_GROUP_FIELDS,
} from "./gallery-group-by.constants";

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
 * Whether the page's rows rule, the key rules and the filter's tree, nested
 * whole, stay within the API's caps.
 */
export function fitsGrouping(
  filter: FilterGroup | undefined,
  grouping: readonly string[],
): boolean {
  // The rows rule, then one rule for a level, two for rows × columns.
  const rule: FilterRule = { field: "rows", operator: "eq", value: 0 };
  const keys = grouping.flatMap((key) =>
    key === "rowsColumns" ? [rule, rule] : [rule],
  );
  const wrapper: FilterGroup = {
    combinator: "and",
    rules: [rule, ...keys, ...(filter === undefined ? [] : [filter])],
  };

  return (
    measureDepth(wrapper) <= API_MAXIMUM_DEPTH &&
    countEntries(wrapper) <= API_MAXIMUM_ENTRIES
  );
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
