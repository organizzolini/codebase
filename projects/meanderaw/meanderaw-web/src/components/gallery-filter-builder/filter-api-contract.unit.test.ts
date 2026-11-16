import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { sanitizeRows } from "./filter-rows.utilities";
import {
  DEFAULT_ROWS_FILTER,
  MAXIMUM_FILTER_DEPTH,
  MAXIMUM_FILTER_ENTRIES,
} from "./gallery-filter-builder.constants";
import {
  createFilterFields,
  sanitizeFilter,
  toFilterInput,
} from "./gallery-filter-builder.utilities";

import type { MeanderFilterRuleInput } from "../../graphql/generated/operations";
import type {
  FilterGroup,
  FilterRule,
  RowsFilter,
} from "./gallery-filter-builder.types";

// The rules below mirror `meanderFilterRuleSchema` and
// `meanderFilterGroupSchema` in meanderaw-api's
// `modules/meanders/filters/meander-filter.constants.ts`, which an application
// cannot be imported from here. Keep them in step with it: a rule the builder
// can write is a rule the API must accept.
const WHOLE_NUMBER_FIELDS = new Set(["columns", "repeats", "rows"]);
const MAXIMUM_ENTRIES = 128;
const MAXIMUM_DEPTH = 6;
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

const groupSchema: z.ZodType = z.object({
  combinator: z.enum(["AND", "OR"]),
  groups: z.array(z.lazy(() => groupSchema)).nullish(),
  rules: z.array(ruleSchema).nullish(),
});

/** Counts rules and groups in the API's input, root excepted, and its depth. */
function measure(
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

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

describe("the filter input the builder writes", () => {
  it("is accepted by the API's rules for every operator and kind of field", () => {
    const filter: FilterGroup = {
      combinator: "or",
      rules: [
        { field: "rows", operator: "eq", value: 3 },
        { field: "columns", operator: "ne", value: 2 },
        { field: "repeats", operator: "lt", value: 4 },
        { field: "rows", operator: "lte", value: 4 },
        { field: "columns", operator: "gt", value: 1 },
        { field: "repeats", operator: "gte", value: 1 },
        { field: "rows", operator: "between", value: [5, 2] },
        { field: "junctionCount", operator: "between", value: [0.5, 2.5] },
        { field: "junctionCount", operator: "gte", value: 3.5 },
        { field: "lattice", operator: "eq", value: "square" },
        { field: "lattice", operator: "ne", value: "x".repeat(64) },
        { field: "isHardcoded", operator: "is_not", value: false },
        { field: "isChain", operator: "is", value: true },
        {
          combinator: "and",
          rules: [{ field: "isChain", operator: "is_not", value: true }],
        },
      ],
    };
    const input = toFilterInput(
      sanitizeFilter(filter, FIELDS),
      DEFAULT_ROWS_FILTER,
    );

    expect(groupSchema.safeParse(input).success).toBe(true);
  });

  it("is accepted for every rows rule the builder can write", () => {
    const writable: RowsFilter[] = [
      { operator: "eq", value: 4 },
      { operator: "ne", value: 4 },
      { operator: "lt", value: 4 },
      { operator: "lte", value: 4 },
      { operator: "gt", value: 4 },
      { operator: "gte", value: 4 },
      { operator: "between", value: [6, 2] },
      { operator: "is", value: true },
      { operator: "eq", value: 1.5 },
    ];

    for (const rows of writable) {
      const input = toFilterInput(undefined, sanitizeRows(rows));

      expect(groupSchema.safeParse(input).success).toBe(true);
    }
  });

  it("is accepted when the tree is at the builder's caps, which leave room for the rows rule", () => {
    let nested: FilterGroup = {
      combinator: "and",
      rules: [{ field: "rows", operator: "eq", value: 1 }],
    };

    for (let level = 1; level < MAXIMUM_FILTER_DEPTH; level += 1) {
      nested = { combinator: "and", rules: [nested] };
    }

    const row: FilterRule = { field: "rows", operator: "eq", value: 1 };
    const wide: FilterGroup = {
      combinator: "or",
      rules: Array.from({ length: MAXIMUM_FILTER_ENTRIES }, () => row),
    };

    for (const filter of [nested, wide]) {
      const input = toFilterInput(
        sanitizeFilter(filter, FIELDS),
        DEFAULT_ROWS_FILTER,
      );
      const { depth, entries } = measure(input);

      expect(groupSchema.safeParse(input).success).toBe(true);
      expect(depth).toBeLessThanOrEqual(MAXIMUM_DEPTH);
      expect(entries).toBeLessThanOrEqual(MAXIMUM_ENTRIES);
    }

    expect(
      sanitizeFilter({ ...wide, rules: [...wide.rules, row] }, FIELDS),
    ).toBeUndefined();
  });

  it("refuses what the API refuses, which the sanitizer therefore drops first", () => {
    const refused: MeanderFilterRuleInput[] = [
      { field: "rows", numbers: [1.5], operator: "EQ" },
      { field: "rows", numbers: [4, 1], operator: "BETWEEN" },
      { field: "lattice", operator: "EQ", text: "x".repeat(65) },
    ];

    for (const rule of refused) {
      expect(
        groupSchema.safeParse({ combinator: "AND", rules: [rule] }).success,
      ).toBe(false);
    }
  });
});
