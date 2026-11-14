import {
  MAXIMUM_FILTER_DEPTH,
  MAXIMUM_FILTER_ENTRIES,
} from "./gallery-filter-builder.constants";

import type { FilterGroup, FilterRule } from "./gallery-filter-builder.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Counts the rules and groups a tree holds in all, the root excepted, which
 * is what the API caps.
 */
export function countEntries(group: FilterGroup): number {
  let count = 0;

  for (const node of group.rules) {
    count += "rules" in node ? 1 + countEntries(node) : 1;
  }

  return count;
}

/**
 * Whether a tree is within the API's caps on nesting and on size.
 */
export function isWithinLimits(group: FilterGroup): boolean {
  return (
    measureDepth(group) <= MAXIMUM_FILTER_DEPTH &&
    countEntries(group) <= MAXIMUM_FILTER_ENTRIES
  );
}

/**
 * Measures how deep groups nest, the root being level 1.
 */
export function measureDepth(group: FilterGroup): number {
  let deepest = 0;

  for (const node of group.rules) {
    if ("rules" in node) {
      deepest = Math.max(deepest, measureDepth(node));
    }
  }

  return deepest + 1;
}

/**
 * Puts a range's ends in order, low first, as the API takes it.
 */
export function normalizeRule(rule: FilterRule): FilterRule {
  const { value } = rule;

  return Array.isArray(value) && value[0] > value[1]
    ? { ...rule, value: [value[1], value[0]] }
    : rule;
}
