import { describe, expect, it } from "vitest";

import { findDagCycles } from "./graph-dag-cycles.utilities";
import { buildDagGraph } from "./graph-dag.utilities";

import type { GraphDagEdge } from "./graph-dag.types";

/** An edge between two named nodes, without a label or weight. */
const edge = (source: string, target: string): GraphDagEdge => ({
  source,
  target,
});

/** The four edges of a diamond. */
const DIAMOND = [
  edge("A", "B"),
  edge("A", "C"),
  edge("B", "D"),
  edge("C", "D"),
];

describe("graph dag utilities", () => {
  describe(findDagCycles, () => {
    it("finds no cycle in a diamond", () => {
      expect(findDagCycles(DIAMOND)).toStrictEqual([]);
    });

    it("finds a self-loop as a one-node cycle", () => {
      expect(findDagCycles([edge("A", "A"), edge("A", "B")])).toStrictEqual([
        ["A"],
      ]);
    });

    it("names every node of a cycle, sorted", () => {
      const cycles = findDagCycles([
        edge("C", "A"),
        edge("A", "B"),
        edge("B", "C"),
        edge("C", "D"),
      ]);

      expect(cycles).toStrictEqual([["A", "B", "C"]]);
    });

    it("finds each separate cycle once, ordered by its first node", () => {
      const cycles = findDagCycles([
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

      expect(findDagCycles(chain)).toStrictEqual([]);
    });
  });

  describe(buildDagGraph, () => {
    it("draws a diamond with its one root marked, nodes in first-seen order", () => {
      expect(buildDagGraph(DIAMOND)).toStrictEqual({
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
      const graph = buildDagGraph([
        { label: "needs", source: "A", target: "B", weight: 2.5 },
      ]);

      expect(graph.edges).toStrictEqual([
        { label: "needs", source: "A", target: "B", weight: 2.5 },
      ]);
    });

    it("warns once per cycle, naming its nodes", () => {
      const graph = buildDagGraph([
        edge("R", "A"),
        edge("A", "B"),
        edge("B", "A"),
      ]);

      expect(graph.warnings).toStrictEqual([
        "Cycle among nodes A, B: a @Dag must have no cycle",
      ]);
      expect(
        graph.nodes.filter(({ marker }) => marker === "root"),
      ).toStrictEqual([{ id: "R", label: "R", marker: "root" }]);
    });

    it("warns about a self-loop, which leaves its node without a root", () => {
      const graph = buildDagGraph([edge("A", "A")]);

      expect(graph.warnings).toStrictEqual([
        "Node A has an edge to itself: a @Dag must have no cycle",
      ]);
      expect(graph.nodes).toStrictEqual([{ id: "A", label: "A" }]);
    });

    it("still draws a component with no root", () => {
      const graph = buildDagGraph([edge("A", "B"), edge("B", "A")]);

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(2);
    });

    it("draws no nodes for no edges", () => {
      expect(buildDagGraph([])).toStrictEqual({
        directed: true,
        edges: [],
        nodes: [],
        warnings: [],
      });
    });
  });
});
