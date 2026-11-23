import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../../../testing/meanders-api";
import { createFilterFields } from "../filter-model/filter-model.utilities";

import { DEFAULT_FILTER_LINK } from "./filter-query.constants";
import {
  countActiveRules,
  ensureRequiredRules,
  fromFilterQuery,
  isQueryAllowed,
  isSameFilterLink,
  toFilterQuery,
} from "./filter-query.utilities";

import type { FilterGroup } from "../filter-model/filter-model.types";
import type {
  FilterLink,
  GalleryFilterNode,
  GalleryFilterQuery,
  GalleryFilterValue,
} from "./filter-query.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);
const FILTER: FilterGroup = {
  combinator: "or",
  rules: [
    { field: "junctionCount", operator: "between", value: [1, 3] },
    {
      combinator: "and",
      rules: [
        { field: "isChain", operator: "is", value: true },
        { field: "lattice", operator: "ne", value: "1" },
      ],
    },
  ],
};
const LINK: FilterLink = {
  filter: FILTER,
  repeats: 6,
  rows: { operator: "gte", value: 3 },
};

/** A rule of the Filters tree. */
function rule(
  path: string[],
  operator: string,
  value: GalleryFilterValue | undefined,
  id = path.join("-"),
): GalleryFilterNode {
  return { id, operator, path, type: "rule", value };
}

/** The default tree with `rules` after its required two. */
function treeWith(...rules: GalleryFilterNode[]): GalleryFilterQuery {
  const base = toFilterQuery(DEFAULT_FILTER_LINK, FIELDS);

  return { ...base, rules: [...base.rules, ...rules] };
}

