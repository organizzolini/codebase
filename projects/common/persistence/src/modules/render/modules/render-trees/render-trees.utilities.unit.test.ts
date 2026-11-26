import { describe, expect, it } from "vitest";

import {
  buildTreeGraph,
  keepRowsIn,
  limitTreeGraph,
  matchedAncestors,
  matchedSubtrees,
  orderRowsByRank,
  pageTreeRows,
  requireTreeMetadata,
} from "./render-trees.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { GraphTreeLimits, GraphTreeRow } from "./render-trees.types";

/** The graph a tree's rows draw once the limits cap it. */
const capped = (
  rows: readonly GraphTreeRow[],
  limits: GraphTreeLimits,
): GraphModel => limitTreeGraph(buildTreeGraph(rows), limits);

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

  describe("a node with several parents", () => {
    const ROWS: GraphTreeRow[] = [
      { id: "a", label: "A", parentId: undefined },
      { id: "b", label: "B", parentId: undefined },
      { id: "c", label: "C", otherParentIds: ["b"], parentId: "a" },
    ];

    it("draws an edge from each parent to the one node, and marks only the rows without a parent as roots", () => {
      const graph = buildTreeGraph(ROWS);

      expect(graph.edges).toStrictEqual([
        { source: "a", target: "c" },
        { source: "b", target: "c" },
      ]);
      expect(graph.nodes.map(({ marker }) => marker)).toStrictEqual([
        "root",
        "root",
        undefined,
      ]);
    });

    it("keeps every parent of a match, and the subtree below each parent's match", () => {
      expect(
        [...matchedAncestors(ROWS, new Set(["c"]))].toSorted(),
      ).toStrictEqual(["a", "b", "c"]);
      expect(
        [...matchedSubtrees(ROWS, new Set(["b"]))].toSorted(),
      ).toStrictEqual(["b", "c"]);
    });

    it("pages a root with the node it shares", () => {
      const page = pageTreeRows(ROWS, { limit: 1, page: 2 });

      expect(page.rows.map(({ id }) => id)).toStrictEqual(["b", "c"]);
    });

    it("shows the node under both parents when the caps leave them", () => {
      const graph = capped(ROWS, { truncateBreadth: 5, truncateDepth: 5 });

      expect(graph.edges).toHaveLength(2);
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

  describe("buildTreeGraph with limits", () => {
    const rows = [
      { id: "1", label: "Work", parentId: undefined },
      { id: "2", label: "Email", parentId: "1" },
      { id: "3", label: "Meetings", parentId: "1" },
      { id: "4", label: "Inbox", parentId: "2" },
      { id: "5", label: "Errands", parentId: undefined },
    ];

    it("draws every level and child when no limit is given", () => {
      expect(capped(rows, {})).toStrictEqual(buildTreeGraph(rows));
    });

    it("draws every level and child when each limit is above the tree", () => {
      expect(
        capped(rows, { truncateBreadth: 10, truncateDepth: 10 }),
      ).toStrictEqual(buildTreeGraph(rows));
    });

    it("stops at --truncate-depth 1, leaving only the roots and one truncation under each with children", () => {
      const graph = capped(rows, { truncateDepth: 1 });

      expect(graph).toStrictEqual({
        directed: true,
        edges: [{ source: "1", target: "1/more" }],
        nodes: [
          { id: "1", label: "Work", marker: "root" },
          { id: "5", label: "Errands", marker: "root" },
          { id: "1/more", label: "… 2 more", marker: "truncation" },
        ],
        warnings: ["Node 1 hides 2 children beyond --truncate-depth 1"],
      });
    });

    it("keeps the levels through --truncate-depth and truncates the children below", () => {
      const graph = capped(rows, { truncateDepth: 2 });

      expect(graph.nodes).toStrictEqual([
        { id: "1", label: "Work", marker: "root" },
        { id: "2", label: "Email" },
        { id: "3", label: "Meetings" },
        { id: "5", label: "Errands", marker: "root" },
        { id: "2/more", label: "… 1 more", marker: "truncation" },
      ]);
      expect(graph.edges).toStrictEqual([
        { source: "1", target: "2" },
        { source: "1", target: "3" },
        { source: "2", target: "2/more" },
      ]);
      expect(graph.warnings).toStrictEqual([
        "Node 2 hides 1 child beyond --truncate-depth 2",
      ]);
    });

    it("shows the first --truncate-breadth children under a node and truncates the rest", () => {
      const graph = capped(rows, { truncateBreadth: 1 });

      expect(graph.nodes).toStrictEqual([
        { id: "1", label: "Work", marker: "root" },
        { id: "2", label: "Email" },
        { id: "4", label: "Inbox" },
        { id: "5", label: "Errands", marker: "root" },
        { id: "1/more", label: "… 1 more", marker: "truncation" },
      ]);
      expect(graph.edges).toStrictEqual([
        { source: "1", target: "2" },
        { source: "2", target: "4" },
        { source: "1", target: "1/more" },
      ]);
      expect(graph.warnings).toStrictEqual([
        "Node 1 hides 1 child beyond --truncate-breadth 1",
      ]);
    });

    it("applies both limits together, truncating breadth above and depth below", () => {
      const graph = capped(rows, { truncateBreadth: 1, truncateDepth: 2 });

      expect(graph.nodes).toStrictEqual([
        { id: "1", label: "Work", marker: "root" },
        { id: "2", label: "Email" },
        { id: "5", label: "Errands", marker: "root" },
        { id: "1/more", label: "… 1 more", marker: "truncation" },
        { id: "2/more", label: "… 1 more", marker: "truncation" },
      ]);
      expect(graph.edges).toStrictEqual([
        { source: "1", target: "2" },
        { source: "1", target: "1/more" },
        { source: "2", target: "2/more" },
      ]);
      expect(graph.warnings).toStrictEqual([
        "Node 1 hides 1 child beyond --truncate-breadth 1",
        "Node 2 hides 1 child beyond --truncate-depth 2",
      ]);
    });

    it("never caps the roots with --truncate-breadth", () => {
      const graph = capped(
        [
          { id: "a", label: "A", parentId: undefined },
          { id: "b", label: "B", parentId: undefined },
          { id: "c", label: "C", parentId: undefined },
        ],
        { truncateBreadth: 1 },
      );

      expect(graph.nodes.map(({ id }) => id)).toStrictEqual(["a", "b", "c"]);
      expect(graph.warnings).toStrictEqual([]);
    });

    it("keeps a cycle, which no root reaches, drawn as it was by any limit", () => {
      const graph = capped(
        [
          { id: "7", label: "A", parentId: "8" },
          { id: "8", label: "B", parentId: "7" },
          { id: "9", label: "R", parentId: undefined },
        ],
        { truncateDepth: 1 },
      );

      expect(graph.nodes).toStrictEqual([
        { id: "7", label: "A" },
        { id: "8", label: "B" },
        { id: "9", label: "R", marker: "root" },
      ]);
      expect(graph.edges).toStrictEqual([
        { source: "8", target: "7" },
        { source: "7", target: "8" },
      ]);
    });

    it("caps a root with 20,000 children at its first two, in row order", () => {
      const rows: GraphTreeRow[] = [
        { id: "1", label: "Work", parentId: undefined },
        ...Array.from({ length: 20_000 }, (_, index) => ({
          id: `c${String(index)}`,
          label: `Child ${String(index)}`,
          parentId: "1",
        })),
      ];

      const graph = capped(rows, { truncateBreadth: 2 });

      expect(graph.nodes.map(({ id }) => id)).toStrictEqual([
        "1",
        "c0",
        "c1",
        "1/more",
      ]);
      expect(graph.nodes.at(-1)).toStrictEqual({
        id: "1/more",
        label: "… 19998 more",
        marker: "truncation",
      });
    });

    it("gives each truncation node an id no row already uses", () => {
      const graph = capped(
        [
          { id: "1", label: "Work", parentId: undefined },
          { id: "2", label: "Email", parentId: "1" },
          { id: "1/more", label: "Odd", parentId: "1" },
        ],
        { truncateBreadth: 1 },
      );

      const ids = graph.nodes.map(({ id }) => id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(graph.nodes.at(-1)).toStrictEqual({
        id: "1/more-2",
        label: "… 1 more",
        marker: "truncation",
      });
    });
  });

  describe("filter keeping", () => {
    const ROWS: GraphTreeRow[] = [
      { id: "1", label: "Work", parentId: undefined },
      { id: "2", label: "Email", parentId: "1" },
      { id: "4", label: "Inbox", parentId: "2" },
      { id: "3", label: "Meetings", parentId: "1" },
      { id: "5", label: "Errands", parentId: undefined },
    ];

    /** The rows a filter keeps: each match, its ancestors, and its subtree. */
    const keep = (
      rows: readonly GraphTreeRow[],
      matches: ReadonlySet<string>,
    ): GraphTreeRow[] =>
      keepRowsIn(
        rows,
        new Set([
          ...matchedAncestors(rows, matches),
          ...matchedSubtrees(rows, matches),
        ]),
      );

    it("keeps each match and every ancestor of it, dropping the rest", () => {
      expect(keep(ROWS, new Set(["4"])).map(({ id }) => id)).toStrictEqual([
        "1",
        "2",
        "4",
      ]);
    });

    it("keeps a match's descendants with its ancestors, and not its siblings", () => {
      expect(keep(ROWS, new Set(["2"])).map(({ id }) => id)).toStrictEqual([
        "1",
        "2",
        "4",
      ]);
    });

    it("keeps every descendant of a root match, however deep, but not an unrelated root", () => {
      expect(keep(ROWS, new Set(["1"])).map(({ id }) => id)).toStrictEqual([
        "1",
        "2",
        "4",
        "3",
      ]);
    });

    it("keeps no row when nothing matches", () => {
      expect(keep(ROWS, new Set())).toStrictEqual([]);
    });

    it("lists a match's subtree ids on their own", () => {
      expect(matchedSubtrees(ROWS, new Set(["2"]))).toStrictEqual(
        new Set(["2", "4"]),
      );
    });

    it("stops at a parent no row has, so a row whose parent is missing stays a root", () => {
      const kept = keep(
        [{ id: "7", label: "Stray", parentId: "99" }],
        new Set(["7"]),
      );

      expect(kept.map(({ id }) => id)).toStrictEqual(["7"]);
    });

    it("ends each walk on a cycle, keeping each row once", () => {
      const kept = keep(
        [
          { id: "a", label: "A", parentId: "b" },
          { id: "b", label: "B", parentId: "a" },
        ],
        new Set(["a"]),
      );

      expect(kept.map(({ id }) => id).toSorted()).toStrictEqual(["a", "b"]);
    });
  });

  describe(orderRowsByRank, () => {
    it("orders rows by their position in the rank, keeping ties in row order", () => {
      const rows: GraphTreeRow[] = [
        { id: "1", label: "Work", parentId: undefined },
        { id: "2", label: "Email", parentId: "1" },
        { id: "3", label: "Meetings", parentId: "1" },
      ];

      const ordered = orderRowsByRank(rows, ["3", "1", "2"]);

      expect(ordered.map(({ id }) => id)).toStrictEqual(["3", "1", "2"]);
    });

    it("places a row the rank omits after every ranked row", () => {
      const rows: GraphTreeRow[] = [
        { id: "1", label: "Work", parentId: undefined },
        { id: "9", label: "Stray", parentId: undefined },
      ];

      const ordered = orderRowsByRank(rows, ["9"]);

      expect(ordered.map(({ id }) => id)).toStrictEqual(["9", "1"]);
    });

    it("skips a rank id that no row has, keeping the rows it names", () => {
      const rows: GraphTreeRow[] = [
        { id: "9", label: "Stray", parentId: undefined },
      ];

      const ordered = orderRowsByRank(rows, ["7", "9"]);

      expect(ordered.map(({ id }) => id)).toStrictEqual(["9"]);
    });
  });

  describe(pageTreeRows, () => {
    const forest: GraphTreeRow[] = [
      { id: "1", label: "Work", parentId: undefined },
      { id: "2", label: "Email", parentId: "1" },
      { id: "3", label: "Meetings", parentId: "1" },
      { id: "4", label: "Inbox", parentId: "2" },
      { id: "5", label: "Errands", parentId: undefined },
      { id: "6", label: "Home", parentId: undefined },
    ];

    it("keeps the roots of the first page with each one's descendants, in row order", () => {
      const paged = pageTreeRows(forest, { limit: 2, page: 1 });

      expect(paged.rows.map(({ id }) => id)).toStrictEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
      ]);
      expect(paged.warning).toBeUndefined();
    });

    it("keeps the roots of a later page, with their descendants", () => {
      const paged = pageTreeRows(forest, { limit: 2, page: 2 });

      expect(paged.rows.map(({ id }) => id)).toStrictEqual(["6"]);
      expect(paged.warning).toBeUndefined();
    });

    it("selects nothing past the last root and warns with the page, limit, and root count", () => {
      const paged = pageTreeRows(forest, { limit: 2, page: 3 });

      expect(paged.rows).toStrictEqual([]);
      expect(paged.warning).toBe(
        "Page 3 with --limit 2 is past the last root: the tree has 3 roots in total, so nothing is drawn",
      );
    });

    it("warns in the singular for a tree with one root", () => {
      const paged = pageTreeRows(forest.slice(0, 1), { limit: 1, page: 2 });

      expect(paged.warning).toBe(
        "Page 2 with --limit 1 is past the last root: the tree has 1 root in total, so nothing is drawn",
      );
    });

    it("warns on page 1 of a tree with no roots", () => {
      const paged = pageTreeRows([], { limit: 1, page: 1 });

      expect(paged.rows).toStrictEqual([]);
      expect(paged.warning).toContain("the tree has 0 roots in total");
    });

    it("counts a row whose parent no row has as a root", () => {
      const rows: GraphTreeRow[] = [
        { id: "7", label: "Stray", parentId: "99" },
        { id: "8", label: "Child", parentId: "7" },
        { id: "9", label: "Other", parentId: undefined },
      ];

      const paged = pageTreeRows(rows, { limit: 1, page: 1 });

      expect(paged.rows.map(({ id }) => id)).toStrictEqual(["7", "8"]);
    });

    it("keeps a hub's 200,000 children without overflowing the call stack", () => {
      const rows: GraphTreeRow[] = [
        { id: "hub", label: "Hub", parentId: undefined },
        ...Array.from({ length: 200_000 }, (_, index) => ({
          id: `c${String(index)}`,
          label: "Leaf",
          parentId: "hub",
        })),
      ];

      const paged = pageTreeRows(rows, { limit: 1, page: 1 });

      expect(paged.rows).toHaveLength(200_001);
    });

    it("leaves out a cycle that no selected root reaches", () => {
      const rows: GraphTreeRow[] = [
        { id: "1", label: "Work", parentId: undefined },
        { id: "2", label: "Loop a", parentId: "3" },
        { id: "3", label: "Loop b", parentId: "2" },
      ];

      const paged = pageTreeRows(rows, { limit: 1, page: 1 });

      expect(paged.rows.map(({ id }) => id)).toStrictEqual(["1"]);
    });
  });

  describe("a tree row's icon and note", () => {
    it("passes them to its node, leaving out what the row lacks", () => {
      const graph = buildTreeGraph([
        {
          icon: "sun",
          id: "a",
          label: "Solar",
          note: "The Sun",
          parentId: undefined,
        },
        { id: "b", label: "Season", parentId: "a" },
      ]);

      expect(graph.nodes).toStrictEqual([
        {
          icon: "sun",
          id: "a",
          label: "Solar",
          marker: "root",
          note: "The Sun",
        },
        { id: "b", label: "Season" },
      ]);
    });
  });
});
