import { z } from "zod";

import { DEFAULT_REPEATS } from "../../../../../hooks/use-gallery-search/use-gallery-search.constants";
import {
  DEFAULT_ROWS_FILTER,
  REPEATS_FILTER_FIELD,
  ROWS_FILTER_FIELD,
} from "../filter-model/filter-model.constants";

import type { FilterField } from "../filter-model/filter-model.types";
import type { FilterLink } from "./filter-query.types";
import type { FilterOperator } from "@codebase/presentation";

// ♟️ Constants

/**
 * What the link holds by default: no tree, rows 4, repeats 12.
 */
export const DEFAULT_FILTER_LINK: FilterLink = {
  filter: undefined,
  repeats: DEFAULT_REPEATS,
  rows: DEFAULT_ROWS_FILTER,
};

/**
 * The id of the Filters tree's root group.
 */
export const ROOT_ID = "filter";

/**
 * The operators a number field takes, as the API names them.
 */
export const NUMBER_FIELD_OPERATORS: FilterOperator[] = [
  { inverse: "ne", label: "equals", value: "eq" },
  { inverse: "eq", label: "does not equal", value: "ne" },
  { inverse: "lte", label: "is greater than", value: "gt" },
  { inverse: "lt", label: "is at least", value: "gte" },
  { inverse: "gte", label: "is less than", value: "lt" },
  { inverse: "gt", label: "is at most", value: "lte" },
  { arity: "range", label: "is between", value: "between" },
];

/**
 * The operators a flag field takes.
 */
export const BOOLEAN_FIELD_OPERATORS: FilterOperator[] = [
  { inverse: "is_not", label: "is", value: "is" },
  { inverse: "is", label: "is not", value: "is_not" },
];

/**
 * The operators a text field takes.
 */
export const TEXT_FIELD_OPERATORS: FilterOperator[] = [
  { inverse: "ne", label: "equals", value: "eq" },
  { inverse: "eq", label: "does not equal", value: "ne" },
];

/**
 * The one operator the repeats rule takes.
 */
export const REPEATS_FIELD_OPERATORS: FilterOperator[] = [
  { label: "equals", value: "eq" },
];

/**
 * Why a half-typed or fractional number is refused.
 */
export const WHOLE_NUMBER_MESSAGE = "Enter a whole number.";

/**
 * The rows field by its key, for reading the rows rule alone.
 */
export const ROWS_FIELDS: ReadonlyMap<string, FilterField> = new Map([
  [ROWS_FILTER_FIELD.key, ROWS_FILTER_FIELD],
]);

/**
 * The repeats field by its key, for reading the repeats rule alone.
 */
export const REPEATS_FIELDS: ReadonlyMap<string, FilterField> = new Map([
  [REPEATS_FILTER_FIELD.key, REPEATS_FILTER_FIELD],
]);

/**
 * What a number rule's value may be, whole where counted.
 */
export const NUMBER_SCHEMAS = {
  fractional: {
    range: z.tuple([z.number(), z.number()]),
    single: z.number(),
  },
  whole: {
    range: z.tuple([z.int(), z.int()]),
    single: z.int(),
  },
} as const;
