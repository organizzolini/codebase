import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";
import { MAXIMUM_FILTER_DEPTH } from "../gallery-filters/components/filter-model/filter-model.constants";

import {
  createGroupFields,
  fitsGrouping,
  resolveGrouping,
} from "./gallery-group-by.utilities";

import type {
  FilterGroup,
  FilterRule,
} from "../gallery-filters/components/filter-model/filter-model.types";

const RULE: FilterRule = { field: "columns", operator: "eq", value: 1 };

describe("gallery group by", () => {
  describe(createGroupFields, () => {
    it("lists rows and columns, then every characteristic, each with its category and kind", () => {
      expect(
        createGroupFields(FIXTURE_CHARACTERISTICS).map(
          ({ category, key, label, type }) => [category, key, label, type],
        ),
      ).toStrictEqual([
        ["shape", "rows", "Rows", "number"],
        ["shape", "columns", "Columns", "number"],
        ["submatrix", "isChain", "Chain", "boolean"],
        ["path", "junctionCount", "Junction count", "number"],
      ]);
    });
  });

  describe(resolveGrouping, () => {
    it("keeps the levels the catalog can group by, once each, in order", () => {
      expect(
        resolveGrouping(
          ["columns", "nonsense", "columns", "lattice", "isChain"],
          createGroupFields(FIXTURE_CHARACTERISTICS),
        ),
      ).toStrictEqual(["columns", "isChain"]);
    });

    it("groups by rows when the link names no grouping, and reads flat for an empty list", () => {
      const fields = createGroupFields(FIXTURE_CHARACTERISTICS);

      expect(resolveGrouping(undefined, fields)).toStrictEqual(["rows"]);
      expect(resolveGrouping([], fields)).toStrictEqual([]);
      expect(resolveGrouping(["nonsense"], fields)).toStrictEqual([]);
    });
  });

  describe(fitsGrouping, () => {
    it("fits any grouping with no filter", () => {
      expect(fitsGrouping(undefined, ["rows", "columns"])).toBe(true);
    });

    it("counts the rows rule, the tree's group and a rule for each level against the API's size cap", () => {
      const full: FilterGroup = {
        combinator: "and",
        rules: Array.from({ length: 124 }, () => RULE),
      };

      expect(fitsGrouping(full, ["rows", "columns"])).toBe(true);
      expect(fitsGrouping(full, ["rows", "columns", "isChain"])).toBe(false);
    });

    it("counts the nesting the tree gains when it is nested whole", () => {
      let nested: FilterGroup = { combinator: "or", rules: [RULE] };

      for (let level = 1; level < MAXIMUM_FILTER_DEPTH; level += 1) {
        nested = { combinator: "or", rules: [nested] };
      }

      expect(fitsGrouping(nested, ["rows"])).toBe(true);
      expect(
        fitsGrouping({ combinator: "or", rules: [nested] }, ["rows"]),
      ).toBe(false);
    });
  });
});
