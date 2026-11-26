import { describe, expect, it } from "vitest";

import { Measure, Metric, MetricExpression } from "@codebase/caelundas-db";

import { MetricExpressionsAnchorError } from "./metric-expressions.constants";
import {
  buildMetricExpressionTrees,
  infixOf,
  renderMetricExpressionsBlock,
  spliceMetricExpressionsMarkdown,
} from "./metric-expressions.utilities";

/** An expression row, with the fields a tree reads. */
function expression(fields: Partial<MetricExpression>): MetricExpression {
  return Object.assign(new MetricExpression(), {
    kind: "operator",
    position: 0,
    ...fields,
  });
}

/** A metric row, with the fields a tree reads. */
function metric(fields: Partial<Metric>): Metric {
  return Object.assign(new Metric(), { unit: "none", ...fields });
}

const ROWS = [
  expression({ id: "root", operator: "subtract", parentId: null }),
  expression({
    id: "extra",
    kind: "measure",
    measure: Object.assign(new Measure(), { name: "Events", slug: "events" }),
    parentId: "root",
    position: 1,
  }),
  expression({
    id: "ratio",
    operator: "percent",
    parentId: "root",
    position: 0,
  }),
  expression({
    id: "top",
    kind: "measure",
    measure: Object.assign(new Measure(), {
      name: "Clipped duration",
      slug: "clipped-duration",
    }),
    parentId: "ratio",
    position: 0,
  }),
  expression({
    id: "bottom",
    kind: "metric",
    metric: metric({ name: "Total duration", slug: "total-duration" }),
    parentId: "ratio",
    position: 1,
  }),
  expression({
    id: "events-root",
    kind: "measure",
    measure: Object.assign(new Measure(), { name: "Events", slug: "events" }),
    parentId: null,
  }),
];

const METRICS = [
  metric({
    expressionId: "root",
    name: "Time counted",
    slug: "total-time-percent",
  }),
  metric({ expressionId: "events-root", name: "Events", slug: "events" }),
  metric({ expressionId: null, name: "Draft", slug: "draft" }),
];

