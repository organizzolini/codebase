import { z } from "zod";

import { MeanderFilterOperator } from "./meander-filter-rule.entities";

import type {
  MeanderFilterGroup,
  MeanderFilterKind,
} from "./meander-filter.types";

// ♟️ Constants

/** The most rules, and the most groups, one group may hold. */
export const MEANDER_FILTER_MAXIMUM_BREADTH = 32;

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

/** Validates one rule's operator against what it carries. */
export const meanderFilterRuleSchema = z
  .object({
    field: z.string().min(1),
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
      .nullish()
      .transform((text) => text ?? null),
  })
  .superRefine((rule, context) => {
    const { flag, numbers, operator, text } = rule;
    let problem: null | string = null;

    if (operator === MeanderFilterOperator.BETWEEN) {
      const [low, high] = numbers;

      if (
        numbers.length !== 2 ||
        low === undefined ||
        high === undefined ||
        low > high
      ) {
        problem = "between needs two numbers, the lower first";
      }
    } else if (
      operator === MeanderFilterOperator.IS ||
      operator === MeanderFilterOperator.IS_NOT
    ) {
      problem = flag === null ? `${operator} needs a flag` : null;
    } else if (numbers.length !== 1 && text === null) {
      problem = `${operator} needs one number or a text`;
    }

    if (problem !== null) {
      context.addIssue({
        code: "custom",
        message: `Rule on "${rule.field}": ${problem}.`,
      });
    }
  });

/** Validates a group, its rules and its nested groups, defaulting missing lists. */
export const meanderFilterGroupSchema: z.ZodType<MeanderFilterGroup> = z.object(
  {
    combinator: z.enum(["and", "or"]),
    groups: z
      .array(z.lazy(() => meanderFilterGroupSchema))
      .max(MEANDER_FILTER_MAXIMUM_BREADTH)
      .nullish()
      .transform((groups) => groups ?? []),
    rules: z
      .array(meanderFilterRuleSchema)
      .max(MEANDER_FILTER_MAXIMUM_BREADTH)
      .nullish()
      .transform((rules) => rules ?? []),
  },
);
