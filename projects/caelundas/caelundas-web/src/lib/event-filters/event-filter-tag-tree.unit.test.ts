import { describe, expect, it } from "vitest";

import { findAncestors, toTagTreeRows } from "./event-filter-tag-tree";

import type { FilterOption } from "@codebase/presentation";

function option(value: string, depth: number): FilterOption {
  return { data: { depth, name: value }, label: value, value };
}

// aspect
//   major
//     square
//     trine
//   minor
// ingress
//   sign
const ITEMS = [
  option("aspect", 0),
  option("major", 1),
  option("square", 2),
  option("trine", 2),
  option("minor", 1),
  option("ingress", 0),
  option("sign", 1),
];

function ids(rows: ReturnType<typeof toTagTreeRows>): string[] {
  return rows.map((row) => row.item.value);
}

const NONE = new Set<string>();

describe("tag tree", () => {
  describe(toTagTreeRows, () => {
    it("shows only the first level while everything is closed", () => {
      expect(
        ids(
          toTagTreeRows(ITEMS, {
            expanded: NONE,
            selected: [],
            showAll: false,
          }),
        ),
      ).toStrictEqual(["aspect", "ingress"]);
    });

    it("shows a tag's own tags once it is open, and theirs only when open too", () => {
      expect(
        ids(
          toTagTreeRows(ITEMS, {
            expanded: new Set(["aspect"]),
            selected: [],
            showAll: false,
          }),
        ),
      ).toStrictEqual(["aspect", "major", "minor", "ingress"]);
      expect(
        ids(
          toTagTreeRows(ITEMS, {
            expanded: new Set(["aspect", "major"]),
            selected: [],
            showAll: false,
          }),
        ),
      ).toStrictEqual([
        "aspect",
        "major",
        "square",
        "trine",
        "minor",
        "ingress",
      ]);
    });

    it("hides what is under a closed tag even when a tag beneath it is open", () => {
      expect(
        ids(
          toTagTreeRows(ITEMS, {
            expanded: new Set(["major"]),
            selected: [],
            showAll: false,
          }),
        ),
      ).toStrictEqual(["aspect", "ingress"]);
    });

    it("marks the tags that have tags beneath them, and whether they are open", () => {
      const rows = toTagTreeRows(ITEMS, {
        expanded: new Set(["aspect"]),
        selected: [],
        showAll: false,
      });

      expect(
        rows.map((row) => [row.item.value, row.hasChildren, row.isExpanded]),
      ).toStrictEqual([
        ["aspect", true, true],
        ["major", true, false],
        ["minor", false, false],
        ["ingress", true, false],
      ]);
    });

    it("counts the picks beneath each tag, at any depth", () => {
      const rows = toTagTreeRows(ITEMS, {
        expanded: NONE,
        selected: ["square", "trine", "sign", "minor"],
        showAll: false,
      });

      expect(
        rows.map((row) => [row.item.value, row.selectedBelow]),
      ).toStrictEqual([
        ["aspect", 3],
        ["ingress", 1],
      ]);
    });

    it("shows every tag with no handle while searching", () => {
      const rows = toTagTreeRows(ITEMS, {
        expanded: NONE,
        selected: [],
        showAll: true,
      });

      expect(ids(rows)).toStrictEqual(ITEMS.map((item) => item.value));
      expect(rows.every((row) => !row.hasChildren)).toBe(true);
    });

    it("reads an option with no depth as a first-level tag", () => {
      const rows = toTagTreeRows([{ label: "Plain", value: "plain" }], {
        expanded: NONE,
        selected: [],
        showAll: false,
      });

      expect(rows[0]).toMatchObject({
        depth: 0,
        hasChildren: false,
        name: "Plain",
      });
    });
  });

  describe(findAncestors, () => {
    it("finds every tag above a tag", () => {
      expect([...findAncestors(ITEMS, ["square"])].toSorted()).toStrictEqual([
        "aspect",
        "major",
      ]);
    });

    it("finds the tags above each of several, once", () => {
      expect(
        [...findAncestors(ITEMS, ["trine", "sign", "minor"])].toSorted(),
      ).toStrictEqual(
        ["aspect", "ingress", "major"]
          .toSorted()
          .filter((id) => id !== "major" || true),
      );
    });

    it("finds nothing above a first-level tag or no tag", () => {
      expect(findAncestors(ITEMS, ["aspect"]).size).toBe(0);
      expect(findAncestors(ITEMS, []).size).toBe(0);
    });
  });
});
