import { z } from "zod";

import { MeanderFilterOperator } from "./meander-filter-rule.entities";

import type {
  MeanderFilterGroup,
  MeanderFilterKind,
  MeanderFilterRule,
} from "./meander-filter.types";

// ♟️ Constants

/** The most rules and groups a whole filter may hold. */
export const MEANDER_FILTER_MAXIMUM_ENTRIES = 128;

/** The longest field key or text a rule may carry. */
export const MEANDER_FILTER_MAXIMUM_TEXT_LENGTH = 64;

/** How deep groups may nest. */
export const MEANDER_FILTER_MAXIMUM_DEPTH = 6;

/** The shape fields a rule may name, and the kind each holds. */
export const SHAPE_FILTER_FIELDS: ReadonlyMap<string, MeanderFilterKind> =
  new Map([
    ["columns", "number"],
    ["isHardcoded", "boolean"],
    ["lattice", "text"],
    ["repeats", "number"],
    ["rows", "number"],
  ]);

/** SQL for each comparison operator. */
export const COMPARISON_SQL: ReadonlyMap<MeanderFilterOperator, string> =
  new Map([
    [MeanderFilterOperator.EQ, "="],
    [MeanderFilterOperator.GT, ">"],
    [MeanderFilterOperator.GTE, ">="],
    [MeanderFilterOperator.LT, "<"],
    [MeanderFilterOperator.LTE, "<="],
    [MeanderFilterOperator.NE, "<>"],
  ]);

/** What a rule's operator needs; null when it has it. */
const describeProblem = (rule: MeanderFilterRule): null | string => {
  const { field, flag, numbers, operator, text } = rule;

  if (
    operator === MeanderFilterOperator.IS ||
    operator === MeanderFilterOperator.IS_NOT
  ) {
    return flag !== null && numbers.length === 0 && text === null
      ? null
      : `${operator} takes only a flag`;
  }

  if (flag !== null) {
    return `${operator} does not take a flag`;
  }

  if (operator === MeanderFilterOperator.BETWEEN) {
    const [low, high] = numbers;

    return numbers.length === 2 &&
      text === null &&
      low !== undefined &&
      high !== undefined &&
      low <= high
      ? null
      : "between takes two numbers, the lower first";
  }

  if (
    field === "lattice" &&
    (operator === MeanderFilterOperator.EQ ||
      operator === MeanderFilterOperator.NE)
  ) {
    return text !== null && numbers.length === 0
      ? null
      : `${operator} on the lattice takes only a text`;
  }

  return numbers.length === 1 && text === null
    ? null
    : `${operator} takes exactly one number`;
};

/** Validates a rule's operator payload and shape number range. */
export const meanderFilterRuleSchema = z
  .object({
    field: z.string().min(1).max(MEANDER_FILTER_MAXIMUM_TEXT_LENGTH),
    flag: z
      .boolean()
      .nullish()
      .transform((flag) => flag ?? null),
    numbers: z
      .array(z.number())
      .max(2)
      .nullish()
      .transform((numbers) => numbers ?? []),
    operator: z.enum(MeanderFilterOperator),
    text: z
      .string()
      .max(MEANDER_FILTER_MAXIMUM_TEXT_LENGTH)
      .nullish()
      .transform((text) => text ?? null),
  })
  .superRefine((rule, context) => {
    const problem = describeProblem(rule);

    if (problem !== null) {
      context.addIssue({
        code: "custom",
        message: `Rule on "${rule.field}": ${problem}.`,
      });
    } else if (
      SHAPE_FILTER_FIELDS.get(rule.field) === "number" &&
      !rule.numbers.every((number) => Number.isSafeInteger(number))
    ) {
      context.addIssue({
        code: "custom",
        message: `Rule on "${rule.field}": ${rule.field} takes whole numbers up to ${Number.MAX_SAFE_INTEGER} in size.`,
      });
    }
  });

/** The parts of a raw node that size is counted from. */
export const sizeSchema = z.object({
  groups: z.array(z.unknown()).nullish(),
  rules: z.array(z.unknown()).nullish(),
});

/** Validates a group, its rules and its nested groups, defaulting missing lists. */
export const meanderFilterGroupSchema: z.ZodType<MeanderFilterGroup> = z.object(
  {
    combinator: z.enum(["and", "or"]),
    groups: z
      .array(z.lazy(() => meanderFilterGroupSchema))
      .max(MEANDER_FILTER_MAXIMUM_ENTRIES)
      .nullish()
      .transform((groups) => groups ?? []),
    rules: z
      .array(meanderFilterRuleSchema)
      .max(MEANDER_FILTER_MAXIMUM_ENTRIES)
      .nullish()
      .transform((rules) => rules ?? []),
  },
);
