import { describe, expect, it } from "vitest";

import { drawFlowchart } from "./render-mermaid-flowchart.utilities";
import {
  renderGraphMarkdown,
  renderGraphMermaid,
  renderGraphPagesMarkdown,
} from "./render-mermaid.utilities";

import type {
  GraphEdge,
  GraphMermaidRendering,
  GraphModel,
  GraphNode,
} from "./render-mermaid.types";

const ROOT_CLASS =
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px";
const SHARED_CLASS =
  "    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px";
const TRUNCATION_CLASS =
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5";

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

/** Plain nodes `a`, `b` and so on, labelled in capitals. */
function letters(...ids: string[]): GraphNode[] {
  return ids.map((id) => ({ id, label: id.toUpperCase() }));
}
import {
  fencedBlock,
  markdownText,
  renderSectionsMarkdown,
  sectionCount,
  slugger,
} from "./render-mermaid-sections.utilities";

/** A mermaid rendering of `sections`, each titled by `titles`. */
function sectionedRendering(
  sections: readonly (readonly string[])[],
  warnings: readonly string[] = [],
): GraphMermaidRendering {
  return {
    diagram: "flowchart LR",
    language: "mermaid",
    sections: sections.map((titles) => ({
      diagram: `flowchart LR\n    %% ${titles.join(",")}`,
      titles,
    })),
    warnings,
  };
}

