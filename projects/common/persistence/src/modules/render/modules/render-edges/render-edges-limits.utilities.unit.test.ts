import { describe, expect, it } from "vitest";

import {
  limitEdgesGraph,
  pageEdgesGraph,
} from "./render-edges-limits.utilities";
import { buildEdgeGraph } from "./render-edges.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { GraphEdgesEdge } from "./render-edges.types";

/** An edge between two named nodes. */
const edge = (source: string, target: string): GraphEdgesEdge => ({
  source,
  target,
});

/** Builds a `@DirectedAcyclicGraph` graph from edges. */
const buildDirectedAcyclicGraph = (
  edges: readonly GraphEdgesEdge[],
): GraphModel =>
  buildEdgeGraph(edges, { directed: true, kind: "directed-acyclic-graph" });

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

describe("graph edges limits utilities", () => {
  describe(limitEdgesGraph, () => {
    it("returns the graph itself when no cap is given", () => {
      const graph = buildDirectedAcyclicGraph(SHORTCUT);

      expect(limitEdgesGraph(graph, {})).toBe(graph);
    });

    it("measures depth as the shortest distance from a root", () => {
      const graph = limitEdgesGraph(buildDirectedAcyclicGraph(SHORTCUT), {
        truncateDepth: 2,
      });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D", "D/more"]);
      expect(graph.edges).toContainEqual(edge("A", "D"));
      expect(graph.edges).toContainEqual(edge("B", "D"));
      expect(graph.warnings).toStrictEqual([
        "Node D hides 1 child beyond --truncate-depth 2",
      ]);
    });

    it("draws a node reached by several paths once", () => {
      const graph = limitEdgesGraph(buildDirectedAcyclicGraph(SHORTCUT), {
        truncateBreadth: 3,
      });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D", "E"]);
      expect(graph.edges).toHaveLength(6);
    });

    it("hides children beyond the breadth under a truncation node", () => {
      const graph = limitEdgesGraph(buildDirectedAcyclicGraph(SHORTCUT), {
        truncateBreadth: 2,
      });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D", "E", "A/more"]);
      expect(graph.nodes.at(-1)).toStrictEqual({
        id: "A/more",
        label: "… 1 more",
        marker: "truncation",
      });
      expect(graph.edges).not.toContainEqual(edge("A", "D"));
      expect(graph.warnings).toStrictEqual([
        "Node A hides 1 child beyond --truncate-breadth 2",
      ]);
    });

    it("stops at a cycle a root reaches, with only a breadth cap", () => {
      const graph = limitEdgesGraph(
        buildDirectedAcyclicGraph([
          edge("R", "A"),
          edge("A", "B"),
          edge("B", "A"),
        ]),
        { truncateBreadth: 1 },
      );

      expect(ids(graph)).toStrictEqual(["R", "A", "B"]);
      expect(graph.edges).toHaveLength(3);
    });

    it("keeps a component no root reaches as it is", () => {
      const graph = limitEdgesGraph(
        buildDirectedAcyclicGraph([
          edge("R", "S"),
          edge("X", "Y"),
          edge("Y", "X"),
        ]),
        { truncateDepth: 1 },
      );

      expect(ids(graph)).toStrictEqual(["R", "X", "Y", "R/more"]);
      expect(graph.edges).toContainEqual(edge("X", "Y"));
    });

    it("keeps a self-loop on a node that stays", () => {
      const graph = limitEdgesGraph(
        buildDirectedAcyclicGraph([edge("R", "A"), edge("A", "A")]),
        {
          truncateDepth: 2,
        },
      );

      expect(graph.edges).toContainEqual(edge("A", "A"));
    });
  });

  describe(pageEdgesGraph, () => {
    const forest = buildDirectedAcyclicGraph([
      edge("A", "B"),
      edge("C", "D"),
      edge("E", "D"),
      edge("E", "F"),
    ]);

    it("keeps the page's roots and everything reachable from them", () => {
      const graph = pageEdgesGraph(forest, { limit: 1, page: 3 });

      expect(ids(graph)).toStrictEqual(["D", "E", "F"]);
      expect(graph.edges).toStrictEqual([edge("E", "D"), edge("E", "F")]);
    });

    it("pages roots, not nodes", () => {
      const graph = pageEdgesGraph(forest, { limit: 2, page: 1 });

      expect(ids(graph)).toStrictEqual(["A", "B", "C", "D"]);
    });

    it("draws a short last page", () => {
      const graph = pageEdgesGraph(forest, { limit: 2, page: 2 });

      expect(ids(graph)).toStrictEqual(["D", "E", "F"]);
    });

    it("says root in the singular when the graph has only one", () => {
      const graph = pageEdgesGraph(
        buildDirectedAcyclicGraph([edge("A", "B")]),
        {
          limit: 1,
          page: 2,
        },
      );

      expect(graph.warnings).toStrictEqual([
        "Page 2 with --limit 1 is past the last root: the graph has 1 root in total, so nothing is drawn",
      ]);
    });

    it("pages a hub with 200,000 children without overflowing the call stack", () => {
      const hub = buildDirectedAcyclicGraph(
        Array.from({ length: 200_000 }, (_, index) =>
          edge("hub", `c${String(index)}`),
        ),
      );

      expect(pageEdgesGraph(hub, { limit: 1, page: 1 }).nodes).toHaveLength(
        200_001,
      );
    });

    it("draws nothing and warns for a page past the last root", () => {
      const graph = pageEdgesGraph(forest, { limit: 2, page: 3 });

      expect(graph.nodes).toStrictEqual([]);
      expect(graph.warnings).toStrictEqual([
        "Page 3 with --limit 2 is past the last root: the graph has 3 roots in total, so nothing is drawn",
      ]);
    });
  });

  describe("self-loops and undirected graphs", () => {
    it("keeps a self-loop root's subtree under a depth cap", () => {
      const graph = limitEdgesGraph(
        buildDirectedAcyclicGraph([
          edge("R", "R"),
          edge("R", "A"),
          edge("A", "B"),
          edge("B", "C"),
        ]),
        { truncateDepth: 2 },
      );

      expect(ids(graph)).toStrictEqual(["R", "A", "A/more"]);
      expect(graph.warnings).toStrictEqual([
        "Node R has an edge to itself: a @DirectedAcyclicGraph must have no cycle",
        "Node A hides 1 child beyond --truncate-depth 2",
      ]);
    });

    it("pages a self-loop root with its subtree", () => {
      const graph = pageEdgesGraph(
        buildDirectedAcyclicGraph([edge("R", "R"), edge("R", "X")]),
        {
          limit: 1,
          page: 1,
        },
      );

      expect(ids(graph)).toStrictEqual(["R", "X"]);
    });

    it("walks an undirected graph both ways from its start node", () => {
      const graph = limitEdgesGraph(
        buildEdgeGraph([edge("A", "B"), edge("C", "B"), edge("C", "D")], {
          directed: false,
          kind: "graph",
        }),
        { truncateDepth: 2 },
      );

      expect(ids(graph)).toStrictEqual(["A", "B", "B/more"]);
      expect(graph.edges).toContainEqual(edge("A", "B"));
      expect(graph.directed).toBe(false);
      expect(graph.warnings).toStrictEqual([
        "Node B hides 1 child beyond --truncate-depth 2",
      ]);
    });

    it("spends an undirected node's breadth on its children, not on the node it was reached from", () => {
      const graph = limitEdgesGraph(
        buildEdgeGraph([edge("A", "B"), edge("B", "C")], {
          directed: false,
          kind: "graph",
        }),
        { truncateBreadth: 1 },
      );

      expect(ids(graph)).toStrictEqual(["A", "B", "C"]);
      expect(graph.edges).toStrictEqual([edge("A", "B"), edge("B", "C")]);
      expect(graph.warnings).toStrictEqual([]);
    });

    it("pages an undirected graph by component, each started at its smallest node", () => {
      const graph = pageEdgesGraph(
        buildEdgeGraph([edge("B", "A"), edge("D", "C")], {
          directed: false,
          kind: "graph",
        }),
        { limit: 1, page: 2 },
      );

      expect(ids(graph)).toStrictEqual(["D", "C"]);
      expect(graph.edges).toStrictEqual([edge("D", "C")]);
      expect(graph.directed).toBe(false);
    });
  });
});
