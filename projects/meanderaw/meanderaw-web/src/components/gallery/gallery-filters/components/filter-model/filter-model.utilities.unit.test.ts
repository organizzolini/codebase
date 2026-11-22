import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../../../testing/meanders-api";

import {
  countEntries,
  isWithinLimits,
  measureDepth,
  normalizeRule,
} from "./filter-limits.utilities";
import { DEFAULT_ROWS_FILTER } from "./filter-model.constants";
import {
  countRules,
  createFilterFields,
  sanitizeFilter,
  toFilterInput,
} from "./filter-model.utilities";
import { sanitizeRows } from "./filter-rows.utilities";

import type {
  FilterField,
  FilterGroup,
  FilterRule,
} from "./filter-model.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The field a key names. */
function FIELD(key: string): FilterField {
  const found = FIELDS.find((field) => field.key === key);

  if (found === undefined) {
    throw new Error(key);
  }

  return found;
}
const COLUMNS: FilterRule = { field: "columns", operator: "eq", value: 2 };
const CHAIN: FilterRule = { field: "isChain", operator: "is", value: true };
const TREE: FilterGroup = {
  combinator: "and",
  rules: [COLUMNS, { combinator: "or", rules: [CHAIN] }],
};

describe("filter model utilities", () => {
  describe(createFilterFields, () => {
    it("lists the tree's shape fields, then the catalog with its kinds, rows and repeats being required rules instead", () => {
      expect(FIELDS.map(({ key }) => key)).toStrictEqual([
        "columns",
        "lattice",
        "isHardcoded",
        "isChain",
        "junctionCount",
      ]);
      expect(FIELD("isChain").type).toBe("boolean");
      expect(FIELD("junctionCount").type).toBe("number");
      expect(FIELD("lattice").type).toBe("text");
    });
  });

  describe(toFilterInput, () => {
    const ROWS_INPUT = { field: "rows", numbers: [4], operator: "EQ" };

    it("aNDs the rows rule with the tree, a range low end first", () => {
      expect(
        toFilterInput(
          {
            combinator: "or",
            rules: [
              { field: "junctionCount", operator: "between", value: [4, 1] },
              { field: "lattice", operator: "ne", value: "1" },
              { combinator: "and", rules: [CHAIN, COLUMNS] },
            ],
          },
          DEFAULT_ROWS_FILTER,
        ),
      ).toStrictEqual({
        combinator: "AND",
        groups: [
          {
            combinator: "OR",
            groups: [
              {
                combinator: "AND",
                rules: [
                  { field: "isChain", flag: true, operator: "IS" },
                  { field: "columns", numbers: [2], operator: "EQ" },
                ],
              },
            ],
            rules: [
              { field: "junctionCount", numbers: [1, 4], operator: "BETWEEN" },
              { field: "lattice", operator: "NE", text: "1" },
            ],
          },
        ],
        rules: [ROWS_INPUT],
      });
    });

    it("words a range for the rows rule low end first", () => {
      expect(
        toFilterInput(undefined, { operator: "between", value: [6, 2] }).rules,
      ).toStrictEqual([
        { field: "rows", numbers: [2, 6], operator: "BETWEEN" },
      ]);
    });

    it("sends only the rows rule for a tree holding no rule", () => {
      const only = { combinator: "AND", rules: [ROWS_INPUT] };

      expect(toFilterInput(undefined, DEFAULT_ROWS_FILTER)).toStrictEqual(only);
      expect(
        toFilterInput(
          { combinator: "and", rules: [{ combinator: "or", rules: [] }] },
          DEFAULT_ROWS_FILTER,
        ),
      ).toStrictEqual(only);
    });
  });

  describe(sanitizeRows, () => {
    it("keeps a number comparison or an ordered range of whole numbers", () => {
      expect(sanitizeRows({ operator: "gte", value: 3 })).toStrictEqual({
        operator: "gte",
        value: 3,
      });
      expect(
        sanitizeRows({ operator: "between", value: [5, 2] }),
      ).toStrictEqual({ operator: "between", value: [2, 5] });
    });

    it("falls back to rows = 4 for anything else", () => {
      for (const rows of [
        undefined,
        { operator: "is" as const, value: true },
        { operator: "eq" as const, value: 1.5 },
        { operator: "eq" as const, value: 2 ** 60 },
        { operator: "eq" as const, value: "four" },
        { operator: "eq" as const, value: [1, 2] as [number, number] },
        { operator: "between" as const, value: 3 },
        { operator: "between" as const, value: [1.5, 2] as [number, number] },
      ]) {
        expect(sanitizeRows(rows)).toStrictEqual(DEFAULT_ROWS_FILTER);
      }
    });
  });

  describe(sanitizeFilter, () => {
    it("drops rules on rows and repeats, which the link holds apart from the tree", () => {
      expect(
        sanitizeFilter(
          {
            combinator: "and",
            rules: [
              { field: "rows", operator: "eq", value: 2 },
              { field: "repeats", operator: "eq", value: 2 },
              COLUMNS,
            ],
          },
          FIELDS,
        ),
      ).toStrictEqual({ combinator: "and", rules: [COLUMNS] });
    });

    it("keeps a tree the catalog can answer", () => {
      expect(sanitizeFilter(TREE, FIELDS)).toStrictEqual(TREE);
    });

    it("drops rules naming an unknown field, a stranger operator or a mismatched value", () => {
      expect(
        sanitizeFilter(
          {
            combinator: "and",
            rules: [
              { field: "gone", operator: "eq", value: 1 },
              { field: "columns", operator: "is", value: true },
              { field: "columns", operator: "eq", value: "two" },
              { field: "columns", operator: "between", value: 2 },
              { field: "columns", operator: "eq", value: [1, 2] },
              COLUMNS,
              { combinator: "or", rules: [{ ...COLUMNS, field: "gone" }] },
            ],
          },
          FIELDS,
        ),
      ).toStrictEqual({ combinator: "and", rules: [COLUMNS] });
    });

    it("gives none when nothing is left", () => {
      expect(sanitizeFilter(undefined, FIELDS)).toBeUndefined();
      expect(
        sanitizeFilter(
          { combinator: "and", rules: [{ ...COLUMNS, field: "gone" }] },
          FIELDS,
        ),
      ).toBeUndefined();
    });
  });

  describe(normalizeRule, () => {
    it("puts a range's ends in order and leaves everything else", () => {
      const range: FilterRule = {
        field: "junctionCount",
        operator: "between",
        value: [4, 1],
      };

      expect(normalizeRule(range).value).toStrictEqual([1, 4]);
      expect(normalizeRule({ ...range, value: [1, 4] })).toStrictEqual({
        ...range,
        value: [1, 4],
      });
      expect(normalizeRule(COLUMNS)).toBe(COLUMNS);
    });
  });

  describe("a lattice rule still waiting for its text", () => {
    const waiting: FilterGroup = {
      combinator: "and",
      rules: [{ field: "lattice", operator: "eq", value: " " }, COLUMNS],
    };

    it("is kept, yet neither counted nor sent to the API", () => {
      expect(countRules(waiting)).toBe(1);
      expect(
        toFilterInput(waiting, DEFAULT_ROWS_FILTER).groups?.[0]?.rules,
      ).toStrictEqual([{ field: "columns", numbers: [2], operator: "EQ" }]);
      expect(sanitizeFilter(waiting, FIELDS)).toStrictEqual(waiting);
    });
  });

  describe("the API's caps", () => {
    /** A tree nested `levels` deep, its innermost group holding one rule. */
    const nested = (levels: number): FilterGroup => {
      let group: FilterGroup = { combinator: "and", rules: [COLUMNS] };

      for (let level = 1; level < levels; level += 1) {
        group = { combinator: "and", rules: [group] };
      }

      return group;
    };

    it("measures depth from the root as level 1, and counts rules and groups but not the root", () => {
      expect(measureDepth(nested(1))).toBe(1);
      expect(measureDepth(nested(6))).toBe(6);
      expect(countEntries(nested(3))).toBe(3);
    });

    it("keeps a filter at the caps and drops one past them", () => {
      expect(isWithinLimits(nested(5))).toBe(true);
      expect(isWithinLimits(nested(6))).toBe(false);
      expect(sanitizeFilter(nested(6), FIELDS)).toBeUndefined();

      const full: FilterGroup = {
        combinator: "or",
        rules: Array.from({ length: 126 }, () => COLUMNS),
      };

      expect(sanitizeFilter(full, FIELDS)).toStrictEqual(full);
      expect(
        sanitizeFilter({ ...full, rules: [...full.rules, COLUMNS] }, FIELDS),
      ).toBeUndefined();
    });

    it("drops a whole-number field's fraction or unsafe size, and a range read out of order is put in order", () => {
      const rule = (value: FilterRule["value"]): FilterGroup => ({
        combinator: "and",
        rules: [{ field: "columns", operator: "eq", value }],
      });

      expect(sanitizeFilter(rule(1.5), FIELDS)).toBeUndefined();
      expect(sanitizeFilter(rule(2 ** 60), FIELDS)).toBeUndefined();
      expect(
        sanitizeFilter(
          {
            combinator: "and",
            rules: [
              { field: "junctionCount", operator: "between", value: [4, 1] },
            ],
          },
          FIELDS,
        )?.rules,
      ).toStrictEqual([
        { field: "junctionCount", operator: "between", value: [1, 4] },
      ]);
    });
  });
});
