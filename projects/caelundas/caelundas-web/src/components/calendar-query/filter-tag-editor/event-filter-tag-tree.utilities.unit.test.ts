import { describe, expect, it } from "vitest";

import {
  findAncestors,
  getTagStates,
  readFolder,
  toggleTag,
  toTagTreeRows,
} from "./event-filter-tag-tree.utilities";

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

// planet
//   personal
//     mercury
//     venus   (also under benefic)
//     mars
// benefic
//   jupiter
//   venus     (the same tag)
const SHARED = [
  option("planet", 0),
  option("personal", 1),
  option("mercury", 2),
  option("venus", 2),
  option("mars", 2),
  option("benefic", 0),
  option("jupiter", 1),
  option("venus", 1),
];

describe("tag tree", () => {
  describe("a tag under two parents", () => {
    it("is checked everywhere once it is picked anywhere", () => {
      const states = getTagStates(SHARED, ["venus"]);

      expect(states.get("venus")).toBe("checked");
      expect(states.get("personal")).toBe("partial");
      expect(states.get("benefic")).toBe("partial");
      expect(states.get("planet")).toBe("partial");
    });

    it("is checked under the second parent when that parent is picked", () => {
      const states = getTagStates(SHARED, ["benefic"]);

      expect(states.get("venus")).toBe("checked");
      expect(states.get("benefic")).toBe("checked");
      expect(states.get("personal")).toBe("partial");
      expect(states.get("planet")).toBe("partial");
    });

    it("completes a parent whose other children are picked, the shared child counting wherever it is picked", () => {
      expect(toggleTag(SHARED, ["jupiter"], "benefic")).toStrictEqual([
        "benefic",
      ]);
      expect(getTagStates(SHARED, ["venus", "jupiter"]).get("benefic")).toBe(
        "checked",
      );
    });

    it("removes it from either place, taking it from the parent that held it", () => {
      expect(toggleTag(SHARED, ["benefic"], "venus")).toStrictEqual([
        "jupiter",
      ]);
    });

    it("picks the tag once, however many places it is ticked from", () => {
      expect(toggleTag(SHARED, [], "venus")).toStrictEqual(["venus"]);
    });

    it("opens both parents of a picked tag, and counts the pick inside each when closed", () => {
      expect([...findAncestors(SHARED, ["venus"])].toSorted()).toStrictEqual([
        "benefic",
        "personal",
        "planet",
      ]);

      const rows = toTagTreeRows(SHARED, {
        expanded: NONE,
        selected: ["venus"],
        showAll: false,
      });

      expect(rows.map((row) => row.selectedBelow)).toStrictEqual([1, 1]);
    });
  });

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

  describe(getTagStates, () => {
    it("checks a tag whose own tags are all picked, and every tag beneath a pick", () => {
      const states = getTagStates(ITEMS, ["major"]);

      expect(states.get("major")).toBe("checked");
      expect(states.get("square")).toBe("checked");
      expect(states.get("trine")).toBe("checked");
    });

    it("shows a tag with only some of its tags picked as partial, up through every tag above it", () => {
      const states = getTagStates(ITEMS, ["square"]);

      expect(states.get("square")).toBe("checked");
      expect(states.get("trine")).toBe("unchecked");
      expect(states.get("major")).toBe("partial");
      expect(states.get("aspect")).toBe("partial");
      expect(states.get("minor")).toBe("unchecked");
      expect(states.get("ingress")).toBe("unchecked");
    });

    it("checks a tag once all its tags are picked one by one", () => {
      const states = getTagStates(ITEMS, ["square", "trine", "minor"]);

      expect(states.get("major")).toBe("checked");
      expect(states.get("aspect")).toBe("checked");
    });

    it("leaves every tag unchecked for no picks", () => {
      expect([...getTagStates(ITEMS, []).values()]).toStrictEqual(
        ITEMS.map(() => "unchecked"),
      );
    });
  });

  describe(toggleTag, () => {
    it("picks a tag with everything beneath it, as the tag alone", () => {
      expect(toggleTag(ITEMS, [], "major")).toStrictEqual(["major"]);
      expect(toggleTag(ITEMS, [], "aspect")).toStrictEqual(["aspect"]);
    });

    it("picks a partly picked tag in full", () => {
      expect(toggleTag(ITEMS, ["square"], "major")).toStrictEqual(["major"]);
    });

    it("clears a checked tag with everything beneath it", () => {
      expect(toggleTag(ITEMS, ["aspect"], "major")).toStrictEqual(["minor"]);
      expect(toggleTag(ITEMS, ["major"], "major")).toStrictEqual([]);
    });

    it("picks the rest of a tag's tags as the tag when the last is ticked", () => {
      expect(toggleTag(ITEMS, ["square"], "trine")).toStrictEqual(["major"]);
      expect(toggleTag(ITEMS, ["major"], "minor")).toStrictEqual(["aspect"]);
    });

    it("splits a picked tag into the tags left when one beneath it is cleared", () => {
      expect(toggleTag(ITEMS, ["aspect"], "square")).toStrictEqual([
        "trine",
        "minor",
      ]);
    });

    it("leaves the picks as they are for a tag it does not know", () => {
      expect(toggleTag(ITEMS, ["square", 3], "missing")).toStrictEqual([
        "square",
      ]);
    });
  });

  describe(readFolder, () => {
    it("reads a folder mark, and takes any other option for a tag to pick", () => {
      expect(
        readFolder({
          data: { depth: 0, folder: true, name: "Sign" },
          label: "Sign",
          value: "sign",
        }),
      ).toBe(true);
      expect(readFolder(option("sign", 0))).toBe(false);
      expect(readFolder({ label: "x", value: "x" })).toBe(false);
    });

    it("marks a folder's row", () => {
      const items = [
        {
          ...option("sign", 0),
          data: { depth: 0, folder: true, name: "sign" },
        },
        option("aries", 1),
      ];
      const opened = toTagTreeRows(items, {
        expanded: new Set(["sign"]),
        selected: [],
        showAll: false,
      });

      expect(opened.map((row) => row.isFolder)).toStrictEqual([true, false]);
    });
  });
});
