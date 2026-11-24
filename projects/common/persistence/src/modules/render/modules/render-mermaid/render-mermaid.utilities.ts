// 🌎 Utilities

import {
  RENDER_MERMAID_CLASS_DEFINITIONS,
  RENDER_MERMAID_INDENT,
  RENDER_MERMAID_MAXIMUM_CHARACTERS,
  RENDER_MERMAID_MAXIMUM_EDGES,
  RENDER_MERMAID_ROOT_CLASS,
  RENDER_MERMAID_TRUNCATION_CLASS,
  RENDER_MERMAID_WARNING_THRESHOLD,
} from "./render-mermaid.constants";

import type {
  GraphEdge,
  GraphMermaidOptions,
  GraphMermaidRendering,
  GraphModel,
  GraphNeighborhood,
  GraphNode,
} from "./render-mermaid.types";

/** Warnings for an edge count or diagram length nearing or past Mermaid's limits. */
export function limitWarnings(edges: number, characters: number): string[] {
  const warnings = [
    limitWarning(edges, RENDER_MERMAID_MAXIMUM_EDGES, "edge"),
    limitWarning(characters, RENDER_MERMAID_MAXIMUM_CHARACTERS, "character"),
  ];
  return warnings.filter((warning): warning is string => warning !== undefined);
}

/**
 * Wraps a rendering's diagram in a Mermaid fence longer than any backtick run
 * in it, with its warnings as blockquotes after the fence.
 */