describe("filter query", () => {
  describe(toFilterQuery, () => {
    it("opens with rows, then repeats, then the tree's rules under its combinator", () => {
      const query = toFilterQuery(LINK, FIELDS);

      expect(query.combinator).toBe("or");
      expect(query.rules.map((node) => node.id)).toStrictEqual([
        "rows",
        "repeats",
        "filter-0",
        "filter-1",
      ]);
      expect(query.rules[0]).toMatchObject({
        operator: "gte",
        path: ["shape", "rows"],
        value: 3,
      });
      expect(query.rules[1]).toMatchObject({
        operator: "eq",
        path: ["shape", "repeats"],
        value: 6,
      });
      expect(query.rules[2]).toMatchObject({
        path: ["path", "junctionCount"],
        value: [1, 3],
      });
      expect(query.rules[3]).toMatchObject({
        combinator: "and",
        rules: [
          { path: ["submatrix", "isChain"], value: true },
          { path: ["shape", "lattice"], value: "1" },
        ],
        type: "group",
      });
    });

    it("puts a rule on a field the catalog lacks under shape", () => {
      expect(
        toFilterQuery(
          {
            ...DEFAULT_FILTER_LINK,
            filter: {
              combinator: "and",
              rules: [{ field: "gone", operator: "eq", value: 1 }],
            },
          },
          FIELDS,
        ).rules[2],
      ).toMatchObject({ path: ["shape", "gone"] });
    });

    it("holds just rows and repeats for a link with no filter", () => {
      expect(
        toFilterQuery(DEFAULT_FILTER_LINK, FIELDS).rules.map((node) => node.id),
      ).toStrictEqual(["rows", "repeats"]);
    });
  });

  describe(fromFilterQuery, () => {
    it("reads back the link a tree was built from", () => {
      expect(
        fromFilterQuery(toFilterQuery(LINK, FIELDS), FIELDS),
      ).toStrictEqual(LINK);
      expect(
        fromFilterQuery(toFilterQuery(DEFAULT_FILTER_LINK, FIELDS), FIELDS),
      ).toStrictEqual(DEFAULT_FILTER_LINK);
    });

    it("leaves out the rules still unfinished, and the groups that leaves empty", () => {
      const query = treeWith(
        rule(["path", "junctionCount"], "", undefined),
        rule(["path", "junctionCount"], "gte", undefined),
        rule(["path", "junctionCount"], "between", [1, undefined]),
        rule(["shape", "lattice"], "eq", "  "),
        {
          combinator: "and",
          id: "empty",
          rules: [rule(["submatrix", "isChain"], "is", undefined)],
          type: "group",
        },
        rule(["path", "junctionCount"], "lt", 4, "done"),
      );

      expect(fromFilterQuery(query, FIELDS).filter).toStrictEqual({
        combinator: "and",
        rules: [{ field: "junctionCount", operator: "lt", value: 4 }],
      });
    });

    it("puts a range's ends in order, and refuses a fraction for a whole-number field", () => {
      expect(
        fromFilterQuery(
          treeWith(rule(["path", "junctionCount"], "between", [4.5, 1.5])),
          FIELDS,
        ).filter?.rules,
      ).toStrictEqual([
        { field: "junctionCount", operator: "between", value: [1.5, 4.5] },
      ]);
      expect(
        fromFilterQuery(treeWith(rule(["shape", "columns"], "eq", 1.5)), FIELDS)
          .filter,
      ).toBeUndefined();
    });

    it("falls back to rows = 4 and repeats = 12 when either is unfinished or out of range", () => {
      for (const repeats of [0, 25, 1.5, undefined]) {
        const query = toFilterQuery(LINK, FIELDS);
        const broken: GalleryFilterQuery = {
          ...query,
          rules: [
            rule(["shape", "rows"], "eq", 1.5),
            rule(["shape", "repeats"], "eq", repeats),
          ],
        };

        expect(fromFilterQuery(broken, FIELDS)).toStrictEqual(
          DEFAULT_FILTER_LINK,
        );
      }
    });

    it("reads rows = 4 and repeats = 12 for a tree that lost both", () => {
      expect(
        fromFilterQuery({ ...toFilterQuery(LINK, FIELDS), rules: [] }, FIELDS),
      ).toStrictEqual(DEFAULT_FILTER_LINK);
    });

    it("drops a rule on a field the catalog lacks, or with no path", () => {
      expect(
        fromFilterQuery(
          treeWith(
            rule(["path", "gone"], "eq", 1),
            rule([], "eq", 1, "pathless"),
          ),
          FIELDS,
        ).filter,
      ).toBeUndefined();
    });

    it("drops a negated rule, which the link cannot hold", () => {
      expect(
        fromFilterQuery(
          treeWith({
            ...rule(["path", "junctionCount"], "eq", 1),
            negated: true,
          } as GalleryFilterNode),
          FIELDS,
        ).filter,
      ).toBeUndefined();
    });
  });

  describe(countActiveRules, () => {
    it("counts the finished rules, nested ones too, and not rows or repeats", () => {
      expect(countActiveRules(toFilterQuery(LINK, FIELDS), FIELDS)).toBe(3);
      expect(
        countActiveRules(toFilterQuery(DEFAULT_FILTER_LINK, FIELDS), FIELDS),
      ).toBe(0);
    });
  });

  describe(ensureRequiredRules, () => {
    it("puts back the rule a tree lost, at its default, ahead of the others", () => {
      const restored = ensureRequiredRules({
        ...treeWith(rule(["path", "junctionCount"], "eq", 1)),
        rules: [rule(["path", "junctionCount"], "eq", 1)],
      });

      expect(restored.rules.map((node) => node.id)).toStrictEqual([
        "rows",
        "repeats",
        "path-junctionCount",
      ]);
      expect(restored.rules[0]).toMatchObject({ operator: "eq", value: 4 });
      expect(restored.rules[1]).toMatchObject({ operator: "eq", value: 12 });
    });

    it("keeps the rules a tree has, each once, and drops a second", () => {
      const query = toFilterQuery(LINK, FIELDS);
      const duplicated = {
        ...query,
        rules: [...query.rules, rule(["shape", "rows"], "eq", 9, "again")],
      };

      expect(
        ensureRequiredRules(duplicated).rules.map((node) => node.id),
      ).toStrictEqual(["rows", "repeats", "filter-0", "filter-1"]);
    });
  });

  describe(isQueryAllowed, () => {
    it("allows a tree with each required rule once and nothing negated", () => {
      expect(isQueryAllowed(toFilterQuery(LINK, FIELDS), FIELDS)).toBe(true);
    });

    it("refuses a tree that lost, or doubled, rows or repeats", () => {
      const query = toFilterQuery(LINK, FIELDS);

      expect(
        isQueryAllowed({ ...query, rules: query.rules.slice(1) }, FIELDS),
      ).toBe(false);
      expect(
        isQueryAllowed(
          {
            ...query,
            rules: [...query.rules, rule(["shape", "repeats"], "eq", 2)],
          },
          FIELDS,
        ),
      ).toBe(false);
    });

    it("refuses a negated rule and a tree nested past the API's caps", () => {
      expect(
        isQueryAllowed(
          treeWith({
            ...rule(["path", "junctionCount"], "eq", 1),
            negated: true,
          } as GalleryFilterNode),
          FIELDS,
        ),
      ).toBe(false);

      let nested: GalleryFilterNode = rule(["path", "junctionCount"], "eq", 1);

      for (let level = 0; level < 6; level += 1) {
        nested = {
          combinator: "and",
          id: `level-${String(level)}`,
          rules: [nested],
          type: "group",
        };
      }

      expect(isQueryAllowed(treeWith(nested), FIELDS)).toBe(false);
    });
  });

  describe(isSameFilterLink, () => {
    it("compares what the links hold", () => {
      expect(isSameFilterLink(LINK, structuredClone(LINK))).toBe(true);
      expect(isSameFilterLink(LINK, { ...LINK, repeats: 7 })).toBe(false);
    });
  });
});