describe("render-mermaid utilities", () => {
  describe(renderGraphMermaid, () => {
    describe("a flowchart", () => {
      it("declares each node once and chains an edge to every target of its source", () => {
        const { diagram, language, warnings } = renderGraphMermaid(
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
            ROOT_CLASS,
            '    n0["Root"] --> n1["Child A"] & n2["Child B"]',
            "    class n0 root",
          ].join("\n"),
        );
        expect(language).toBe("mermaid");
        expect(warnings).toStrictEqual([]);
      });

      it("classes a node with several parents as shared, naming every parent edge", () => {
        const { diagram } = renderGraphMermaid(
          graph(letters("a", "b", "c"), [
            { source: "a", target: "c" },
            { source: "b", target: "c" },
          ]),
        );

        expect(diagram).toBe(
          [
            "flowchart LR",
            SHARED_CLASS,
            '    n0["A"] --> n2["C"]',
            '    n1["B"] --> n2',
            "    class n2 shared",
          ].join("\n"),
        );
      });

      it("does not call a node shared for a repeated edge from one source", () => {
        const { diagram } = renderGraphMermaid(
          graph(letters("a", "b"), [
            { source: "a", target: "b" },
            { source: "a", target: "b" },
          ]),
        );

        expect(diagram).toBe(
          ["flowchart LR", '    n0["A"] --> n1["B"] & n1'].join("\n"),
        );
      });

      it("names a node the context does not know by its own id", () => {
        const diagram = drawFlowchart(
          [
            {
              edges: [{ source: "a", target: "b" }],
              hideLabels: false,
              nodes: letters("a", "b"),
              title: "A",
            },
          ],
          {
            directed: true,
            direction: "LR",
            nodes: new Map(),
            shared: new Set(),
          },
          0,
        );

        expect(diagram).toBe(["flowchart LR", "    a --> b"].join("\n"));
      });

      it("draws a cycle without calling either node shared", () => {
        const { diagram } = renderGraphMermaid(
          graph(letters("a", "b"), [
            { source: "a", target: "b" },
            { source: "b", target: "a" },
          ]),
        );

        expect(diagram).toBe(
          ["flowchart LR", '    n0["A"] --> n1["B"]', "    n1 --> n0"].join(
            "\n",
          ),
        );
      });

      it("keeps edges with different labels or weights on their own lines", () => {
        const { diagram } = renderGraphMermaid(
          graph(letters("a", "b", "c", "d"), [
            { label: "x", source: "a", target: "b" },
            { label: "x", source: "a", target: "c" },
            { source: "a", target: "d", weight: 3 },
          ]),
        );

        expect(diagram).toContain('    n0["A"] -->|"x"| n1["B"] & n2["C"]');
        expect(diagram).toContain('    n0 -->|"3"| n3["D"]');
      });

      it("chains undirected edges into trails with no arrowhead", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            letters("a", "b", "c", "d"),
            [
              { label: "x", source: "a", target: "b", weight: 2 },
              { source: "c", target: "b" },
              { source: "c", target: "d" },
            ],
            { directed: false },
          ),
        );

        expect(diagram).toBe(
          [
            "flowchart LR",
            '    n0["A"] ---|"x (2)"| n1["B"] --- n2["C"] --- n3["D"]',
          ].join("\n"),
        );
        expect(diagram).not.toContain("-->");
      });

      it("starts a new trail when no unused edge continues the last", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            letters("a", "b", "c", "d"),
            [
              { source: "a", target: "b" },
              { source: "c", target: "d" },
              { source: "d", target: "d" },
            ],
            { directed: false },
          ),
        );

        expect(diagram).toContain('    n0["A"] --- n1["B"]');
        expect(diagram).toContain('    n2["C"] --- n3["D"] --- n3');
      });

      it("declares a node that no edge touches", () => {
        const { diagram } = renderGraphMermaid(
          graph([{ id: "alone", label: "Alone" }]),
        );

        expect(diagram).toBe(["flowchart LR", '    n0["Alone"]'].join("\n"));
      });

      it("escapes quotes, hashes, angle brackets, pipes and line breaks in node labels", () => {
        const { diagram } = renderGraphMermaid(
          graph([{ id: "a", label: 'Say "hi" #1 <b>|x\ny' }]),
        );

        expect(diagram).toContain(
          '    n0["Say #quot;hi#quot; #35;1 #lt;b#gt;#124;x y"]',
        );
      });

      it("escapes edge labels and backticks the same way", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            [
              { id: "a", label: "`x` #96;" },
              { id: "b", label: "B" },
            ],
            [{ label: 'a|"b"`', source: "a", target: "b" }],
          ),
        );

        expect(diagram).toContain('    n0["#96;x#96; #35;96;"] -->');
        expect(diagram).toContain('|"a#124;#quot;b#quot;#96;"|');
      });

      it("styles truncation nodes with their own class", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            [
              { id: "a", label: "A", marker: "root" },
              { id: "more", label: "… 3 more", marker: "truncation" },
            ],
            [{ source: "a", target: "more" }],
          ),
        );

        expect(diagram).toBe(
          [
            "flowchart LR",
            ROOT_CLASS,
            TRUNCATION_CLASS,
            '    n0["A"] --> n1["… 3 more"]',
            "    class n0 root",
            "    class n1 truncation",
          ].join("\n"),
        );
      });

      it("draws a node's icon and note in italics beneath the label, escaped", () => {
        const { diagram } = renderGraphMermaid(
          graph([
            { icon: "moon", id: "a", label: "Moon", note: "The <Moon>" },
            { id: "b", label: "Sun", note: "Earth's star" },
          ]),
        );

        expect(diagram).toContain(
          'n0["Moon<br/><i>moon · The #lt;Moon#gt;</i>"]',
        );
        expect(diagram).toContain('n1["Sun<br/><i>Earth\'s star</i>"]');
      });

      it("starts with LR by default and accepts another direction", () => {
        const model = graph([{ id: "a", label: "A" }]);

        expect(renderGraphMermaid(model).diagram).toMatch(/^flowchart LR\n/);
        expect(renderGraphMermaid(model, { direction: "TB" }).diagram).toMatch(
          /^flowchart TB\n/,
        );
      });

      it("draws 150,000 leaves under one hub without overflowing the call stack", () => {
        const { diagram } = renderGraphMermaid(hubAndLeaves(150_000));
        const [header, line] = diagram.split("\n");

        expect(header).toBe("flowchart LR");
        expect(line).toMatch(/^ {4}n0\["Hub"\] --> n1\["Leaf 0"\] & n2/);
        expect(line?.endsWith(' & n150000["Leaf 149999"]')).toBe(true);
      });

      it("rejects an edge whose endpoint is not a node", () => {
        expect(() =>
          renderGraphMermaid(
            graph(letters("a"), [{ source: "a", target: "missing" }]),
          ),
        ).toThrow('Edge target "missing" is not a node');
        expect(() =>
          renderGraphMermaid(
            graph(letters("a"), [{ source: "missing", target: "a" }]),
          ),
        ).toThrow('Edge source "missing" is not a node');
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
    });

    describe("warnings", () => {
      it("carries the model's own warnings ahead of limit warnings", () => {
        const { warnings } = renderGraphMermaid(
          graph(letters("a"), [], { warnings: ["Input was truncated"] }),
        );

        expect(warnings).toStrictEqual(["Input was truncated"]);
      });

      it("warns once 450 edges are reached, not before", () => {
        expect(renderGraphMermaid(hubAndLeaves(449)).warnings).toStrictEqual(
          [],
        );
        expect(renderGraphMermaid(hubAndLeaves(450)).warnings).toStrictEqual([
          "Diagram has 450 edges, nearing Mermaid's 500-edge limit",
        ]);
        expect(renderGraphMermaid(hubAndLeaves(501)).warnings).toStrictEqual([
          "Diagram has 501 edges, over Mermaid's 500-edge limit",
        ]);
      });

      it("warns when the diagram text nears or passes the 50,000-character limit", () => {
        const warn = (size: number): readonly string[] =>
          renderGraphMermaid(graph([{ id: "a", label: "x".repeat(size) }]))
            .warnings;

        expect(warn(1000)).toStrictEqual([]);
        expect(warn(46_000)).toStrictEqual([
          expect.stringContaining("nearing Mermaid's 50000-character limit"),
        ]);
        expect(warn(51_000)).toStrictEqual([
          expect.stringContaining("over Mermaid's 50000-character limit"),
        ]);
      });
    });

    describe("neighborhoods", () => {
      it("draws one neighborhood without a subgraph, keeping a shared label", () => {
        const { diagram } = renderGraphMermaid(
          graph(letters("a", "b"), [{ label: "x", source: "a", target: "b" }]),
        );

        expect(diagram).not.toContain("subgraph");
        expect(diagram).toContain('    n0["A"] -->|"x"| n1["B"]');
      });

      it("wraps each of two or more in a subgraph set in a row, classes after them", () => {
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
            ROOT_CLASS,
            '    subgraph nb0["Root 1"]',
            "        direction LR",
            '        n0["Root 1"] --> n2["Child 1"]',
            "    end",
            '    subgraph nb1["Root 2"]',
            "        direction LR",
            '        n1["Root 2"] --> n3["Child 2"]',
            "    end",
            "    nb0 ~~~ nb1",
            "    class n0,n1 root",
          ].join("\n"),
        );
      });

      it("starts a new row of subgraphs after three", () => {
        const { diagram } = renderGraphMermaid(
          graph(letters("a", "b", "c", "d", "e")),
        );

        expect(diagram).toContain("    nb0 ~~~ nb1 ~~~ nb2\n    nb3 ~~~ nb4");
      });

      it("titles a neighborhood by the label all its edges share and draws them bare", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            letters("a", "b", "c", "d"),
            [
              { label: "UMa", source: "a", target: "b", weight: 2 },
              { label: "UMa", source: "b", target: "c" },
              { label: "Ori", source: "d", target: "d" },
            ],
            { directed: false },
          ),
        );

        expect(diagram).toContain('subgraph nb0["UMa"]');
        expect(diagram).toContain('n0["A"] ---|"2"| n1["B"] --- n2["C"]');
        expect(diagram).toContain('subgraph nb1["Ori"]');
        expect(diagram).not.toContain('"UMa"|');
      });

      it("titles a few distinct labels by all of them, keeping the labels on the edges", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            letters("a", "b", "c", "d"),
            [
              { label: "x", source: "a", target: "b" },
              { label: "y", source: "b", target: "c" },
              { label: "z", source: "d", target: "d" },
            ],
            { directed: false },
          ),
        );

        expect(diagram).toContain('subgraph nb0["x, y"]');
        expect(diagram).toContain('n0["A"] ---|"x"| n1["B"] ---|"y"| n2["C"]');
      });

      it("titles by the first root, else the first node, when labels are many or missing", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            [
              { id: "a", label: "A" },
              { id: "b", label: "B", marker: "root" },
              { id: "c", label: "C" },
              { id: "d", label: "D" },
              { id: "e", label: "E" },
            ],
            [
              { label: "p", source: "a", target: "b" },
              { label: "q", source: "b", target: "a" },
              { label: "r", source: "a", target: "a" },
              { label: "s", source: "b", target: "b" },
              { source: "c", target: "d" },
            ],
          ),
        );

        expect(diagram).toContain('subgraph nb0["B"]');
        expect(diagram).toContain('subgraph nb1["C"]');
      });

      it("keeps a truncation node in its parent's neighborhood, ignoring its unlabelled edge in the title", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            [
              { id: "a", label: "A", marker: "root" },
              { id: "b", label: "B" },
              { id: "more", label: "… 2 more", marker: "truncation" },
              { id: "alone", label: "Alone" },
            ],
            [
              { label: "UMa", source: "a", target: "b" },
              { source: "a", target: "more" },
            ],
          ),
        );

        expect(diagram).toContain(
          '    subgraph nb0["UMa"]\n        direction LR\n        n0["A"] --> n1["B"] & n2["… 2 more"]\n    end\n    subgraph nb1["Alone"]',
        );
      });

      it("groups by edges read as undirected and escapes a title like a label", () => {
        const { diagram } = renderGraphMermaid(
          graph(
            [
              { id: "a", label: 'Say "hi" #1' },
              { id: "b", label: "B" },
              { id: "c", label: "C" },
              { id: "z", label: "run ``` here" },
            ],
            [
              { source: "a", target: "b" },
              { source: "c", target: "b" },
            ],
          ),
        );

        expect(diagram).toContain('subgraph nb0["Say #quot;hi#quot; #35;1"]');
        expect(diagram).toContain('n0["Say #quot;hi#quot; #35;1"] --> n1["B"]');
        expect(diagram).toContain('subgraph nb1["run #96;#96;#96; here"]');
      });

      it("counts edges over the whole model for limit warnings", () => {
        const { edges, nodes } = hubAndLeaves(450);

        expect(
          renderGraphMermaid(
            graph([...nodes, { id: "alone", label: "Alone" }], edges),
          ).warnings,
        ).toStrictEqual([
          "Diagram has 450 edges, nearing Mermaid's 500-edge limit",
        ]);
      });
    });

    describe("sections", () => {
      it("packs neighborhoods into sections of at most forty nodes, numbering subgraphs from each section's first", () => {
        const { sections } = renderGraphMermaid(
          graph(
            Array.from({ length: 60 }, (_, index) => ({
              id: `n${index}`,
              label: `Node ${index}`,
            })),
          ),
          { sections: true },
        );

        expect(sections?.map(({ titles }) => titles.length)).toStrictEqual([
          40, 20,
        ]);
        expect(sections?.[0]?.diagram).toContain('subgraph nb0["Node 0"]');
        expect(sections?.[1]?.diagram).toContain('subgraph nb40["Node 40"]');
      });

      it("gives a neighborhood past the budget a section of its own, bare of subgraphs", () => {
        const hub = hubAndLeaves(45);
        const { sections } = renderGraphMermaid(
          graph([...hub.nodes, { id: "z", label: "Z" }], hub.edges),
          { sections: true },
        );

        expect(sections?.map(({ titles }) => titles)).toStrictEqual([
          ["Hub"],
          ["Z"],
        ]);
        expect(sections?.[0]?.diagram).not.toContain("subgraph");
      });

      it("draws a single neighborhood's section with no subgraph, and its labels", () => {
        const { sections } = renderGraphMermaid(
          graph(letters("a", "b"), [{ label: "x", source: "a", target: "b" }]),
          { sections: true },
        );

        expect(sections).toStrictEqual([
          {
            diagram: ["flowchart LR", '    n0["A"] -->|"x"| n1["B"]'].join(
              "\n",
            ),
            titles: ["x"],
          },
        ]);
      });

      it("warns about a section's own size, naming it", () => {
        const { edges, nodes } = hubAndLeaves(450);
        const { warnings } = renderGraphMermaid(
          graph([...nodes, { id: "alone", label: "Alone" }], edges),
          { sections: true },
        );

        expect(warnings).toStrictEqual([
          "Hub: Diagram has 450 edges, nearing Mermaid's 500-edge limit",
        ]);
      });

      it("leaves sections out unless asked", () => {
        expect(
          renderGraphMermaid(graph(letters("a"))).sections,
        ).toBeUndefined();
      });
    });
  });

  describe(renderGraphMarkdown, () => {
    const rendering = {
      diagram: "flowchart LR",
      language: "mermaid",
      warnings: [],
    } as const;

    it("wraps the diagram in a fence of its language, with no warnings after it when there are none", () => {
      expect(renderGraphMarkdown(rendering)).toBe(
        "```mermaid\nflowchart LR\n```\n",
      );
      expect(renderGraphMarkdown({ ...rendering, language: "text" })).toBe(
        "```text\nflowchart LR\n```\n",
      );
    });

    it("keeps warnings after the fence as blockquotes, flattening line breaks", () => {
      const markdown = renderGraphMarkdown({
        ...rendering,
        warnings: ["Node 6 names parent 99", "first line\r\nsecond line"],
      });

      expect(markdown).toBe(
        "```mermaid\nflowchart LR\n```\n\n> ⚠️ Node 6 names parent 99\n> ⚠️ first line second line\n",
      );
    });

    it("fences a diagram holding backticks with a fence one longer than the longest run", () => {
      const three = renderGraphMarkdown({
        ...rendering,
        diagram: 'flowchart LR\n    n0["run ``` here"]',
      });
      const four = renderGraphMarkdown({
        ...rendering,
        diagram: 'flowchart LR\n    n0["````"]',
      });

      expect(three.startsWith("````mermaid\n")).toBe(true);
      expect(three.split("\n")).not.toContain("```");
      expect(four.startsWith("`````mermaid\n")).toBe(true);
      expect(four.endsWith("\n`````\n")).toBe(true);
    });
  });

  describe(renderGraphPagesMarkdown, () => {
    const rendering = {
      diagram: "flowchart LR",
      language: "mermaid",
      warnings: [],
    } as const;

    it("writes a lone rendering with no heading", () => {
      expect(renderGraphPagesMarkdown([rendering], ["Page 3"])).toBe(
        renderGraphMarkdown(rendering),
      );
    });

    it("puts each of several renderings under its heading, numbering one the headings omit", () => {
      expect(renderGraphPagesMarkdown([rendering, rendering], ["Page 3"])).toBe(
        `## Page 3\n\n${renderGraphMarkdown(rendering)}\n## Page 2\n\n${renderGraphMarkdown(rendering)}`,
      );
    });
  });

  describe("render-mermaid sections utilities", () => {
    describe(renderSectionsMarkdown, () => {
      it("opens with an index of links, then a heading and fenced diagram per section", () => {
        const markdown = renderSectionsMarkdown(
          [sectionedRendering([["Body", "Duration"], ["Sign"]])],
          [],
        );

        expect(markdown).toBe(
          [
            "[Body](#body-duration) · [Duration](#body-duration) · [Sign](#sign)",
            "",
            "## Body, Duration",
            "",
            "```mermaid",
            "flowchart LR",
            "    %% Body,Duration",
            "```",
            "",
            "## Sign",
            "",
            "```mermaid",
            "flowchart LR",
            "    %% Sign",
            "```",
            "",
          ].join("\n"),
        );
      });

      it("numbers repeated headings the way GitHub anchors them and escapes link text", () => {
        const markdown = renderSectionsMarkdown(
          [sectionedRendering([["Same"], ["Same"], ["a_b [x]"]])],
          [],
        );

        expect(markdown).toContain("[Same](#same) · [Same](#same-1)");
        expect(markdown).toContain(String.raw`[a\_b \[x\]](#a_b-x)`);
      });

      it("puts each page under a heading, with the page's sections one level down", () => {
        const markdown = renderSectionsMarkdown(
          [sectionedRendering([["A"], ["B"]]), sectionedRendering([["C"]])],
          ["Page 1 of 2", "Page 2 of 2"],
        );

        expect(markdown).toContain(
          "- [Page 1 of 2](#page-1-of-2): [A](#a) · [B](#b)\n- [Page 2 of 2](#page-2-of-2): [C](#page-2-of-2)\n",
        );
        expect(markdown).toContain("## Page 1 of 2\n\n### A\n");
        expect(markdown).toContain("## Page 2 of 2\n\n```mermaid");
        expect(markdown).not.toContain("### C");
      });

      it("treats a rendering with no sections as having none", () => {
        const markdown = renderSectionsMarkdown(
          [
            sectionedRendering([["A"], ["B"]]),
            { diagram: "x", language: "text", warnings: [] },
          ],
          [],
        );

        expect(markdown).toContain("- [Page 2](#page-2): \n");
      });

      it("numbers a page the headings omit and ends with the warnings as blockquotes", () => {
        const markdown = renderSectionsMarkdown(
          [
            sectionedRendering([["A"]], ["Too big"]),
            sectionedRendering([["B"]]),
          ],
          [],
        );

        expect(markdown).toContain("## Page 1\n");
        expect(markdown.endsWith("\n> ⚠️ Too big\n")).toBe(true);
      });
    });

    describe(sectionCount, () => {
      it("adds the sections of every rendering, none for one without", () => {
        expect(
          sectionCount([
            sectionedRendering([["A"], ["B"]]),
            { diagram: "", language: "text", warnings: [] },
          ]),
        ).toBe(2);
      });
    });

    describe(fencedBlock, () => {
      it("fences longer than any backtick run inside", () => {
        expect(fencedBlock("a ``` b", "text")).toBe("````text\na ``` b\n````");
      });
    });

    describe(markdownText, () => {
      it("flattens whitespace and backslashes Markdown's specials", () => {
        expect(markdownText("  a\n b *c* #d | <e> `f` ")).toBe(
          String.raw`a b \*c\* \#d \| \<e\> \`f\``,
        );
      });
    });

    describe(slugger, () => {
      it("lowercases, drops punctuation, dashes spaces and keeps letters from any script", () => {
        const slug = slugger();

        expect(slug("Boötes, Canes Venatici (2)")).toBe(
          "boötes-canes-venatici-2",
        );
        expect(slug("Boötes, Canes Venatici (2)")).toBe(
          "boötes-canes-venatici-2-1",
        );
      });
    });
  });
});
