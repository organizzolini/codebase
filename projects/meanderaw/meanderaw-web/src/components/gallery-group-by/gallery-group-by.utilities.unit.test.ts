import { describe, expect, it } from "vitest";

import { MAXIMUM_FILTER_DEPTH } from "../gallery-filter-builder/gallery-filter-builder.constants";

import { fitsGrouping } from "./gallery-group-by.utilities";

import type {
  FilterGroup,
  FilterRule,
} from "../gallery-filter-builder/gallery-filter-builder.types";

const RULE: FilterRule = { field: "rows", operator: "eq", value: 1 };

describe(fitsGrouping, () => {
  it("fits any grouping with no filter", () => {
    expect(fitsGrouping(undefined, ["rowsColumns", "lattice"])).toBe(true);
  });

  it("counts a level's key rules against the API's size cap, rows × columns twice", () => {
    const full: FilterGroup = {
      combinator: "and",
      rules: Array.from({ length: 126 }, () => RULE),
    };

    expect(fitsGrouping(full, ["lattice", "isHardcoded"])).toBe(true);
    expect(fitsGrouping(full, ["rowsColumns", "lattice"])).toBe(false);
  });

  it("counts the nesting an OR filter gains when it is nested whole", () => {
    let nested: FilterGroup = { combinator: "or", rules: [RULE] };

    for (let level = 1; level < MAXIMUM_FILTER_DEPTH; level += 1) {
      nested = { combinator: "or", rules: [nested] };
    }

    expect(fitsGrouping(nested, ["lattice"])).toBe(false);
    expect(fitsGrouping({ ...nested, combinator: "and" }, ["lattice"])).toBe(
      true,
    );
  });
});
