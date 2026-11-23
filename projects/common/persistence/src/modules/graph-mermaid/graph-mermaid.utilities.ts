// 🌎 Utilities

import {
  MERMAID_CLASS_DEFINITIONS,
  MERMAID_INDENT,
  MERMAID_MAXIMUM_CHARACTERS,
  MERMAID_MAXIMUM_EDGES,
  MERMAID_ROOT_CLASS,
  MERMAID_TRUNCATION_CLASS,
  MERMAID_WARNING_THRESHOLD,
} from "./graph-mermaid.constants";

import type {
  GraphEdge,
  GraphMermaidOptions,
  GraphMermaidRendering,
  GraphModel,
  GraphNode,
} from "./graph-mermaid.types";

/**
 * Draws `graph` as a Mermaid flowchart with short node ids, escaped labels,
 * and styled roots and truncation nodes, warning as it nears Mermaid's limits.
 * @throws Error when two nodes share an id, or an edge names no node.
 */
export function renderGraphMermaid(
  graph: GraphModel,
  options: GraphMermaidOptions = {},
): GraphMermaidRendering {
  const shortIds = assignShortIds(graph.nodes);
  const lines = [
    `flowchart ${options.direction ?? "LR"}`,
    ...MERMAID_CLASS_DEFINITIONS.map((definition) => indent(definition)),
    ...graph.nodes.map((node) => drawNode(node, shortIds)),
    ...graph.edges.map((edge) => drawEdge(edge, graph.directed, shortIds)),
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
  return indent(`${source} ${arrow}${label} ${target}`);
}

/** Declares a node as a short id with a quoted, escaped label. */
function drawNode(
  node: GraphNode,
  shortIds: ReadonlyMap<string, string>,
): string {
  const shortId = shortIdOf(node.id, shortIds, "Node");
  return indent(`${shortId}["${escapeMermaidText(node.label)}"]`);
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
    .replaceAll('"', "#quot;")
    .replaceAll("|", "#124;")
    .replaceAll("<", "#lt;")
    .replaceAll(">", "#gt;");
}

/** Prefixes a line with the diagram's indent. */
function indent(line: string): string {
  return `${MERMAID_INDENT}${line}`;
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
  if (count >= maximum * MERMAID_WARNING_THRESHOLD) {
    return `${subject}, nearing Mermaid's ${maximum}-${unit} limit`;
  }
  return undefined;
}

/** Warnings for an edge count or diagram length nearing or past Mermaid's limits. */
function limitWarnings(edges: number, characters: number): string[] {
  const warnings = [
    limitWarning(edges, MERMAID_MAXIMUM_EDGES, "edge"),
    limitWarning(characters, MERMAID_MAXIMUM_CHARACTERS, "character"),
  ];
  return warnings.filter((warning): warning is string => warning !== undefined);
}

/** One `class` line per root or truncation node, in node order. */
function markedNodeClasses(
  nodes: readonly GraphNode[],
  shortIds: ReadonlyMap<string, string>,
): string[] {
  return nodes.flatMap((node) => {
    if (node.marker === undefined) return [];
    const className =
      node.marker === "root" ? MERMAID_ROOT_CLASS : MERMAID_TRUNCATION_CLASS;
    const shortId = shortIdOf(node.id, shortIds, "Node");
    return [indent(`class ${shortId} ${className}`)];
  });
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
