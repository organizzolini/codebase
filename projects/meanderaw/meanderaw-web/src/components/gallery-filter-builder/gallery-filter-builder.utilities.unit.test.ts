import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import {
  countEntries,
  isWithinLimits,
  measureDepth,
  normalizeRule,
} from "./filter-limits.utilities";
import {
  addNode,
  changeRuleField,
  changeRuleOperator,
  countRules,
  createFilterFields,
  createGroup,
  createRule,
  describeField,
  describeRule,
  listRules,
  removeNode,
  sanitizeFilter,
  setCombinator,
  setRule,
  toFilterInput,
} from "./gallery-filter-builder.utilities";

import type {
  FilterField,
  FilterGroup,
  FilterRule,
} from "./gallery-filter-builder.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The field a key names. */
function FIELD(key: string): FilterField {
  const found = FIELDS.find((field) => field.key === key);

  if (found === undefined) {
    throw new Error(key);
  }

  return found;
}
const ROWS: FilterRule = { field: "rows", operator: "eq", value: 2 };
const CHAIN: FilterRule = { field: "isChain", operator: "is", value: true };
const TREE: FilterGroup = {
  combinator: "and",
  rules: [ROWS, { combinator: "or", rules: [CHAIN] }],
};

describe("gallery filter builder utilities", () => {
  describe(createFilterFields, () => {
    it("lists the shape fields, then the catalog with its kinds", () => {
      expect(FIELDS.map(({ key }) => key)).toStrictEqual([
        "rows",
        "columns",
        "lattice",
        "repeats",
        "isHardcoded",
        "isChain",
        "junctionCount",
      ]);
      expect(FIELD("isChain").type).toBe("boolean");
      expect(FIELD("junctionCount").type).toBe("number");
      expect(FIELD("lattice").type).toBe("text");
    });
  });

  describe(createRule, () => {
    it("starts each kind of field on its first operator and least value", () => {
      expect(createRule(FIELD("rows"))).toStrictEqual({
        field: "rows",
        operator: "eq",
        value: 0,
      });
      expect(createRule(FIELD("isChain"))).toStrictEqual(CHAIN);
      expect(createRule(FIELD("lattice")).value).toBe("");
      expect(createGroup(FIELD("rows"))).toStrictEqual({
        combinator: "and",
        rules: [createRule(FIELD("rows"))],
      });
    });
  });

  describe(changeRuleField, () => {
    it("keeps the operator and value for a field of the same kind", () => {
      expect(changeRuleField(ROWS, FIELD("columns"))).toStrictEqual({
        ...ROWS,
        field: "columns",
      });
    });

    it("starts over for a field of another kind", () => {
      expect(changeRuleField(ROWS, FIELD("isChain"))).toStrictEqual(CHAIN);
      expect(changeRuleField(CHAIN, FIELD("lattice")).value).toBe("");
    });
  });

  describe(changeRuleOperator, () => {
    it("widens a number to a range and narrows a range to its low end", () => {
      const range = changeRuleOperator(ROWS, "between");

      expect(range.value).toStrictEqual([2, 2]);
      expect(changeRuleOperator({ ...range, value: [1, 5] }, "gt").value).toBe(
        1,
      );
      expect(changeRuleOperator(ROWS, "lt").value).toBe(2);
    });
  });

  describe("tree edits", () => {
    it("adds, sets, joins and removes at a path", () => {
      expect(addNode([1], ROWS)(TREE).rules[1]).toStrictEqual({
        combinator: "or",
        rules: [CHAIN, ROWS],
      });
      expect(setRule([0], { ...ROWS, value: 9 })(TREE).rules[0]).toStrictEqual({
        ...ROWS,
        value: 9,
      });
      expect(setCombinator([1], "and")(TREE).rules[1]).toMatchObject({
        combinator: "and",
      });
      expect(removeNode([0])(TREE).rules).toStrictEqual([
        { combinator: "or", rules: [CHAIN] },
      ]);
    });

    it("removes a group left empty", () => {
      expect(removeNode([1, 0])(TREE).rules).toStrictEqual([ROWS]);
    });
  });

  describe("reading a tree", () => {
    it("counts and lists the rules, nested ones with their paths", () => {
      expect(countRules(TREE)).toBe(2);
      expect(listRules(TREE)).toStrictEqual([
        { path: [0], rule: ROWS },
        { path: [1, 0], rule: CHAIN },
      ]);
    });

    it("words a rule and a field", () => {
      expect(describeRule(ROWS, FIELDS)).toBe("Rows = 2");
      expect(describeRule(CHAIN, FIELDS)).toBe("Chain is true");
      expect(
        describeRule(
          { field: "junctionCount", operator: "between", value: [1, 3] },
          FIELDS,
        ),
      ).toBe("Junction count between 1 and 3");
      expect(describeRule({ ...ROWS, field: "gone" }, FIELDS)).toBe("gone = 2");
      expect(describeField(FIELD("rows"))).toBe(
        "How many rows the meander has · shape · number",
      );
      expect(
        describeField({
          ...FIELD("junctionCount"),
          valueCounts: Array.from({ length: 8 }, (_, value) => ({
            meanderCount: 1000,
            value,
          })),
        }),
      ).toContain(
        "0: 1,000, 1: 1,000, 2: 1,000, 3: 1,000, 4: 1,000, 5: 1,000, …",
      );
    });
  });

  describe(toFilterInput, () => {
    it("words a tree as the API's input, a range low end first", () => {
      expect(
        toFilterInput({
          combinator: "or",
          rules: [
            { field: "junctionCount", operator: "between", value: [4, 1] },
            { field: "lattice", operator: "ne", value: "1" },
            { combinator: "and", rules: [CHAIN, ROWS] },
          ],
        }),
      ).toStrictEqual({
        combinator: "OR",
        groups: [
          {
            combinator: "AND",
            rules: [
              { field: "isChain", flag: true, operator: "IS" },
              { field: "rows", numbers: [2], operator: "EQ" },
            ],
          },
        ],
        rules: [
          { field: "junctionCount", numbers: [1, 4], operator: "BETWEEN" },
          { field: "lattice", operator: "NE", text: "1" },
        ],
      });
    });

    it("gives none for a tree holding no rule", () => {
      expect(toFilterInput(undefined)).toBeUndefined();
      expect(
        toFilterInput({
          combinator: "and",
          rules: [{ combinator: "or", rules: [] }],
        }),
      ).toBeUndefined();
    });
  });

  describe(sanitizeFilter, () => {
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
              { field: "rows", operator: "is", value: true },
              { field: "rows", operator: "eq", value: "two" },
              { field: "rows", operator: "between", value: 2 },
              { field: "rows", operator: "eq", value: [1, 2] },
              ROWS,
              { combinator: "or", rules: [{ ...ROWS, field: "gone" }] },
            ],
          },
          FIELDS,
        ),
      ).toStrictEqual({ combinator: "and", rules: [ROWS] });
    });

    it("gives none when nothing is left", () => {
      expect(sanitizeFilter(undefined, FIELDS)).toBeUndefined();
      expect(
        sanitizeFilter(
          { combinator: "and", rules: [{ ...ROWS, field: "gone" }] },
          FIELDS,
        ),
      ).toBeUndefined();
    });
  });

  describe("whole-number fields", () => {
    it("drops the fraction of a number moved to a field that takes whole numbers", () => {
      const fraction: FilterRule = {
        field: "junctionCount",
        operator: "gte",
        value: 4.9,
      };

      expect(changeRuleField(fraction, FIELD("rows")).value).toBe(4);
      expect(
        changeRuleField(
          { ...fraction, operator: "between", value: [1.5, 4.9] },
          FIELD("rows"),
        ).value,
      ).toStrictEqual([1, 4]);
      expect(changeRuleField(fraction, FIELD("junctionCount")).value).toBe(4.9);
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
      expect(normalizeRule(ROWS)).toBe(ROWS);
      expect(describeRule(range, FIELDS)).toBe(
        "Junction count between 1 and 4",
      );
      expect(setRule([0], range)(TREE).rules[0]).toStrictEqual({
        ...range,
        value: [1, 4],
      });
    });
  });

  describe("a lattice rule still waiting for its text", () => {
    const waiting: FilterGroup = {
      combinator: "and",
      rules: [{ field: "lattice", operator: "eq", value: " " }, ROWS],
    };

    it("is kept, yet neither counted, listed nor sent to the API", () => {
      expect(countRules(waiting)).toBe(1);
      expect(listRules(waiting)).toStrictEqual([{ path: [1], rule: ROWS }]);
      expect(toFilterInput(waiting)?.rules).toStrictEqual([
        { field: "rows", numbers: [2], operator: "EQ" },
      ]);
      expect(sanitizeFilter(waiting, FIELDS)).toStrictEqual(waiting);
    });
  });

  describe("the API's caps", () => {
    /** A tree nested `levels` deep, its innermost group holding one rule. */
    const nested = (levels: number): FilterGroup => {
      let group: FilterGroup = { combinator: "and", rules: [ROWS] };

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
      expect(isWithinLimits(nested(6))).toBe(true);
      expect(isWithinLimits(nested(7))).toBe(false);
      expect(sanitizeFilter(nested(7), FIELDS)).toBeUndefined();

      const full: FilterGroup = {
        combinator: "or",
        rules: Array.from({ length: 128 }, () => ROWS),
      };

      expect(sanitizeFilter(full, FIELDS)).toStrictEqual(full);
      expect(
        sanitizeFilter({ ...full, rules: [...full.rules, ROWS] }, FIELDS),
      ).toBeUndefined();
    });

    it("drops a whole-number field's fraction or unsafe size, and a range read out of order is put in order", () => {
      const rule = (value: FilterRule["value"]): FilterGroup => ({
        combinator: "and",
        rules: [{ field: "rows", operator: "eq", value }],
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
