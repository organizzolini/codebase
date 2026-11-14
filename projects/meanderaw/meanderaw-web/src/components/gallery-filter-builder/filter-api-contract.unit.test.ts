import { describe, expect, it } from "vitest";

import {
  groupSchema,
  MAXIMUM_DEPTH,
  MAXIMUM_ENTRIES,
  measure,
} from "../../../testing/filter-api-contract";
import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import {
  createFilterFields,
  sanitizeFilter,
  toFilterInput,
} from "./gallery-filter-builder.utilities";

import type { MeanderFilterRuleInput } from "../../graphql/generated/operations";
import type { FilterGroup, FilterRule } from "./gallery-filter-builder.types";

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
    const input = toFilterInput(sanitizeFilter(filter, FIELDS));

    expect(groupSchema.safeParse(input).success).toBe(true);
  });

  it("is accepted at the API's caps, and the builder's limits are the API's", () => {
    let nested: FilterGroup = {
      combinator: "and",
      rules: [{ field: "rows", operator: "eq", value: 1 }],
    };

    for (let level = 1; level < MAXIMUM_DEPTH; level += 1) {
      nested = { combinator: "and", rules: [nested] };
    }

    const row: FilterRule = { field: "rows", operator: "eq", value: 1 };
    const wide: FilterGroup = {
      combinator: "or",
      rules: Array.from({ length: MAXIMUM_ENTRIES }, () => row),
    };

    for (const filter of [nested, wide]) {
      const input = toFilterInput(sanitizeFilter(filter, FIELDS));
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
