import { describe, expect, it } from "vitest";

import { limitDagGraph, pageDagGraph } from "./graph-dag-limits.utilities";
import { buildDagGraph } from "./graph-dag.utilities";

import type { GraphDagEdge } from "./graph-dag.types";

/** An edge between two named nodes. */
const edge = (source: string, target: string): GraphDagEdge => ({
  source,
  target,
});

/** The ids of a model's nodes, in order. */
const ids = (graph: { nodes: readonly { id: string }[] }): string[] =>
  graph.nodes.map(({ id }) => id);

/** A diamond with a shortcut. */
const SHORTCUT = [
  edge("A", "B"),
  edge("A", "C"),
  edge("A", "D"),
  edge("B", "D"),
  edge("C", "D"),
  edge("D", "E"),
];

describe("graph dag limits utilities", () => {
  describe(limitDagGraph, () => {
    it("returns the graph itself when no cap is given", () => {
      const graph = buildDagGraph(SHORTCUT);

      expect(limitDagGraph(graph, {})).toBe(graph);
    });

    it("measures depth as the shortest distance from a root", () => {
      const graph = limitDagGraph(buildDagGraph(SHORTCUT), {
        maximumDepth: 2,
      });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D", "D/more"]);
      expect(graph.edges).toContainEqual(edge("A", "D"));
      expect(graph.edges).toContainEqual(edge("B", "D"));
      expect(graph.warnings).toStrictEqual([
        "Node D hides 1 child beyond --max-depth 2",
      ]);
    });

    it("draws a node reached by several paths once", () => {
      const graph = limitDagGraph(buildDagGraph(SHORTCUT), {
        maximumBreadth: 3,
      });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D", "E"]);
      expect(graph.edges).toHaveLength(6);
    });

    it("hides children beyond the breadth under a truncation node", () => {
      const graph = limitDagGraph(buildDagGraph(SHORTCUT), {
        maximumBreadth: 2,
      });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D", "E", "A/more"]);
      expect(graph.nodes.at(-1)).toStrictEqual({
        id: "A/more",
        label: "… 1 more",
        marker: "truncation",
      });
      expect(graph.edges).not.toContainEqual(edge("A", "D"));
      expect(graph.warnings).toStrictEqual([
        "Node A hides 1 child beyond --max-breadth 2",
      ]);
    });

    it("stops at a cycle a root reaches, with only a breadth cap", () => {
      const graph = limitDagGraph(
        buildDagGraph([edge("R", "A"), edge("A", "B"), edge("B", "A")]),
        { maximumBreadth: 1 },
      );

      expect(ids(graph)).toStrictEqual(["R", "A", "B"]);
      expect(graph.edges).toHaveLength(3);
    });

    it("keeps a component no root reaches as it is", () => {
      const graph = limitDagGraph(
        buildDagGraph([edge("R", "S"), edge("X", "Y"), edge("Y", "X")]),
        { maximumDepth: 1 },
      );

      expect(ids(graph)).toStrictEqual(["R", "X", "Y", "R/more"]);
      expect(graph.edges).toContainEqual(edge("X", "Y"));
    });

    it("keeps a self-loop on a node that stays", () => {
      const graph = limitDagGraph(
        buildDagGraph([edge("R", "A"), edge("A", "A")]),
        { maximumDepth: 2 },
      );

      expect(graph.edges).toContainEqual(edge("A", "A"));
    });
  });

  describe(pageDagGraph, () => {
    const forest = buildDagGraph([
      edge("A", "B"),
      edge("C", "D"),
      edge("E", "D"),
      edge("E", "F"),
    ]);

    it("keeps the page's roots and everything reachable from them", () => {
      const graph = pageDagGraph(forest, { limit: 1, page: 3 });

      expect(ids(graph)).toStrictEqual(["D", "E", "F"]);
      expect(graph.edges).toStrictEqual([edge("E", "D"), edge("E", "F")]);
    });

    it("pages roots, not nodes", () => {
      const graph = pageDagGraph(forest, { limit: 2, page: 1 });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D"]);
    });

    it("draws a short last page", () => {
      const graph = pageDagGraph(forest, { limit: 2, page: 2 });

      expect(ids(graph)).toStrictEqual(["D", "E", "F"]);
    });

    it("says root in the singular when the graph has only one", () => {
      const graph = pageDagGraph(buildDagGraph([edge("A", "B")]), {
        limit: 1,
        page: 2,
      });

      expect(graph.warnings).toStrictEqual([
        "Page 2 with --limit 1 is past the last root: the graph has 1 root in total, so nothing is drawn",
      ]);
    });

    it("draws nothing and warns for a page past the last root", () => {
      const graph = pageDagGraph(forest, { limit: 2, page: 3 });

      expect(graph.nodes).toStrictEqual([]);
      expect(graph.warnings).toStrictEqual([
        "Page 3 with --limit 2 is past the last root: the graph has 3 roots in total, so nothing is drawn",
      ]);
    });
  });
});
