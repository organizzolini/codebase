import {
  createFilterQuery,
  createFilterRule,
  flattenFilterRules,
} from "@codebase/presentation";

import { libraryFilterSchema } from "../library-grid/library-grid-api.constants";

import {
  LIBRARY_ERA_OPTIONS,
  LIBRARY_FACET_FILTERS,
  LIBRARY_LIST_KEYS,
  LIBRARY_LIST_OPERATORS,
  LIBRARY_RANGE_FILTERS,
  LIBRARY_RANGE_OPERATORS,
} from "./library-toolbar.constants";

import type { LibraryFilterParameters } from "../library-grid/library-grid.types";
import type {
  LibraryFacetKey,
  LibraryFacetsResult,
} from "./library-toolbar.types";
import type {
  FilterField,
  FilterOperator,
  FilterOption,
  FilterQuery,
  FilterRule,
} from "@codebase/presentation";

// 🔏 Private Functions

/**
 * The fields the Filter menu offers; a field already in use is disabled so each filter appears once.
 */
export function createLibraryFilterFields(
  facets: LibraryFacetsResult,
  used: ReadonlySet<string>,
): FilterField[] {
  const range = (key: string, label: string): FilterField => ({
    disabled: used.has(key),
    id: key,
    label,
    operators: LIBRARY_RANGE_OPERATORS,
    type: "range",
  });
  const list = (
    key: string,
    label: string,
    options: FilterOption[],
  ): FilterField => ({
    disabled: used.has(key),
    id: key,
    label,
    operators: LIBRARY_LIST_OPERATORS,
    options,
    type: "multiselect",
  });
  const [authorYears, ...otherRanges] = LIBRARY_RANGE_FILTERS.map(
    ({ key, label }) => range(key, label),
  );

  return [
    list("eras", "Era", [...LIBRARY_ERA_OPTIONS]),
    ...(authorYears ? [authorYears] : []),
    ...LIBRARY_FACET_FILTERS.map(({ facet, label }) =>
      list(facet, label, toFacetOptions(facets, facet)),
    ),
    ...otherRanges,
  ];
}

/**
 * Whether two sets of filters ask the library the same thing.
 */
export function isSameFilters(
  left: Readonly<LibraryFilterParameters>,
  right: Readonly<LibraryFilterParameters>,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Reads the URL's filters from a filter tree, skipping chips still missing their condition or value.
 */
export function toFilterParameters(
  query: FilterQuery,
): LibraryFilterParameters {
  const raw: Record<string, unknown> = {};

  for (const rule of flattenFilterRules(query)) {
    const [key] = rule.path;
    if (key === undefined || rule.operator === "") {
      continue;
    }
    if (LIBRARY_LIST_KEYS.has(key)) {
      raw[key] = toStrings(rule.value);
    } else {
      raw[`${key}Minimum`] = toBound(rule.value, 0);
      raw[`${key}Maximum`] = toBound(rule.value, 1);
    }
  }

  return libraryFilterSchema.parse(raw);
}

/**
 * Builds the filter tree the URL's filters describe: one rule per filter that is set.
 */
export function toFilterQuery(
  filters: Readonly<LibraryFilterParameters>,
): FilterQuery {
  const lists: [string, readonly string[] | undefined][] = [
    ["eras", filters.eras],
    ["provinces", filters.provinces],
    ["inscriptionTypes", filters.inscriptionTypes],
    ["materials", filters.materials],
  ];
  const rules: FilterRule[] = [];

  for (const [key, values] of lists) {
    if (values !== undefined && values.length > 0) {
      rules.push(toRule(key, LIBRARY_LIST_OPERATORS, values));
    }
  }
  for (const { key } of LIBRARY_RANGE_FILTERS) {
    const minimum = filters[`${key}Minimum`];
    const maximum = filters[`${key}Maximum`];
    if (minimum !== undefined || maximum !== undefined) {
      rules.push(toRule(key, LIBRARY_RANGE_OPERATORS, [minimum, maximum]));
    }
  }

  return createFilterQuery(rules);
}

// 🌎 Public Functions

/** One bound of a range value, or undefined when it is empty. */
function toBound(value: unknown, index: 0 | 1): number | undefined {
  const bounds: unknown[] = Array.isArray(value) ? value : [];
  const bound = bounds[index];

  return typeof bound === "number" && !Number.isNaN(bound) ? bound : undefined;
}

/** The filter field's picks as option rows, each with its text count. */
function toFacetOptions(
  facets: LibraryFacetsResult,
  facet: LibraryFacetKey,
): { description: string; label: string; value: string }[] {
  return facets[facet].map(({ count, value }) => ({
    description: `${String(count)} ${count === 1 ? "text" : "texts"}`,
    label: value,
    value,
  }));
}

/** A rule on one field, using that field's only operator. */
function toRule(
  key: string,
  operators: readonly FilterOperator[],
  value: unknown,
): FilterRule {
  return createFilterRule({
    id: `rule-${key}`,
    operator: operators[0]?.value ?? "",
    path: [key],
    value,
  });
}

/** Picked values as strings, whatever shape the editor handed over. */
function toStrings(value: unknown): string[] {
  const items: unknown[] = Array.isArray(value) ? value : [];

  return items.filter((item): item is string => typeof item === "string");
}
