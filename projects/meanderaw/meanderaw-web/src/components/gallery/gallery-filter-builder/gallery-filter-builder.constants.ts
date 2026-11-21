import { z } from "zod";

import type { MeanderFilterOperator } from "../../../graphql/generated/operations";
import type {
  FilterCombinator,
  FilterField,
  FilterFieldType,
  FilterGroup,
  FilterOperator,
  RowsFilter,
} from "./gallery-filter-builder.types";

// ♟️ Constants

/**
 * The two ways a group joins what is in it.
 */
export const FILTER_COMBINATORS = [
  "and",
  "or",
] as const satisfies readonly FilterCombinator[];

/**
 * Every operator a rule may name, as a link writes it.
 */
export const FILTER_OPERATORS = [
  "between",
  "eq",
  "gt",
  "gte",
  "is",
  "is_not",
  "lt",
  "lte",
  "ne",
] as const satisfies readonly FilterOperator[];

/**
 * How deep the tree nests: the API's 6 less one.
 */
export const MAXIMUM_FILTER_DEPTH = 5;

/**
 * The tree's rule and group cap: 128 less two.
 */
export const MAXIMUM_FILTER_ENTRIES = 126;

/**
 * The most attributes a search lists at once.
 */
export const FIELD_SEARCH_LIMIT = 50;

/**
 * The rows rule a link names none for.
 */
export const DEFAULT_ROWS_FILTER: RowsFilter = { operator: "eq", value: 4 };

/**
 * The longest field key or text in a rule; the API's limit.
 */
export const MAXIMUM_FILTER_TEXT_LENGTH = 64;

/**
 * Shown for the combinator, one label each.
 */
export const COMBINATOR_LABELS = {
  and: "all of these",
  or: "any of these",
} as const;

/**
 * The tree a link with no filter stands for.
 */
export const EMPTY_FILTER_GROUP: FilterGroup = { combinator: "and", rules: [] };

/**
 * Each operator as the API names it.
 */
export const OPERATOR_INPUTS: Record<FilterOperator, MeanderFilterOperator> = {
  between: "BETWEEN",
  eq: "EQ",
  gt: "GT",
  gte: "GTE",
  is: "IS",
  is_not: "IS_NOT",
  lt: "LT",
  lte: "LTE",
  ne: "NE",
};

/**
 * Each operator's label, as a picker and a chip read it.
 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  between: "between",
  eq: "=",
  gt: ">",
  gte: "≥",
  is: "is",
  is_not: "is not",
  lt: "<",
  lte: "≤",
  ne: "≠",
};

/**
 * The operators each kind of field takes, in picker order.
 */
export const OPERATORS_BY_TYPE: Record<
  FilterFieldType,
  readonly FilterOperator[]
> = {
  boolean: ["is", "is_not"],
  number: ["eq", "ne", "lt", "lte", "gt", "gte", "between"],
  text: ["eq", "ne"],
};

/**
 * The rows field, which every filter requires a rule on.
 */
export const ROWS_FILTER_FIELD: FilterField = {
  category: "shape",
  description: "How many rows the meander has",
  isInteger: true,
  isPattern: false,
  key: "rows",
  label: "Rows",
  type: "number",
  valueCounts: [],
};

/**
 * The shape fields a rule may name, in picker order.
 */
export const SHAPE_FILTER_FIELDS: readonly FilterField[] = [
  ROWS_FILTER_FIELD,
  {
    category: "shape",
    description: "How many columns the meander has",
    isInteger: true,
    isPattern: false,
    key: "columns",
    label: "Columns",
    type: "number",
    valueCounts: [],
  },
  {
    category: "shape",
    description: "Which lattice the meander sits on",
    isInteger: false,
    isPattern: false,
    key: "lattice",
    label: "Lattice",
    type: "text",
    valueCounts: [],
  },
  {
    category: "shape",
    description: "How many times the meander repeats",
    isInteger: true,
    isPattern: false,
    key: "repeats",
    label: "Repeats",
    type: "number",
    valueCounts: [],
  },
  {
    category: "shape",
    description: "Whether the meander comes from the historical corpus",
    isInteger: false,
    isPattern: false,
    key: "isHardcoded",
    label: "Hardcoded",
    type: "boolean",
    valueCounts: [],
  },
];

/**
 * Validates a combinator a control hands over.
 */
export const filterCombinatorSchema = z.enum(FILTER_COMBINATORS);

/**
 * Validates an operator a control hands over.
 */
export const filterOperatorSchema = z.enum(FILTER_OPERATORS);

/**
 * Validates a rule from a link.
 */
export const filterRuleSchema = z.object({
  field: z.string().min(1).max(MAXIMUM_FILTER_TEXT_LENGTH),
  operator: filterOperatorSchema,
  value: z.union([
    z.boolean(),
    z.number(),
    z.string().max(MAXIMUM_FILTER_TEXT_LENGTH),
    z.tuple([z.number(), z.number()]),
  ]),
});

/**
 * Validates a filter tree from a link.
 */
export const filterGroupSchema: z.ZodType<FilterGroup> = z.lazy(() =>
  z.object({
    combinator: filterCombinatorSchema,
    rules: z.array(z.union([filterGroupSchema, filterRuleSchema])),
  }),
);

/**
 * Reads a filter tree from a link, or none for anything else.
 */
export const linkedFilterSchema = z.unknown().transform((value) => {
  const parsed = filterGroupSchema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
});

/**
 * Reads the rows rule from a link, or none for anything else.
 */
export const linkedRowsSchema = z.unknown().transform((value) => {
  const parsed = filterRuleSchema
    .pick({ operator: true, value: true })
    .safeParse(value);

  return parsed.success ? parsed.data : undefined;
});