describe("metric expression utilities", () => {
  describe(buildMetricExpressionTrees, () => {
    it("builds a tree per metric that has a root, by slug, with operands in position order", () => {
      const trees = buildMetricExpressionTrees(METRICS, ROWS);

      expect(trees.map(({ slug }) => slug)).toStrictEqual([
        "events",
        "total-time-percent",
      ]);
      expect(trees[1]?.expression).toStrictEqual({
        children: [
          {
            children: [
              {
                kind: "measure",
                name: "Clipped duration",
                slug: "clipped-duration",
              },
              {
                kind: "metric",
                name: "Total duration",
                slug: "total-duration",
              },
            ],
            kind: "operator",
            operator: "percent",
          },
          { kind: "measure", name: "Events", slug: "events" },
        ],
        kind: "operator",
        operator: "subtract",
      });
    });

    it("names the metric whose root is not among the expressions", () => {
      expect(() =>
        buildMetricExpressionTrees(
          [metric({ expressionId: "gone", slug: "lost" })],
          ROWS,
        ),
      ).toThrow("Metric lost names expression gone, which is not in the table");
    });
  });

  describe(infixOf, () => {
    it("writes operators between operands, parenthesizing a nested operator but not the root", () => {
      const [, tree] = buildMetricExpressionTrees(METRICS, ROWS);

      expect(tree === undefined ? "" : infixOf(tree.expression)).toBe(
        "(clipped-duration % of metric:total-duration) − events",
      );
    });

    it("writes an operator with no symbol by its name", () => {
      expect(
        infixOf({
          children: [
            { kind: "measure", name: "One", slug: "one" },
            { kind: "measure", name: "Two", slug: "two" },
          ],
          kind: "operator",
          operator: "power",
        }),
      ).toBe("one power two");
    });
  });

  describe(renderMetricExpressionsBlock, () => {
    const block = renderMetricExpressionsBlock(
      buildMetricExpressionTrees(METRICS, ROWS),
    );
    const diagramsOf = (markdown: string): string[] =>
      [...markdown.matchAll(/```mermaid\n(.*?)```/gsu)].map(
        ([, source = ""]) => source,
      );
    const diagrams = diagramsOf(block);

    it("draws a table row and a flowchart per metric", () => {
      expect(block).toMatch(
        /\| Time counted +\| `total-time-percent` +\| none +\| `\(clipped-duration % of metric:total-duration\) − events` +\|/u,
      );
      expect(diagrams).toHaveLength(2);
    });

    it("roots the diagram in the metric and shapes each node by its kind", () => {
      const [, diagram = ""] = diagrams;

      expect(diagram).toContain(
        '    n0(["Time counted (total-time-percent)"])',
      );
      expect(diagram).toContain('    n1{{"− subtract"}}');
      expect(diagram).toContain('    n2{{"% of percent"}}');
      expect(diagram).toContain(
        '    n3["Clipped duration (clipped-duration)"]',
      );
      expect(diagram).toContain('    n4(["Total duration (total-duration)"])');
      expect(diagram).toContain('    n5["Events (events)"]');
      expect(diagram).toContain("    class n0 root");
    });

    it("numbers operands only under an operator whose order matters", () => {
      const [, diagram = ""] = diagrams;

      expect(diagram).toContain("    n0 --> n1");
      expect(diagram).toContain('    n1 -->|"1"| n2');
      expect(diagram).toContain('    n1 -->|"2"| n5');
      expect(diagram).toContain('    n2 -->|"1"| n3');
      expect(diagram).toContain('    n2 -->|"2"| n4');
    });

    it("draws a lone measure as one node, without repeating the metric's name", () => {
      const [lone = ""] = diagrams;

      expect(lone).toContain('    n0["measure (events)"]');
      expect(lone).not.toContain("n1");
    });

    it("names a lone measure that differs from its metric by both", () => {
      const trees = buildMetricExpressionTrees(
        [metric({ expressionId: "total", name: "Time", slug: "time" })],
        [
          expression({
            id: "total",
            kind: "measure",
            measure: Object.assign(new Measure(), {
              name: "Clipped duration",
              slug: "clipped-duration",
            }),
            parentId: null,
          }),
        ],
      );

      expect(renderMetricExpressionsBlock(trees)).toContain(
        '    n0["Clipped duration (clipped-duration)"]',
      );
    });

    it("writes plain text: no HTML in any label, quotes and angle brackets neutralized", () => {
      const odd = diagramsOf(
        renderMetricExpressionsBlock(
          buildMetricExpressionTrees(
            [
              metric({
                expressionId: "odd",
                name: 'A "b" <i>c</i>',
                slug: "odd",
              }),
            ],
            [
              expression({
                id: "odd",
                kind: "measure",
                measure: Object.assign(new Measure(), {
                  name: 'Say "hi" <br/>',
                  slug: "say-hi",
                }),
                parentId: null,
              }),
            ],
          ),
        ),
      );

      expect(odd.join("")).toContain("Say 'hi' br/ (say-hi)");

      for (const source of [...diagrams, ...odd]) {
        const labels = [...source.matchAll(/"([^"]*)"/gu)].map(
          ([, label = ""]) => label,
        );

        expect(labels.length).toBeGreaterThan(0);
        expect(labels.filter((label) => /[<>]/u.test(label))).toStrictEqual([]);
        expect(source).not.toMatch(/<\/?[a-z]|#\w+;/iu);
      }
    });

    it("declares every node once and draws edges only between declared nodes", () => {
      for (const source of diagrams) {
        const declared = [...source.matchAll(/^ {4}(n\d+)[[({]/gmu)].map(
          ([, id = ""]) => id,
        );
        const used = [
          ...source.matchAll(/^ {4}(n\d+) -->(?:\|"\d+"\|)? (n\d+)$/gmu),
        ].flatMap(([, from = "", to = ""]) => [from, to]);

        expect(new Set(declared).size).toBe(declared.length);
        expect(used.filter((id) => !declared.includes(id))).toStrictEqual([]);
      }
    });
  });

  describe(spliceMetricExpressionsMarkdown, () => {
    const trees = buildMetricExpressionTrees(METRICS, ROWS);

    it("appends the block after prose that has no anchors, and replaces it on a rerun", () => {
      const first = spliceMetricExpressionsMarkdown("# Title\n", trees);
      const second = spliceMetricExpressionsMarkdown(first, trees);

      expect(
        first.startsWith("# Title\n\n<!-- metric-expressions:start -->"),
      ).toBe(true);
      expect(second).toBe(first);
    });

    it("keeps the text around the anchors and replaces what is between them", () => {
      const next = spliceMetricExpressionsMarkdown(
        "before\n<!-- metric-expressions:start -->\nold\n<!-- metric-expressions:end -->\nafter\n",
        trees,
      );

      expect(next.startsWith("before\n<!-- metric-expressions:start -->")).toBe(
        true,
      );
      expect(next).not.toContain("old");
      expect(next.endsWith("<!-- metric-expressions:end -->\nafter\n")).toBe(
        true,
      );
    });

    it("writes the block alone into an empty file", () => {
      expect(spliceMetricExpressionsMarkdown(undefined, trees)).toBe(
        `${renderMetricExpressionsBlock(trees)}\n`,
      );
    });

    it("refuses anchors that are not one ordered pair", () => {
      expect(() =>
        spliceMetricExpressionsMarkdown(
          "<!-- metric-expressions:end -->\n<!-- metric-expressions:start -->\n",
          trees,
        ),
      ).toThrow(MetricExpressionsAnchorError);
    });
  });
});
