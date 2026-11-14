import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

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
      expect(createRule(FIELD("lattice")).value).toBe("0");
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
      expect(changeRuleField(CHAIN, FIELD("lattice")).value).toBe("0");
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
});
