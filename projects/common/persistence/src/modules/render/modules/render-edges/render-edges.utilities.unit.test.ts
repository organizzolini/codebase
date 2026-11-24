import { describe, expect, it } from "vitest";

import { findEdgesCycles } from "./render-edges-cycles.utilities";
import {
  buildEdgeGraph,
  childrenOf,
  edgeKey,
  linksOf,
  reachableFrom,
} from "./render-edges.utilities";

import type { GraphEdgeMetadata } from "../render-entities/render-entities.types";
import type { GraphEdgesEdge } from "./render-edges.types";

/** An edge between two named nodes, without a label or weight. */
const edge = (source: string, target: string): GraphEdgesEdge => ({
  source,
  target,
});

/** The shape of a `@DirectedAcyclicGraph` entity's edges. */
const DIRECTED_ACYCLIC_GRAPH: Pick<GraphEdgeMetadata, "directed" | "kind"> = {
  directed: true,
  kind: "directed-acyclic-graph",
};

/** The shape of a directed `@Graph` entity's edges. */
const DIRECTED_GRAPH: Pick<GraphEdgeMetadata, "directed" | "kind"> = {
  directed: true,
  kind: "graph",
};

/** The shape of an undirected `@Graph` entity's edges. */
const UNDIRECTED_GRAPH: Pick<GraphEdgeMetadata, "directed" | "kind"> = {
  directed: false,
  kind: "graph",
};

/** The four edges of a diamond. */
const DIAMOND = [
  edge("A", "B"),
  edge("A", "C"),
  edge("B", "D"),
  edge("C", "D"),
];

