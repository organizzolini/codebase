import { describe, expect, it } from "vitest";

import {
  renderGraphMarkdown,
  renderGraphMermaid,
} from "./graph-mermaid.utilities";

import type { GraphEdge, GraphModel, GraphNode } from "./graph-mermaid.types";

const CLASS_DEFINITIONS = [
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
];

/** A model with `nodes` and `edges`, directed unless told otherwise. */
function graph(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[] = [],
  overrides: Partial<GraphModel> = {},
): GraphModel {
  return { directed: true, edges, nodes, warnings: [], ...overrides };
}

/** A hub node `hub` with `count` edges to leaves. */
function hubAndLeaves(count: number): GraphModel {
  const leaves = Array.from({ length: count }, (_, index) => ({
    id: `leaf-${index}`,
    label: `Leaf ${index}`,
  }));
  const edges = leaves.map((leaf) => ({ source: "hub", target: leaf.id }));
  return graph([{ id: "hub", label: "Hub" }, ...leaves], edges);
}

describe(renderGraphMermaid, () => {
  it("draws a directed tree left to right with short ids and a root class", () => {
    const { diagram, warnings } = renderGraphMermaid(
      graph(
        [
          { id: "root", label: "Root", marker: "root" },
          { id: "a", label: "Child A" },
          { id: "b", label: "Child B" },
        ],
        [
          { source: "root", target: "a" },
          { source: "root", target: "b" },
        ],
      ),
    );

    expect(diagram).toBe(
      [
        "flowchart LR",
        ...CLASS_DEFINITIONS,
        '    n0["Root"]',
        '    n1["Child A"]',
        '    n2["Child B"]',
        "    n0 --> n1",
        "    n0 --> n2",
        "    class n0 root",
      ].join("\n"),
    );
    expect(warnings).toStrictEqual([]);
  });

  it("draws a shared target and a cyclic graph with both directions", () => {
    const shared = renderGraphMermaid(
      graph(
        [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
        ],
        [
          { source: "a", target: "c" },
          { source: "b", target: "c" },
        ],
      ),
    ).diagram;
    const cycle = renderGraphMermaid(
      graph(
        [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        [
          { source: "a", target: "b" },
          { source: "b", target: "a" },
        ],
      ),
    ).diagram;

    expect(shared).toContain("    n0 --> n2\n    n1 --> n2");
    expect(cycle).toContain("    n0 --> n1\n    n1 --> n0");
  });

  it("draws undirected edges with no arrowhead and no direction", () => {
    const { diagram } = renderGraphMermaid(
      graph(
        [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        [{ label: "x", source: "a", target: "b", weight: 2 }],
        { directed: false },
      ),
    );

    expect(diagram).toContain('    n0 ---|"x (2)"| n1');
    expect(diagram).not.toContain("-->");
  });

  it("shows a weight alone when an edge has no label", () => {
    const { diagram } = renderGraphMermaid(
      graph(
        [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        [{ source: "a", target: "b", weight: 3 }],
      ),
    );

    expect(diagram).toContain('    n0 -->|"3"| n1');
  });

  it("declares a node that no edge touches", () => {
    const { diagram } = renderGraphMermaid(
      graph([{ id: "alone", label: "Alone" }]),
    );

    expect(diagram).toContain('    n0["Alone"]');
    expect(diagram).not.toContain("-->");
  });

  it("escapes quotes, hashes, angle brackets, pipes and line breaks in node labels", () => {
    const { diagram } = renderGraphMermaid(
      graph([{ id: "a", label: 'Say "hi" #1 <b>|x\ny' }]),
    );

    expect(diagram).toContain(
      '    n0["Say #quot;hi#quot; #35;1 #lt;b#gt;#124;x y"]',
    );
  });

  it("escapes edge labels the same way", () => {
    const { diagram } = renderGraphMermaid(
      graph(
        [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
        [{ label: 'a|"b"', source: "a", target: "b" }],
      ),
    );

    expect(diagram).toContain('    n0 -->|"a#124;#quot;b#quot;"| n1');
  });

  it("draws truncation nodes with the truncation class", () => {
    const { diagram } = renderGraphMermaid(
      graph(
        [
          { id: "a", label: "A", marker: "root" },
          { id: "more", label: "… 3 more", marker: "truncation" },
        ],
        [{ source: "a", target: "more" }],
      ),
    );

    expect(diagram).toContain('    n1["… 3 more"]');
    expect(diagram.endsWith("    class n0 root\n    class n1 truncation")).toBe(
      true,
    );
  });

  it("starts with LR by default and accepts another direction", () => {
    const model = graph([{ id: "a", label: "A" }]);

    expect(renderGraphMermaid(model).diagram.startsWith("flowchart LR\n")).toBe(
      true,
    );
    expect(
      renderGraphMermaid(model, { direction: "TB" }).diagram.startsWith(
        "flowchart TB\n",
      ),
    ).toBe(true);
  });

  it("carries the model's own warnings ahead of limit warnings", () => {
    const { warnings } = renderGraphMermaid(
      graph([{ id: "a", label: "A" }], [], {
        warnings: ["Input was truncated at 100 nodes"],
      }),
    );

    expect(warnings).toStrictEqual(["Input was truncated at 100 nodes"]);
  });

  it("warns once 450 edges are reached, not before", () => {
    expect(renderGraphMermaid(hubAndLeaves(449)).warnings).toStrictEqual([]);
    expect(renderGraphMermaid(hubAndLeaves(450)).warnings).toStrictEqual([
      "Diagram has 450 edges, nearing Mermaid's 500-edge limit",
    ]);
  });

  it("warns that the diagram is over the 500-edge limit past 500 edges", () => {
    expect(renderGraphMermaid(hubAndLeaves(501)).warnings).toStrictEqual([
      "Diagram has 501 edges, over Mermaid's 500-edge limit",
    ]);
  });

  it("warns when the diagram text nears the 50,000-character limit", () => {
    const short = renderGraphMermaid(
      graph([{ id: "a", label: "x".repeat(1_000) }]),
    );
    const near = renderGraphMermaid(
      graph([{ id: "a", label: "x".repeat(46_000) }]),
    );
    const over = renderGraphMermaid(
      graph([{ id: "a", label: "x".repeat(51_000) }]),
    );

    expect(short.warnings).toStrictEqual([]);
    expect(near.warnings).toStrictEqual([
      expect.stringContaining("nearing Mermaid's 50000-character limit"),
    ]);
    expect(over.warnings).toStrictEqual([
      expect.stringContaining("over Mermaid's 50000-character limit"),
    ]);
  });

  it("rejects an edge whose endpoint is not a node", () => {
    expect(() =>
      renderGraphMermaid(
        graph([{ id: "a", label: "A" }], [{ source: "a", target: "missing" }]),
      ),
    ).toThrow('Edge target "missing" is not a node');
  });

  it("rejects two nodes sharing an id", () => {
    expect(() =>
      renderGraphMermaid(
        graph([
          { id: "a", label: "A" },
          { id: "a", label: "B" },
        ]),
      ),
    ).toThrow('Duplicate node id "a"');
  });

  describe("neighborhoods", () => {
    it("leaves a single neighborhood without a subgraph, even with a shared label", () => {
      const { diagram } = renderGraphMermaid(
        graph(
          [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          [{ label: "x", source: "a", target: "b" }],
        ),
      );

      expect(diagram).not.toContain("subgraph");
      expect(diagram).toContain('    n0 -->|"x"| n1');
    });

    it("wraps each of two or more neighborhoods in a numbered subgraph, keeping classes after them", () => {
      const { diagram } = renderGraphMermaid(
        graph(
          [
            { id: "r1", label: "Root 1", marker: "root" },
            { id: "r2", label: "Root 2", marker: "root" },
            { id: "c1", label: "Child 1" },
            { id: "c2", label: "Child 2" },
          ],
          [
            { source: "r1", target: "c1" },
            { source: "r2", target: "c2" },
          ],
        ),
      );

      expect(diagram).toBe(
        [
          "flowchart LR",
          ...CLASS_DEFINITIONS,
          '    subgraph nb0["Root 1"]',
          '        n0["Root 1"]',
          '        n2["Child 1"]',
          "        n0 --> n2",
          "    end",
          '    subgraph nb1["Root 2"]',
          '        n1["Root 2"]',
          '        n3["Child 2"]',
          "        n1 --> n3",
          "    end",
          "    class n0 root",
          "    class n1 root",
        ].join("\n"),
      );
    });

    it("titles a neighborhood with the label all its edges share and draws those edges bare", () => {
      const { diagram } = renderGraphMermaid(
        graph(
          [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
            { id: "c", label: "C" },
            { id: "d", label: "D" },
          ],
          [
            { label: "UMa", source: "a", target: "b", weight: 2 },
            { label: "UMa", source: "b", target: "c" },
            { label: "Ori", source: "d", target: "d" },
          ],
          { directed: false },
        ),
      );

      expect(diagram).toContain('subgraph nb0["UMa"]');
      expect(diagram).toContain('        n0 ---|"2"| n1');
      expect(diagram).toContain("        n1 --- n2");
      expect(diagram).toContain('subgraph nb1["Ori"]');
      expect(diagram).not.toContain('"UMa"|');
    });

    it("titles mixed labels with the first root, else the first node, and keeps the edge labels", () => {
      const { diagram } = renderGraphMermaid(
        graph(
          [
            { id: "a", label: "A" },
            { id: "b", label: "B", marker: "root" },
            { id: "c", label: "C" },
            { id: "d", label: "D" },
          ],
          [
            { label: "x", source: "a", target: "b" },
            { label: "y", source: "b", target: "a" },
            { source: "c", target: "d" },
          ],
        ),
      );

      expect(diagram).toContain('subgraph nb0["B"]');
      expect(diagram).toContain('subgraph nb1["C"]');
      expect(diagram).toContain('        n0 -->|"x"| n1');
      expect(diagram).toContain('        n1 -->|"y"| n0');
    });

    it("keeps a truncation node inside its parent's neighborhood", () => {
      const { diagram } = renderGraphMermaid(
        graph(
          [
            { id: "a", label: "A", marker: "root" },
            { id: "more", label: "… 3 more", marker: "truncation" },
            { id: "b", label: "B", marker: "root" },
          ],
          [{ source: "a", target: "more" }],
        ),
      );

      expect(diagram).toContain(
        '    subgraph nb0["A"]\n        n0["A"]\n        n1["… 3 more"]\n        n0 --> n1\n    end\n    subgraph nb1["B"]\n        n2["B"]\n    end',
      );
      expect(
        diagram.endsWith(
          "    end\n    class n0 root\n    class n1 truncation\n    class n2 root",
        ),
      ).toBe(true);
    });

    it("treats edges as undirected when grouping and draws an isolated node as its own neighborhood", () => {
      const { diagram } = renderGraphMermaid(
        graph(
          [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
            { id: "c", label: "C" },
            { id: "alone", label: "Alone", marker: "root" },
          ],
          [
            { source: "a", target: "b" },
            { source: "c", target: "b" },
          ],
        ),
      );

      expect(diagram).toContain(
        '    subgraph nb0["A"]\n        n0["A"]\n        n1["B"]\n        n2["C"]\n        n0 --> n1\n        n2 --> n1\n    end',
      );
      expect(diagram).toContain(
        '    subgraph nb1["Alone"]\n        n3["Alone"]\n    end',
      );
    });

    it("escapes a title like a label and keeps backticks for the fence to handle", () => {
      const { diagram } = renderGraphMermaid(
        graph([
          { id: "a", label: 'Say "hi" #1' },
          { id: "b", label: "run ``` here" },
        ]),
      );

      expect(diagram).toContain('subgraph nb0["Say #quot;hi#quot; #35;1"]');
      expect(diagram).toContain('subgraph nb1["run ``` here"]');
      expect(renderGraphMarkdown({ diagram, warnings: [] })).toMatch(
        /^````mermaid\n/,
      );
    });

    it("counts edges over the whole model for limit warnings", () => {
      const model = graph(
        [...hubAndLeaves(450).nodes, { id: "alone", label: "Alone" }],
        hubAndLeaves(450).edges,
      );

      expect(renderGraphMermaid(model).warnings).toStrictEqual([
        "Diagram has 450 edges, nearing Mermaid's 500-edge limit",
      ]);
    });
  });

  describe(renderGraphMarkdown, () => {
    it("wraps the diagram in a mermaid fence, with no warnings after it when there are none", () => {
      const rendering = renderGraphMermaid(
        graph([{ id: "a", label: "A" }], []),
      );

      expect(renderGraphMarkdown(rendering)).toBe(
        `\`\`\`mermaid\n${rendering.diagram}\n\`\`\`\n`,
      );
    });

    it("keeps warnings after the fence as blockquotes, never inside it", () => {
      const markdown = renderGraphMarkdown({
        diagram: "flowchart LR",
        warnings: ["Node 6 names parent 99", "Diagram is 9 characters"],
      });

      expect(markdown).toBe(
        "```mermaid\nflowchart LR\n```\n\n> ⚠️ Node 6 names parent 99\n> ⚠️ Diagram is 9 characters\n",
      );
    });

    it("flattens a warning's line breaks into one blockquote line", () => {
      const markdown = renderGraphMarkdown({
        diagram: "flowchart LR",
        warnings: ["first line\r\nsecond line"],
      });

      expect(markdown.split("\n").at(-2)).toBe("> ⚠️ first line second line");
    });

    it("fences a diagram whose labels hold backticks with a longer fence", () => {
      const diagram = 'flowchart LR\n    n0["run ``` here"]';

      const markdown = renderGraphMarkdown({ diagram, warnings: [] });

      expect(markdown).toBe(`\`\`\`\`mermaid\n${diagram}\n\`\`\`\`\n`);
      expect(markdown.split("\n")).not.toContain("```");
    });

    it("fences a diagram with a longer backtick run one backtick longer than that run", () => {
      const diagram = 'flowchart LR\n    n0["````"]';

      const markdown = renderGraphMarkdown({ diagram, warnings: [] });

      expect(markdown.startsWith("`````mermaid\n")).toBe(true);
      expect(markdown.endsWith("\n`````\n")).toBe(true);
    });
  });
});
