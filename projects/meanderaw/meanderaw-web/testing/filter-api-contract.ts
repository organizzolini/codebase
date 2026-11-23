import { z } from "zod";

import type { MeanderFilterRuleInput } from "../src/graphql/generated/operations";

// The rules below mirror `meanderFilterRuleSchema` and
// `meanderFilterGroupSchema` in meanderaw-api's
// `modules/meanders/modules/filters/meander-filter.constants.ts`, which an application
// cannot be imported from here. Keep them in step with it: a rule the builder
// can write is a rule the API must accept. The mock API and the contract test
// both judge by it.
const WHOLE_NUMBER_FIELDS = new Set(["columns", "repeats", "rows"]);
export const MAXIMUM_ENTRIES = 128;
export const MAXIMUM_DEPTH = 6;
const MAXIMUM_TEXT_LENGTH = 64;

const ruleSchema = z
  .object({
    field: z.string().min(1).max(MAXIMUM_TEXT_LENGTH),
    flag: z.boolean().nullish(),
    numbers: z.array(z.number()).max(2).nullish(),
    operator: z.enum([
      "BETWEEN",
      "EQ",
      "GT",
      "GTE",
      "IS",
      "IS_NOT",
      "LT",
      "LTE",
      "NE",
    ]),
    text: z.string().max(MAXIMUM_TEXT_LENGTH).nullish(),
  })
  .superRefine((rule: MeanderFilterRuleInput, context) => {
    const numbers = rule.numbers ?? [];
    const isFlag = rule.operator === "IS" || rule.operator === "IS_NOT";
    const isText = rule.text !== null && rule.text !== undefined;
    const isRange = rule.operator === "BETWEEN";
    const [low = 0, high = 0] = numbers;
    const fits = isFlag
      ? rule.flag !== null &&
        rule.flag !== undefined &&
        numbers.length === 0 &&
        !isText
      : (rule.flag ?? null) === null &&
        (isText
          ? numbers.length === 0 && rule.field === "lattice"
          : numbers.length === (isRange ? 2 : 1) && (!isRange || low <= high));

    if (!fits) {
      context.addIssue({ code: "custom", message: "rule does not fit" });
    }

    if (
      WHOLE_NUMBER_FIELDS.has(rule.field) &&
      !numbers.every((number) => Number.isSafeInteger(number))
    ) {
      context.addIssue({ code: "custom", message: "whole numbers only" });
    }
  });

export const groupSchema: z.ZodType = z.object({
  combinator: z.enum(["AND", "OR"]),
  groups: z.array(z.lazy(() => groupSchema)).nullish(),
  rules: z.array(ruleSchema).nullish(),
});

/** Counts rules and groups in the API's input, root excepted, and its depth. */
export function measure(
  input: unknown,
  depth = 1,
): { depth: number; entries: number } {
  const parsed = z
    .object({
      groups: z.array(z.unknown()).nullish(),
      rules: z.array(z.unknown()).nullish(),
    })
    .parse(input);
  let deepest = depth;
  let entries = (parsed.rules?.length ?? 0) + (parsed.groups?.length ?? 0);

  for (const nested of parsed.groups ?? []) {
    const inner = measure(nested, depth + 1);

    deepest = Math.max(deepest, inner.depth);
    entries += inner.entries;
  }

  return { depth: deepest, entries };
}

/**
 * Why the API would refuse a filter, or nothing when it would accept it.
 */
export function refuseFilter(input: unknown): string | undefined {
  const parsed = groupSchema.safeParse(input);

  if (!parsed.success) {
    return "The filter is not one the API accepts";
  }

  const { depth, entries } = measure(input);

  if (depth > MAXIMUM_DEPTH || entries > MAXIMUM_ENTRIES) {
    return "The filter nests or holds more than the API allows";
  }

  return undefined;
}
