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

describe(renderGraphFileTree, () => {
  it("nests children under their parent, marking each node with children as a directory", () => {
    const { diagram, warnings } = renderGraphFileTree(
      graph(
        [
          { id: "work", label: "Work", marker: "root" },
          { id: "email", label: "Email" },
          { id: "inbox", label: "Inbox" },
          { id: "meetings", label: "Meetings" },
        ],
        [
          { label: "child", source: "work", target: "email", weight: 2 },
          { source: "email", target: "inbox" },
          { source: "work", target: "meetings" },
        ],
      ),
    );

    expect(diagram).toBe(
      [
        "treeView-beta",
        '    "Work/"',
        '        "Email/"',
        '            "Inbox"',
        '        "Meetings"',
      ].join("\n"),
    );
    expect(warnings).toStrictEqual([]);
  });

  it("draws every root at the top level, in model order", () => {
    const { diagram } = renderGraphFileTree(
      graph(
        [
          { id: "b", label: "Errands" },
          { id: "a", label: "Work" },
          { id: "c", label: "Child" },
        ],
        [{ source: "a", target: "c" }],
      ),
    );

    expect(diagram).toBe(
      ["treeView-beta", '    "Errands"', '    "Work/"', '        "Child"'].join(
        "\n",
      ),
    );
  });

  it("quotes labels with spaces and slashes, and flattens line breaks", () => {
    const { diagram } = renderGraphFileTree(
      graph([
        { id: "a", label: "two words" },
        { id: "b", label: "a/b" },
        { id: "c", label: "line\nbreak" },
      ]),
    );

    expect(diagram).toBe(
      [
        "treeView-beta",
        '    "two words"',
        '    "a/b"',
        '    "line break"',
      ].join("\n"),
    );
  });

  it("wraps a label holding a double quote in single quotes, turning its apostrophes into ’", () => {
    const { diagram } = renderGraphFileTree(
      graph(
        [
          { id: "a", label: 'say "hi", it\'s' },
          { id: "b", label: 'the "b"' },
        ],
        [{ source: "a", target: "b" }],
      ),
    );

    expect(diagram).toBe(
      ["treeView-beta", "    'say \"hi\", it’s/'", "        'the \"b\"'"].join(
        "\n",
      ),
    );
  });

  it("draws a truncation node by its label, as a leaf", () => {
    const { diagram } = renderGraphFileTree(
      graph(
        [
          { id: "a", label: "A" },
          { id: "a/more", label: "… 7 more", marker: "truncation" },
        ],
        [{ source: "a", target: "a/more" }],
      ),
    );

    expect(diagram).toBe(
      ["treeView-beta", '    "A/"', '        "… 7 more"'].join("\n"),
    );
  });

  it("carries the model's warnings, and warns near the character limit only", () => {
    const wide = Array.from({ length: 3000 }, (_, index) => ({
      id: `n${index}`,
      label: `Node number ${index}`,
    }));
    const edges = wide
      .slice(1)
      .map((node) => ({ source: "n0", target: node.id }));

    const { warnings } = renderGraphFileTree(graph(wide, edges, ["noted"]));

    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toBe("noted");
    expect(warnings[1]).toMatch(/Diagram is \d+ characters, over Mermaid's/u);
  });

  it("draws an empty model as the header alone", () => {
    expect(renderGraphFileTree(graph([])).diagram).toBe("treeView-beta");
  });

  it("rejects a duplicate node id and an edge naming no node", () => {
    expect(() =>
      renderGraphFileTree(
        graph([
          { id: "a", label: "A" },
          { id: "a", label: "B" },
        ]),
      ),
    ).toThrow('Duplicate node id "a"');
    expect(() =>
      renderGraphFileTree(
        graph([{ id: "a", label: "A" }], [{ source: "a", target: "z" }]),
      ),
    ).toThrow('Edge target "z" is not a node');
  });

  it("lists a node with two parents under each, with what is beneath it", () => {
    const node = (id: string): GraphNode => ({ id, label: id });
    const { diagram } = renderGraphFileTree({
      directed: true,
      edges: [
        { source: "a", target: "c" },
        { source: "b", target: "c" },
        { source: "c", target: "d" },
      ],
      nodes: [node("a"), node("b"), node("c"), node("d")],
      warnings: [],
    });

    expect(diagram.split("\n")).toStrictEqual([
      "treeView-beta",
      '    "a/"',
      '        "c/"',
      '            "d"',
      '    "b/"',
      '        "c/"',
      '            "d"',
    ]);
  });

  it("ends a walk that meets a node it is inside of", () => {
    const node = (id: string): GraphNode => ({ id, label: id });
    const { diagram } = renderGraphFileTree({
      directed: true,
      edges: [
        { source: "r", target: "a" },
        { source: "a", target: "b" },
        { source: "b", target: "a" },
      ],
      nodes: [node("r"), node("a"), node("b")],
      warnings: [],
    });

    expect(diagram.split("\n")).toStrictEqual([
      "treeView-beta",
      '    "r/"',
      '        "a/"',
      '            "b/"',
    ]);
  });

  describe("a node's icon and note in a file tree", () => {
    it("draws the icon in brackets and the note after a dash, after a directory's slash", () => {
      const { diagram } = renderGraphFileTree(
        graph(
          [
            {
              icon: "sun",
              id: "solar",
              label: "Solar",
              note: "The Sun's year",
            },
            { id: "season", label: "Season" },
          ],
          [{ source: "solar", target: "season" }],
        ),
      );

      expect(diagram).toBe(
        [
          "treeView-beta",
          '    "Solar/ [sun] — The Sun\'s year"',
          '        "Season"',
        ].join("\n"),
      );
    });
  });
});