export function renderGraphMarkdown({
  diagram,
  warnings,
}: GraphMermaidRendering): string {
  const fence = markdownFence(diagram);
  const lines = [`${fence}mermaid`, diagram, fence];
  if (warnings.length > 0) {
    lines.push(
      "",
      ...warnings.map((warning) => `> ⚠️ ${warning.replaceAll(/\r?\n/g, " ")}`),
    );
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Draws `graph` as a Mermaid flowchart, warning near Mermaid's limits.
 * @throws Error on a duplicate node id, or an edge naming no node.
 */
export function renderGraphMermaid(
  graph: GraphModel,
  options: GraphMermaidOptions = {},
): GraphMermaidRendering {
  const shortIds = assignShortIds(graph.nodes);
  const neighborhoods = titleNeighborhoods(findNeighborhoods(graph, shortIds));
  const body: string[] = [];
  for (const neighborhood of neighborhoods) {
    for (const line of drawNeighborhood(
      neighborhood,
      graph.directed,
      shortIds,
    )) {
      body.push(line);
    }
  }
  const lines = [
    `flowchart ${options.direction ?? "LR"}`,
    ...RENDER_MERMAID_CLASS_DEFINITIONS.map((definition) => indent(definition)),
    ...body,
    ...markedNodeClasses(graph.nodes, shortIds),
  ];

  const diagram = lines.join("\n");
  return {
    diagram,
    warnings: [
      ...graph.warnings,
      ...limitWarnings(graph.edges.length, diagram.length),
    ],
  };
}

/**
 * Joins page renderings into one Markdown document, each under its heading
 * (`Page 3`); a lone rendering is returned as `renderGraphMarkdown` writes it.
 */
export function renderGraphPagesMarkdown(
  renderings: readonly GraphMermaidRendering[],
  headings: readonly string[],
): string {
  const [only] = renderings;
  if (renderings.length === 1 && only !== undefined) {
    return renderGraphMarkdown(only);
  }
  const sections: string[] = [];
  for (const [index, rendering] of renderings.entries()) {
    const heading = headings[index] ?? `Page ${index + 1}`;
    sections.push(`## ${heading}\n\n${renderGraphMarkdown(rendering)}`);
  }
  return sections.join("\n");
}

/** Maps each model node id to `n<position>`, rejecting a repeated id. */
function assignShortIds(nodes: readonly GraphNode[]): Map<string, string> {
  const shortIds = new Map<string, string>();
  nodes.forEach((node, index) => {
    if (shortIds.has(node.id)) {
      throw new Error(`Duplicate node id "${node.id}"`);
    }
    shortIds.set(node.id, `n${index}`);
  });
  return shortIds;
}

/** Draws an edge, with an arrow when directed and a label when it has one. */
function drawEdge(
  edge: GraphEdge,
  directed: boolean,
  shortIds: ReadonlyMap<string, string>,
): string {
  const arrow = directed ? "-->" : "---";
  const text = edgeText(edge);
  const label = text === "" ? "" : `|"${escapeMermaidText(text)}"|`;
  const source = shortIdOf(edge.source, shortIds, "Edge source");
  const target = shortIdOf(edge.target, shortIds, "Edge target");
  return `${source} ${arrow}${label} ${target}`;
}

/**
 * Draws a neighborhood's nodes and edges, inside a titled `subgraph` when it
 * has one, and bare when it is the diagram's only neighborhood.
 */
function drawNeighborhood(
  { edges, nodes, subgraph }: GraphNeighborhood,
  directed: boolean,
  shortIds: ReadonlyMap<string, string>,
): string[] {
  const prefix =
    subgraph === undefined
      ? RENDER_MERMAID_INDENT
      : RENDER_MERMAID_INDENT.repeat(2);
  const lines: string[] = [];
  if (subgraph !== undefined) {
    lines.push(
      indent(`subgraph ${subgraph.id}["${escapeMermaidText(subgraph.title)}"]`),
    );
  }
  for (const node of nodes) {
    lines.push(`${prefix}${drawNode(node, shortIds)}`);
  }
  for (const edge of edges) {
    lines.push(`${prefix}${drawEdge(edge, directed, shortIds)}`);
  }
  if (subgraph !== undefined) lines.push(indent("end"));
  return lines;
}

/** Declares a node by short id and escaped label, with any icon and note beneath. */
function drawNode(
  node: GraphNode,
  shortIds: ReadonlyMap<string, string>,
): string {
  const shortId = shortIdOf(node.id, shortIds, "Node");
  const label = escapeMermaidText(node.label);
  const detail = nodeDetail(node);
  return detail === ""
    ? `${shortId}["${label}"]`
    : `${shortId}["${label}<br/><i>${escapeMermaidText(detail)}</i>"]`;
}

/** The label and weight drawn on an edge, as `label (weight)`. */
function edgeText(edge: GraphEdge): string {
  const label = edge.label ?? "";
  if (edge.weight === undefined) return label;
  if (label === "") return String(edge.weight);
  return `${label} (${edge.weight})`;
}

/**
 * Escapes text for a quoted Mermaid label: entity codes for the characters
 * that end or reshape a label, and line breaks flattened to spaces.
 */
function escapeMermaidText(text: string): string {
  return text
    .replaceAll(/\r?\n/g, " ")
    .replaceAll("#", "#35;")
    .replaceAll("`", "#96;")
    .replaceAll('"', "#quot;")
    .replaceAll("|", "#124;")
    .replaceAll("<", "#lt;")
    .replaceAll(">", "#gt;");
}

/** The representative of the group `id` is in, shortening the path on the way. */
function findGroup(parents: Map<string, string>, id: string): string {
  let top = id;
  while ((parents.get(top) ?? top) !== top) {
    top = parents.get(top) ?? top;
  }
  let current = id;
  while (current !== top) {
    const next = parents.get(current) ?? top;
    parents.set(current, top);
    current = next;
  }
  return top;
}

/**
 * Splits the model into weakly connected neighborhoods, ordered by their first
 * node, rejecting an edge that names no node.
 */
function findNeighborhoods(
  graph: GraphModel,
  shortIds: ReadonlyMap<string, string>,
): GraphNeighborhood[] {
  const parents = new Map(graph.nodes.map((node) => [node.id, node.id]));
  for (const edge of graph.edges) {
    shortIdOf(edge.source, shortIds, "Edge source");
    shortIdOf(edge.target, shortIds, "Edge target");
    parents.set(
      findGroup(parents, edge.source),
      findGroup(parents, edge.target),
    );
  }
  const groups = new Map<string, { edges: GraphEdge[]; nodes: GraphNode[] }>();
  for (const node of graph.nodes) {
    const key = findGroup(parents, node.id);
    const group = groups.get(key) ?? { edges: [], nodes: [] };
    group.nodes.push(node);
    groups.set(key, group);
  }
  for (const edge of graph.edges) {
    groups.get(findGroup(parents, edge.source))?.edges.push(edge);
  }
  return [...groups.values()];
}

/** Prefixes a line with the diagram's indent. */
function indent(line: string): string {
  return `${RENDER_MERMAID_INDENT}${line}`;
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

/** A backtick fence one longer than the longest backtick run in `text`, and at least three. */
function markdownFence(text: string): string {
  const longest = [...text.matchAll(/`+/g)].reduce(
    (most, [run]) => Math.max(most, run.length),
    2,
  );
  return "`".repeat(longest + 1);
}

/** One `class` line per root or truncation node, in node order. */
function markedNodeClasses(
  nodes: readonly GraphNode[],
  shortIds: ReadonlyMap<string, string>,
): string[] {
  return nodes.flatMap((node) => {
    if (node.marker === undefined) return [];
    const className =
      node.marker === "root"
        ? RENDER_MERMAID_ROOT_CLASS
        : RENDER_MERMAID_TRUNCATION_CLASS;
    const shortId = shortIdOf(node.id, shortIds, "Node");
    return [indent(`class ${shortId} ${className}`)];
  });
}

/**
 * The shared edge label (dropped from the edges), else the first root's or
 * first node's label. Truncation edges are unlabelled, so they are skipped.
 */
function neighborhoodTitle(
  edges: readonly GraphEdge[],
  nodes: readonly GraphNode[],
): {
  hideLabels: boolean;
  title: string;
} {
  const truncations = new Set(
    nodes.filter(({ marker }) => marker === "truncation").map(({ id }) => id),
  );
  const labelled = edges.filter(({ target }) => !truncations.has(target));
  const shared = labelled[0]?.label ?? "";
  if (shared !== "" && labelled.every((edge) => edge.label === shared)) {
    return { hideLabels: true, title: shared };
  }
  const first = nodes.find((node) => node.marker === "root") ?? nodes[0];
  return { hideLabels: false, title: first?.label ?? "" };
}

/**
 * A node's icon and note on one line, empty when it has neither.
 */
function nodeDetail(node: GraphNode): string {
  const parts: string[] = [];
  for (const part of [node.icon, node.note]) {
    if (part !== undefined && part !== "") {
      parts.push(part);
    }
  }
  return parts.join(" · ");
}

/** Looks up a model id's short id, rejecting an id no node has. */
function shortIdOf(
  id: string,
  shortIds: ReadonlyMap<string, string>,
  role: string,
): string {
  const shortId = shortIds.get(id);
  if (shortId === undefined) {
    throw new Error(`${role} "${id}" is not a node`);
  }
  return shortId;
}

/**
 * Gives each of two or more neighborhoods its subgraph, numbered in order and
 * titled by `neighborhoodTitle`; a lone neighborhood is returned as it is.
 */
function titleNeighborhoods(
  neighborhoods: readonly GraphNeighborhood[],
): readonly GraphNeighborhood[] {
  if (neighborhoods.length < 2) return neighborhoods;
  const titled: GraphNeighborhood[] = [];
  for (const [index, { edges, nodes }] of neighborhoods.entries()) {
    const { hideLabels, title } = neighborhoodTitle(edges, nodes);
    titled.push({
      edges: hideLabels ? edges.map((edge) => withoutLabel(edge)) : edges,
      nodes,
      subgraph: { id: `nb${index}`, title },
    });
  }
  return titled;
}

/** The edge without its label, keeping its weight. */
function withoutLabel(edge: GraphEdge): GraphEdge {
  return edge.weight === undefined
    ? { source: edge.source, target: edge.target }
    : { source: edge.source, target: edge.target, weight: edge.weight };
}
