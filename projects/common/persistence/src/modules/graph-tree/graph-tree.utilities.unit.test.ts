import { describe, expect, it } from "vitest";

import {
  buildTreeGraph,
  nestedSetParents,
  requireTreeMetadata,
} from "./graph-tree.utilities";

describe("graph tree utilities", () => {
  describe(requireTreeMetadata, () => {
    it("returns the value a tree's metadata holds", () => {
      expect(requireTreeMetadata("closure-table", "missing")).toBe(
        "closure-table",
      );
    });

    it("throws the message when the metadata is missing", () => {
      expect(() => requireTreeMetadata(undefined, "no path column")).toThrow(
        "no path column",
      );
    });
  });

  describe(buildTreeGraph, () => {
    it("draws each parent-to-child edge and marks rows without a parent as roots", () => {
      const graph = buildTreeGraph([
        { id: "1", label: "Work", parentId: undefined },
        { id: "2", label: "Errands", parentId: undefined },
        { id: "3", label: "Email", parentId: "1" },
      ]);

      expect(graph).toStrictEqual({
        directed: true,
        edges: [{ source: "1", target: "3" }],
        nodes: [
          { id: "1", label: "Work", marker: "root" },
          { id: "2", label: "Errands", marker: "root" },
          { id: "3", label: "Email" },
        ],
        warnings: [],
      });
    });

    it("draws a row whose parent no row has as a root, with a warning", () => {
      const graph = buildTreeGraph([
        { id: "7", label: "Orphan", parentId: "9" },
      ]);

      expect(graph.nodes).toStrictEqual([
        { id: "7", label: "Orphan", marker: "root" },
      ]);
      expect(graph.edges).toStrictEqual([]);
      expect(graph.warnings).toStrictEqual([
        "Node 7 names parent 9, which no row has; drawn as a root",
      ]);
    });
  });

  describe(nestedSetParents, () => {
    it("finds each row's nearest enclosing interval as its parent", () => {
      const parents = nestedSetParents([
        { id: "a", left: 1, right: 6 },
        { id: "b", left: 2, right: 3 },
        { id: "c", left: 4, right: 5 },
        { id: "d", left: 7, right: 8 },
      ]);

      expect(parents).toStrictEqual(
        new Map<string, string | undefined>([
          ["a", undefined],
          ["b", "a"],
          ["c", "a"],
          ["d", undefined],
        ]),
      );
    });
  });
});
