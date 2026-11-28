import { describe, expect, it } from "vitest";

import {
  findFullBranches,
  keepHiddenValues,
  resolveSelectable,
  settleFullBranches,
  toExpansion,
} from "./query-cascader.utilities";

import type { CascaderNode } from "@codebase/presentation";

/** A folder, a leaf, and a tag under two parents. */
const TREE: CascaderNode[] = [
  {
    children: [
      {
        children: [
          { label: "Quintile", value: "quintile" },
          { label: "Biquintile", value: "biquintile" },
        ],
        label: "Harmonic 5",
        value: "harmonic-5",
      },
      {
        children: [
          { label: "Venus", value: "venus@@a" },
          { label: "Mars", value: "mars" },
        ],
        label: "Personal",
        value: "personal",
      },
      {
        children: [{ label: "Venus", value: "venus@@b" }],
        label: "Benefic",
        value: "benefic",
      },
    ],
    label: "Tag",
    value: "field|tag",
  },
];
const OFFERED = (node: CascaderNode): boolean =>
  !node.value.startsWith("field|");

describe("query-cascader utilities", () => {
  describe(toExpansion, () => {
    it("carries only the expansion props it is given", () => {
      const change = (): void => undefined;

      expect(toExpansion(undefined, undefined, undefined)).toStrictEqual({});
      expect(toExpansion(["a"], ["b"], change)).toStrictEqual({
        defaultExpanded: ["a"],
        expanded: ["b"],
        onExpandedChange: change,
      });
    });
  });

  describe(resolveSelectable, () => {
    it("gives every row to a cascade, and only leaves to anything else", () => {
      expect(resolveSelectable(true, undefined)).toBe("any");
      expect(resolveSelectable(false, undefined)).toBe("leaf");
    });

    it("gives the rows a predicate names, whatever the cascade", () => {
      const predicate = (): boolean => true;

      expect(resolveSelectable(true, predicate)).toBe(predicate);
      expect(resolveSelectable(false, predicate)).toBe(predicate);
    });
  });

  describe(keepHiddenValues, () => {
    const items = [
      { children: [{ label: "B", value: "b" }], label: "A", value: "a" },
    ];

    it("adds back the earlier values the list does not offer", () => {
      expect(keepHiddenValues(["b"], ["a", "gone"], items)).toStrictEqual([
        "b",
        "gone",
      ]);
    });

    it("keeps nothing extra when the list offers every earlier value", () => {
      expect(keepHiddenValues(["a"], ["a", "b"], items)).toStrictEqual(["a"]);
    });
  });

  describe(findFullBranches, () => {
    it("names a branch whose every offered row is ticked, and no other", () => {
      expect(
        findFullBranches(TREE, ["quintile", "biquintile"], OFFERED),
      ).toStrictEqual(new Set(["harmonic-5"]));
      expect(
        findFullBranches(TREE, ["quintile", "mars"], OFFERED),
      ).toStrictEqual(new Set());
    });

    it("counts a shared row for each parent, so ticking its rows fills both", () => {
      expect(
        findFullBranches(TREE, ["venus@@a", "venus@@b", "mars"], OFFERED),
      ).toStrictEqual(new Set(["benefic", "personal"]));
    });

    it("fills a branch up the tree, and leaves out one already ticked or one that cannot be picked", () => {
      const all = ["quintile", "biquintile", "venus@@a", "venus@@b", "mars"];

      expect(findFullBranches(TREE, all, OFFERED)).toStrictEqual(
        new Set(["benefic", "harmonic-5", "personal"]),
      );
      expect(
        findFullBranches(TREE, [...all, "harmonic-5"], OFFERED),
      ).toStrictEqual(new Set(["benefic", "personal"]));
    });

    it("lets a folder with nothing to pick beneath it fill nothing", () => {
      const folders: CascaderNode[] = [
        { children: [{ label: "B", value: "b" }], label: "A", value: "a" },
      ];

      expect(findFullBranches(folders, ["b"], () => false)).toStrictEqual(
        new Set(),
      );
    });
  });

  describe(settleFullBranches, () => {
    const context = { isOffered: OFFERED, items: TREE };

    it("takes the branches shown ticked back out of the picks", () => {
      expect(
        settleFullBranches(
          ["quintile", "biquintile", "harmonic-5", "mars"],
          new Set(["harmonic-5"]),
          context,
        ),
      ).toStrictEqual(["quintile", "biquintile", "mars"]);
    });

    it("clears the rows of a full branch that was cleared while its rows stayed", () => {
      expect(
        settleFullBranches(
          ["quintile", "biquintile", "mars"],
          new Set(["harmonic-5"]),
          context,
        ),
      ).toStrictEqual(["mars"]);
    });

    it("keeps the rows that stay when one of them was cleared instead", () => {
      expect(
        settleFullBranches(["quintile"], new Set(["harmonic-5"]), context),
      ).toStrictEqual(["quintile"]);
    });
  });
});
