// 🌎 Utilities

import {
  drawFlowchart,
  flowchartContext,
} from "./render-mermaid-flowchart.utilities";
import {
  fencedBlock,
  findNeighborhoods,
  packNeighborhoods,
  renderSectionsMarkdown,
  sectionCount,
  warningLines,
} from "./render-mermaid-sections.utilities";
import {
  RENDER_MERMAID_MAXIMUM_CHARACTERS,
  RENDER_MERMAID_MAXIMUM_EDGES,
  RENDER_MERMAID_SECTION_NODES,
  RENDER_MERMAID_WARNING_THRESHOLD,
} from "./render-mermaid.constants";

import type {
  GraphGroup,
  GraphMermaidOptions,
  GraphMermaidRendering,
  GraphMermaidSection,
  GraphModel,
} from "./render-mermaid.types";

/** Warnings for an edge count or diagram length nearing or past Mermaid's limits. */
export function limitWarnings(edges: number, characters: number): string[] {
  const warnings = [
    limitWarning(edges, RENDER_MERMAID_MAXIMUM_EDGES, "edge"),
    limitWarning(characters, RENDER_MERMAID_MAXIMUM_CHARACTERS, "character"),
  ];
  return warnings.filter((warning): warning is string => warning !== undefined);
}

/** Wraps a rendering in a fence of its language, its warnings after. */
export function renderGraphMarkdown(rendering: GraphMermaidRendering): string {
  const lines = [
    fencedBlock(rendering.diagram, rendering.language),
    ...warningLines([rendering]),
  ];
  return `${lines.join("\n")}\n`;
}

/**
 * Draws `graph` as a compact flowchart, or small ones with `sections`.
 * @throws Error on a duplicate id, or an edge naming no node.
 */
export function renderGraphMermaid(
  graph: GraphModel,
  options: GraphMermaidOptions = {},
): GraphMermaidRendering {
  const context = flowchartContext(graph, options.direction ?? "LR");
  const sectioned = options.sections === true;
  const groups = packNeighborhoods(
    findNeighborhoods(graph),
    sectioned ? RENDER_MERMAID_SECTION_NODES : Number.POSITIVE_INFINITY,
  );
  const sections: GraphMermaidSection[] = [];
  const warnings = [...graph.warnings];
  for (const group of groups) {
    const diagram = drawFlowchart(group.neighborhoods, context, group.start);
    const titles = group.neighborhoods.map(({ title }) => title);
    sections.push({ diagram, titles });
    warnings.push(...groupWarnings(group, diagram, sectioned ? titles : []));
  }
  const diagram = sections.map((section) => section.diagram).join("\n\n");
  return sectioned
    ? { diagram, language: "mermaid", sections, warnings }
    : { diagram, language: "mermaid", warnings };
}

/**
 * Joins page renderings into one Markdown document, with an index when sectioned.
 */
export function renderGraphPagesMarkdown(
  renderings: readonly GraphMermaidRendering[],
  headings: readonly string[],
): string {
  if (sectionCount(renderings) > 1) {
    return renderSectionsMarkdown(renderings, headings);
  }
  const [only] = renderings;
  if (renderings.length === 1 && only !== undefined) {
    return renderGraphMarkdown(only);
  }
  const pages: string[] = [];
  for (const [index, rendering] of renderings.entries()) {
    const heading = headings[index] ?? `Page ${index + 1}`;
    pages.push(`## ${heading}\n\n${renderGraphMarkdown(rendering)}`);
  }
  return pages.join("\n");
}

/** The limit warnings of one drawn group, each named by the titles when it is a section. */
function groupWarnings(
  group: GraphGroup,
  diagram: string,
  titles: readonly string[],
): string[] {
  let edges = 0;
  for (const neighborhood of group.neighborhoods) {
    edges += neighborhood.edges.length;
  }
  const prefix = titles.length === 0 ? "" : `${titles.join(", ")}: `;
  return limitWarnings(edges, diagram.length).map(
    (warning) => `${prefix}${warning}`,
  );
}

/** Warns when a count reaches the warning share of its limit, or passes it. */
function limitWarning(
  count: number,
  maximum: number,
  unit: "character" | "edge",
): string | undefined {
  const subject =
    unit === "edge"
      ? `Diagram has ${count} edges`
      : `Diagram is ${count} characters`;
  if (count > maximum) {
    return `${subject}, over Mermaid's ${maximum}-${unit} limit`;
  }
  if (count >= maximum * RENDER_MERMAID_WARNING_THRESHOLD) {
    return `${subject}, nearing Mermaid's ${maximum}-${unit} limit`;
  }
  return undefined;
}
