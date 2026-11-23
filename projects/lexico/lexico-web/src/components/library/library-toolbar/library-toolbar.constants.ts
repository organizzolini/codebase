import { AuthorEra } from "../../../graphql/generated/operations";
import { LIBRARY_ATTRIBUTE_ICONS } from "../library-sort/library-sort.constants";

import type { FilterOperator } from "@codebase/presentation";

// ♟️ Constants

/** Names the Filter button for a reader who cannot see its icon. */
export const FILTER_BUTTON_LABEL = "Filter";

/** The one operator of a multi-select filter. */
export const LIBRARY_LIST_OPERATORS: FilterOperator[] = [
  { arity: "many", label: "is any of", value: "is_any_of" },
];

/** The one operator of a range filter. */
export const LIBRARY_RANGE_OPERATORS: FilterOperator[] = [
  { arity: "range", label: "is between", value: "between" },
];

/** Filters that pick from a fixed list of eras. */
export const LIBRARY_ERA_OPTIONS = [
  { label: "Archaic", value: AuthorEra.Archaic },
  { label: "Classical", value: AuthorEra.Classical },
  { label: "Imperial", value: AuthorEra.Imperial },
  { label: "Late", value: AuthorEra.Late },
  { label: "Medieval", value: AuthorEra.Medieval },
  { label: "Neo-Latin", value: AuthorEra.NeoLatin },
] as const;

/** Multi-select filters fed by a facet list, in menu order. */
export const LIBRARY_FACET_FILTERS = [
  { facet: "provinces", label: "Inscription province" },
  { facet: "inscriptionTypes", label: "Inscription type" },
  { facet: "materials", label: "Material" },
] as const;

/** Range filters; the URL carries each as key plus Minimum or Maximum. */
export const LIBRARY_RANGE_FILTERS = [
  { key: "authorYears", label: "Author years" },
  { key: "inscriptionYears", label: "Inscription years" },
  { key: "printYears", label: "Print year" },
  { key: "lineCount", label: "Line count" },
  { key: "wordCount", label: "Word count" },
] as const;

/** Each filter's icon, by the key the URL uses for it. */
export const LIBRARY_FILTER_ICONS = {
  authorYears: LIBRARY_ATTRIBUTE_ICONS.authorYears,
  eras: LIBRARY_ATTRIBUTE_ICONS.era,
  inscriptionTypes: LIBRARY_ATTRIBUTE_ICONS.inscriptionType,
  inscriptionYears: LIBRARY_ATTRIBUTE_ICONS.inscriptionYears,
  lineCount: LIBRARY_ATTRIBUTE_ICONS.lineCount,
  materials: LIBRARY_ATTRIBUTE_ICONS.material,
  printYears: LIBRARY_ATTRIBUTE_ICONS.printYear,
  provinces: LIBRARY_ATTRIBUTE_ICONS.province,
  wordCount: LIBRARY_ATTRIBUTE_ICONS.wordCount,
} as const;

/** Every filter key that holds a list, in the URL's names. */
export const LIBRARY_LIST_KEYS: ReadonlySet<string> = new Set([
  "eras",
  ...LIBRARY_FACET_FILTERS.map(({ facet }) => facet),
]);

/** Joins a strip's chips to its button: each chip overlaps the border before it, every segment overlaps the one before it and is squared, and only the last chip's last segment keeps its right corners. */
export const LIBRARY_STRIP_CHIPS =
  "[&>div]:flex [&>div]:ml-[-1px] [&>div>*]:rounded-none [&>div>*+*]:ml-[-1px] [&>div:last-child>*:last-child]:rounded-r-lg";

/** Joins the Filter button and every filter chip into one group: a chip's first segment loses its left corners and border, the last segment of every chip but the last loses its right corners, and no segment wraps its text. */
export const LIBRARY_FILTER_STRIP =
  "max-w-full shrink-0 overflow-x-auto [&>[data-slot=filter-chip]>*]:whitespace-nowrap [&>[data-slot=filter-chip]>:first-child]:rounded-l-none [&>[data-slot=filter-chip]>:first-child]:border-l-0 [&>[data-slot=filter-chip]:not(:last-child)>:last-child]:rounded-r-none!";