describe("graph edges utilities", () => {
  describe(findEdgesCycles, () => {
    it("finds no cycle in a diamond", () => {
      expect(findEdgesCycles(DIAMOND)).toStrictEqual([]);
    });

    it("finds a self-loop as a one-node cycle", () => {
      expect(findEdgesCycles([edge("A", "A"), edge("A", "B")])).toStrictEqual([
        ["A"],
      ]);
    });

    it("names every node of a cycle, sorted", () => {
      const cycles = findEdgesCycles([
        edge("C", "A"),
        edge("A", "B"),
        edge("B", "C"),
        edge("C", "D"),
      ]);

      expect(cycles).toStrictEqual([["A", "B", "C"]]);
    });

    it("finds each separate cycle once, ordered by its first node", () => {
      const cycles = findEdgesCycles([
        edge("X", "Y"),
        edge("Y", "X"),
        edge("A", "B"),
        edge("B", "A"),
        edge("B", "X"),
      ]);

      expect(cycles).toStrictEqual([
        ["A", "B"],
        ["X", "Y"],
      ]);
    });

    it("handles a long chain without recursing", () => {
      const chain = Array.from({ length: 20_000 }, (_value, index) =>
        edge(String(index), String(index + 1)),
      );

      expect(findEdgesCycles(chain)).toStrictEqual([]);
    });
  });

  describe(buildEdgeGraph, () => {
    it("draws a diamond with its one root marked, nodes in first-seen order", () => {
      expect(buildEdgeGraph(DIAMOND, DIRECTED_ACYCLIC_GRAPH)).toStrictEqual({
        directed: true,
        edges: DIAMOND,
        nodes: [
          { id: "A", label: "A", marker: "root" },
          { id: "B", label: "B" },
          { id: "C", label: "C" },
          { id: "D", label: "D" },
        ],
        warnings: [],
      });
    });

    it("carries an edge's label and weight onto the model", () => {
      const graph = buildEdgeGraph(
        [{ label: "needs", source: "A", target: "B", weight: 2.5 }],
        DIRECTED_ACYCLIC_GRAPH,
      );

      expect(graph.edges).toStrictEqual([
        { label: "needs", source: "A", target: "B", weight: 2.5 },
      ]);
    });

    it("warns once per cycle, naming its nodes", () => {
      const graph = buildEdgeGraph(
        [edge("R", "A"), edge("A", "B"), edge("B", "A")],
        DIRECTED_ACYCLIC_GRAPH,
      );

      expect(graph.warnings).toStrictEqual([
        "Cycle among nodes A, B: a @DirectedAcyclicGraph must have no cycle",
      ]);
      expect(
        graph.nodes.filter(({ marker }) => marker === "root"),
      ).toStrictEqual([{ id: "R", label: "R", marker: "root" }]);
    });

    it("warns about a self-loop, and still roots its node when nothing else points at it", () => {
      const graph = buildEdgeGraph([edge("A", "A")], DIRECTED_ACYCLIC_GRAPH);

      expect(graph.warnings).toStrictEqual([
        "Node A has an edge to itself: a @DirectedAcyclicGraph must have no cycle",
      ]);
      expect(graph.nodes).toStrictEqual([
        { id: "A", label: "A", marker: "root" },
      ]);
    });

    it("does not count a self-loop as an incoming edge, so its node stays a root", () => {
      const graph = buildEdgeGraph(
        [edge("R", "R"), edge("R", "X")],
        DIRECTED_ACYCLIC_GRAPH,
      );

      expect(graph.nodes).toStrictEqual([
        { id: "R", label: "R", marker: "root" },
        { id: "X", label: "X" },
      ]);
    });

    it("still draws a @DirectedAcyclicGraph component with no root, without a start node", () => {
      const graph = buildEdgeGraph(
        [edge("A", "B"), edge("B", "A")],
        DIRECTED_ACYCLIC_GRAPH,
      );

      expect(graph.nodes).toStrictEqual([
        { id: "A", label: "A" },
        { id: "B", label: "B" },
      ]);
      expect(graph.edges).toHaveLength(2);
    });

    it("draws no nodes for no edges", () => {
      expect(buildEdgeGraph([], DIRECTED_ACYCLIC_GRAPH)).toStrictEqual({
        directed: true,
        edges: [],
        nodes: [],
        warnings: [],
      });
    });

    it("warns about no cycle of a @Graph, though it draws the cycle", () => {
      const graph = buildEdgeGraph(
        [edge("A", "A"), edge("A", "B"), edge("B", "A")],
        DIRECTED_GRAPH,
      );

      expect(graph.warnings).toStrictEqual([]);
      expect(graph.edges).toHaveLength(3);
    });
  });

  describe("self-loops and undirected rows", () => {
    it("does not count a @Graph self-loop as an incoming edge, so the node it reaches is no root", () => {
      const graph = buildEdgeGraph(
        [edge("Z", "Z"), edge("Z", "A")],
        DIRECTED_GRAPH,
      );

      expect(graph.nodes).toStrictEqual([
        { id: "Z", label: "Z", marker: "root" },
        { id: "A", label: "A" },
      ]);
    });

    it("draws an undirected link once, from its first row in sort order", () => {
      const graph = buildEdgeGraph(
        [
          { label: "first", source: "A", target: "B" },
          { label: "second", source: "B", target: "A" },
        ],
        UNDIRECTED_GRAPH,
      );

      expect(graph.edges).toStrictEqual([
        { label: "first", source: "A", target: "B" },
      ]);
    });
  });

  describe(linksOf, () => {
    it("links a directed edge from its source only", () => {
      const links = linksOf([edge("A", "B")], true);

      expect(links.directed).toBe(true);
      expect(childrenOf(links, "A")).toStrictEqual(["B"]);
      expect(childrenOf(links, "B")).toStrictEqual([]);
    });

    it("links an undirected edge both ways, and a self-loop to nothing", () => {
      const links = linksOf([edge("A", "B"), edge("A", "A")], false);

      expect(childrenOf(links, "A")).toStrictEqual(["B"]);
      expect(childrenOf(links, "B")).toStrictEqual(["A"]);
    });
  });

  describe(edgeKey, () => {
    it("names a directed edge by its ends in order", () => {
      expect(edgeKey(true, "A", "B")).not.toBe(edgeKey(true, "B", "A"));
    });

    it("names an undirected edge the same from either end", () => {
      expect(edgeKey(false, "A", "B")).toBe(edgeKey(false, "B", "A"));
    });
  });

  describe(reachableFrom, () => {
    it("reaches each node once, the roots included, and nothing behind them", () => {
      const links = linksOf(
        [edge("A", "B"), edge("B", "A"), edge("C", "A")],
        true,
      );

      expect([...reachableFrom(["A"], links)].toSorted()).toStrictEqual([
        "A",
        "B",
      ]);
    });

    it("reaches a hub's 200,000 children without overflowing the call stack", () => {
      const links = linksOf(
        Array.from({ length: 200_000 }, (_, index) =>
          edge("hub", `c${String(index)}`),
        ),
        true,
      );

      expect(reachableFrom(["hub"], links).size).toBe(200_001);
    });

    it("draws a directed @Graph cycle with no warning, rooting the smallest node of a component with no root", () => {
      const graph = buildEdgeGraph(
        [edge("X", "Y"), edge("Y", "X")],
        DIRECTED_GRAPH,
      );

      expect(graph.warnings).toStrictEqual([]);
      expect(graph.nodes).toStrictEqual([
        { id: "X", label: "X", marker: "root" },
        { id: "Y", label: "Y" },
      ]);
    });

    it("roots a directed @Graph at its unpointed-at nodes, then reaches every node from one", () => {
      const graph = buildEdgeGraph(
        [edge("R", "A"), edge("B", "C"), edge("C", "B"), edge("B", "A")],
        DIRECTED_GRAPH,
      );

      expect(graph.nodes).toStrictEqual([
        { id: "R", label: "R", marker: "root" },
        { id: "A", label: "A" },
        { id: "B", label: "B", marker: "root" },
        { id: "C", label: "C" },
      ]);
    });

    it("keeps an undirected @Graph undirected and roots each component at its smallest node", () => {
      const graph = buildEdgeGraph(
        [edge("B", "A"), edge("C", "D"), edge("D", "E")],
        UNDIRECTED_GRAPH,
      );

      expect(graph.directed).toBe(false);
      expect(graph.warnings).toStrictEqual([]);
      expect(graph.nodes).toStrictEqual([
        { id: "B", label: "B" },
        { id: "A", label: "A", marker: "root" },
        { id: "C", label: "C", marker: "root" },
        { id: "D", label: "D" },
        { id: "E", label: "E" },
      ]);
    });
  });
});
