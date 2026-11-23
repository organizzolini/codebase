import { describe, expect, it } from "vitest";

import { edgeLabels, nodeIds, relabelGraph } from "./render-nodes.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";

/** One network's two lines, and a truncation node. */
const GRAPH: GraphModel = {
  directed: false,
  edges: [
    { label: "N1", source: "1", target: "2" },
    { label: "N1", source: "2", target: "3" },
    { source: "3", target: "…" },
  ],
  nodes: [
    { id: "1", label: "1", marker: "root" },
    { id: "2", label: "2" },
    { id: "3", label: "3" },
    { id: "…", label: "… 4 more", marker: "truncation" },
  ],
  warnings: ["kept"],
};

describe("render nodes utilities", () => {
  describe("reading what a graph is relabelled from", () => {
    it("lists each distinct edge label once, and each node but a truncation node", () => {
      expect(edgeLabels(GRAPH)).toStrictEqual(["N1"]);
      expect(nodeIds(GRAPH)).toStrictEqual(["1", "2", "3"]);
    });

    it("reads nothing from a graph with no labelled edge and no node", () => {
      const empty: GraphModel = {
        directed: true,
        edges: [{ source: "a", target: "b" }],
        nodes: [],
        warnings: [],
      };

      expect(edgeLabels(empty)).toStrictEqual([]);
      expect(nodeIds(empty)).toStrictEqual([]);
    });
  });

  describe(relabelGraph, () => {
    it("gives each node its label and each edge the title of its graph", () => {
      const relabelled = relabelGraph(GRAPH, {
        nodes: new Map([
          ["1", "Alpha"],
          ["3", "Gamma"],
        ]),
        titles: new Map([["N1", "North line"]]),
      });

      expect(relabelled.nodes.map(({ label }) => label)).toStrictEqual([
        "Alpha",
        "2",
        "Gamma",
        "… 4 more",
      ]);
      expect(relabelled.edges.map(({ label }) => label)).toStrictEqual([
        "North line",
        "North line",
        undefined,
      ]);
    });

    it("keeps markers, ids, direction, and warnings, and never relabels a truncation node", () => {
      const relabelled = relabelGraph(GRAPH, {
        nodes: new Map([["…", "Not a row"]]),
        titles: new Map(),
      });

      expect(relabelled).toStrictEqual(GRAPH);
    });

    it("keeps the label of an edge whose graph has no title", () => {
      const relabelled = relabelGraph(GRAPH, {
        nodes: new Map(),
        titles: new Map([["other", "Elsewhere"]]),
      });

      expect(relabelled.edges.map(({ label }) => label)).toStrictEqual([
        "N1",
        "N1",
        undefined,
      ]);
    });
  });
});
