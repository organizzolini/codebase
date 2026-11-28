import { describe, expect, it } from "vitest";

import { renderGraphFileTree } from "./render-mermaid-file-tree.utilities";

import type { GraphEdge, GraphModel, GraphNode } from "./render-mermaid.types";

/** A model with `nodes` and `edges`. */
function graph(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[] = [],
  warnings: readonly string[] = [],
): GraphModel {
  return { directed: true, edges, nodes, warnings };
}

/** Plain nodes `a`, `b` and so on, labelled in capitals. */
function letters(...ids: string[]): GraphNode[] {
  return ids.map((id) => ({ id, label: id.toUpperCase() }));
}

describe(renderGraphFileTree, () => {
  it("nests children under their parent with guides, one line per node", () => {
    const { diagram, language } = renderGraphFileTree(
      graph(letters("a", "b", "c", "d"), [
        { source: "a", target: "b" },
        { source: "a", target: "c" },
        { source: "b", target: "d" },
      ]),
    );

    expect(diagram).toBe(["A", "├── B", "│   └── D", "└── C"].join("\n"));
    expect(language).toBe("text");
  });

  it("draws every root at the top level, in model order", () => {
    const { diagram } = renderGraphFileTree(
      graph(letters("a", "b", "c"), [{ source: "b", target: "c" }]),
    );

    expect(diagram).toBe(["A", "B", "└── C"].join("\n"));
  });

  it("flattens line breaks and keeps quotes as they are", () => {
    const { diagram } = renderGraphFileTree(
      graph([{ id: "a", label: 'Say "hi"\nthere' }]),
    );

    expect(diagram).toBe('Say "hi" there');
  });

  it("draws the icon in brackets and the note after a dash", () => {
    const { diagram } = renderGraphFileTree(
      graph([
        { icon: "moon", id: "a", label: "Moon", note: "Earth's satellite" },
        { icon: "", id: "b", label: "Sun", note: "" },
        { id: "c", label: "Mars", note: "Red" },
      ]),
    );

    expect(diagram).toBe(
      ["Moon [moon] — Earth's satellite", "Sun", "Mars — Red"].join("\n"),
    );
  });

  it("lists a node with several parents once, under the first, marked also under the rest", () => {
    const { diagram } = renderGraphFileTree(
      graph(letters("a", "b", "c", "d"), [
        { source: "a", target: "c" },
        { source: "b", target: "c" },
        { source: "c", target: "d" },
        { source: "a", target: "c" },
      ]),
    );

    expect(diagram).toBe(
      ["A", "└── C (also under B)", "    └── D", "B"].join("\n"),
    );
  });

  it("gives a node reached under an earlier sibling's subtree its place there", () => {
    const { diagram } = renderGraphFileTree(
      graph(letters("a", "b", "c"), [
        { source: "a", target: "b" },
        { source: "a", target: "c" },
        { source: "b", target: "c" },
      ]),
    );

    expect(diagram).toBe(["A", "└── B", "    └── C (also under A)"].join("\n"));
  });

  it("lists nodes of a cycle no root reaches as roots, ending the walk at a node already drawn", () => {
    const { diagram } = renderGraphFileTree(
      graph(letters("a", "b"), [
        { source: "a", target: "b" },
        { source: "b", target: "a" },
      ]),
    );

    expect(diagram).toBe(["A (also under B)", "└── B"].join("\n"));
  });

  it("draws a truncation node by its label, as a leaf", () => {
    const { diagram } = renderGraphFileTree(
      graph(
        [
          { id: "a", label: "A", marker: "root" },
          { id: "more", label: "… 3 more", marker: "truncation" },
        ],
        [{ source: "a", target: "more" }],
      ),
    );

    expect(diagram).toBe(["A", "└── … 3 more"].join("\n"));
  });

  it("carries the model's warnings and draws an empty model as nothing", () => {
    const { diagram, warnings } = renderGraphFileTree(
      graph([], [], ["Input was truncated"]),
    );

    expect(diagram).toBe("");
    expect(warnings).toStrictEqual(["Input was truncated"]);
  });

  it("splits into one section per neighborhood group when asked, titled by its first root", () => {
    const { diagram, sections } = renderGraphFileTree(
      graph(letters("a", "b", "c", "d"), [
        { source: "a", target: "b" },
        { source: "c", target: "d" },
      ]),
      { sections: true },
    );

    expect(diagram).toBe(["A", "└── B", "C", "└── D"].join("\n"));
    expect(sections).toStrictEqual([{ diagram, titles: ["A", "C"] }]);
  });

  it("rejects a duplicate node id and an edge naming no node", () => {
    expect(() => renderGraphFileTree(graph(letters("a", "a")))).toThrow(
      'Duplicate node id "a"',
    );
    expect(() =>
      renderGraphFileTree(
        graph(letters("a"), [{ source: "a", target: "gone" }]),
      ),
    ).toThrow('Edge target "gone" is not a node');
    expect(() =>
      renderGraphFileTree(
        graph(letters("a"), [{ source: "gone", target: "a" }]),
      ),
    ).toThrow('Edge source "gone" is not a node');
  });
});
