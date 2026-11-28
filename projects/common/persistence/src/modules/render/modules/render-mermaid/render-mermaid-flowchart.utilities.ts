// 🌎 Utilities

import {
  RENDER_MERMAID_CLASS_STYLES,
  RENDER_MERMAID_GRID_COLUMNS,
  RENDER_MERMAID_INDENT,
  RENDER_MERMAID_ROOT_CLASS,
  RENDER_MERMAID_SHARED_CLASS,
  RENDER_MERMAID_TRUNCATION_CLASS,
} from "./render-mermaid.constants";

import type {
  FlowchartContext,
  FlowchartDrawing,
  FlowchartLink,
  FlowchartNode,
  FlowchartWalk,
  GraphEdge,
  GraphMermaidOptions,
  GraphModel,
  GraphNeighborhood,
  GraphNode,
} from "./render-mermaid.types";

/**
 * Draws neighborhoods as one flowchart, each node declared once, edges chained.
 */
export function drawFlowchart(
  neighborhoods: readonly GraphNeighborhood[],
  context: FlowchartContext,
  first: number,
): string {
  const drawing = { ...context, declared: new Set<string>() };
  const subgraphs = neighborhoods.length > 1;
  const body: string[] = [];
  const ids: string[] = [];
  for (const [index, neighborhood] of neighborhoods.entries()) {
    const lines = context.directed
      ? fanOut(neighborhood, drawing)
      : trails(neighborhood, trailsOf(neighborhood.edges), drawing);
    lines.push(...loneNodes(neighborhood, drawing));
    if (!subgraphs) {
      body.push(...lines);
      continue;
    }
    const id = `nb${first + index}`;
    ids.push(id);
    body.push(
      ...subgraphLines(id, neighborhood.title, [
        `direction ${context.direction}`,
        ...lines,
      ]),
    );
  }
  body.push(...gridRows(ids));
  return flowchartText(neighborhoods, context, body);
}

/**
 * Escapes text for a quoted Mermaid label: entity codes for the characters
 * that end or reshape a label, and line breaks flattened to spaces.
 */
export function escapeMermaidText(text: string): string {
  return text
    .replaceAll(/\r?\n/g, " ")
    .replaceAll("#", "#35;")
    .replaceAll("`", "#96;")
    .replaceAll('"', "#quot;")
    .replaceAll("|", "#124;")
    .replaceAll("<", "#lt;")
    .replaceAll(">", "#gt;");
}

/**
 * Each node's declaration, each edge's text and the shared nodes.
 * @throws Error on a repeated node id.
 */
export function flowchartContext(
  graph: GraphModel,
  direction: NonNullable<GraphMermaidOptions["direction"]>,
): FlowchartContext {
  return {
    directed: graph.directed,
    direction,
    nodes: declareNodes(graph.nodes),
    shared: graph.directed ? sharedNodes(graph.edges) : new Set(),
  };
}

/** Declares each node by short id and escaped label, with any icon and note beneath. */
function declareNodes(nodes: readonly GraphNode[]): Map<string, FlowchartNode> {
  const declared = new Map<string, FlowchartNode>();
  for (const [index, node] of nodes.entries()) {
    if (declared.has(node.id)) {
      throw new Error(`Duplicate node id "${node.id}"`);
    }
    const shortId = `n${index}`;
    const label = escapeMermaidText(node.label);
    const detail = nodeDetail(node);
    declared.set(node.id, {
      declaration:
        detail === ""
          ? `${shortId}["${label}"]`
          : `${shortId}["${label}<br/><i>${escapeMermaidText(detail)}</i>"]`,
      shortId,
    });
  }
  return declared;
}

/** The text of the edge: its label and weight, as `label (weight)`. */
function edgeText(edge: GraphEdge, hideLabel: boolean): string {
  const label = hideLabel ? "" : (edge.label ?? "");
  if (edge.weight === undefined) return label;
  if (label === "") return String(edge.weight);
  return `${label} (${edge.weight})`;
}

/**
 * One line per distinct source and edge text: the source, an arrow, and every
 * target, `&`-joined.
 */
function fanOut(
  { edges, hideLabels }: GraphNeighborhood,
  drawing: FlowchartDrawing,
): string[] {
  const groups = new Map<
    string,
    { source: string; targets: string[]; text: string }
  >();
  for (const edge of edges) {
    const text = escapeMermaidText(edgeText(edge, hideLabels));
    const key = `${edge.source}\u0000${text}`;
    const group = groups.get(key) ?? { source: edge.source, targets: [], text };
    group.targets.push(edge.target);
    groups.set(key, group);
  }
  const lines: string[] = [];
  for (const { source, targets, text } of groups.values()) {
    const from = mention(source, drawing);
    const label = text === "" ? "" : `|"${text}"|`;
    const to: string[] = [];
    for (const target of targets) to.push(mention(target, drawing));
    lines.push(`${from} -->${label} ${to.join(" & ")}`);
  }
  return lines;
}

/** The header, the classes the nodes use, the indented body, and one `class` line per style. */
function flowchartText(
  neighborhoods: readonly GraphNeighborhood[],
  context: FlowchartContext,
  body: readonly string[],
): string {
  const classes = styledNodes(neighborhoods, context);
  const lines = [`flowchart ${context.direction}`];
  for (const [name, style] of RENDER_MERMAID_CLASS_STYLES) {
    if (classes.has(name)) lines.push(`classDef ${name} ${style}`);
  }
  lines.push(...body);
  for (const [name] of RENDER_MERMAID_CLASS_STYLES) {
    const members = classes.get(name);
    if (members !== undefined) lines.push(`class ${members.join(",")} ${name}`);
  }
  return lines
    .map((line, index) =>
      index === 0 ? line : `${RENDER_MERMAID_INDENT}${line}`,
    )
    .join("\n");
}

/** Rows of subgraphs, joined by invisible links, `RENDER_MERMAID_GRID_COLUMNS` to a row. */
function gridRows(ids: readonly string[]): string[] {
  const rows: string[] = [];
  for (let row = 0; row < ids.length; row += RENDER_MERMAID_GRID_COLUMNS) {
    const cells = ids.slice(row, row + RENDER_MERMAID_GRID_COLUMNS);
    if (cells.length > 1) rows.push(cells.join(" ~~~ "));
  }
  return rows;
}

/** The positions of the edges each node id touches, in edge order. */
function incidentEdges(
  edges: readonly GraphEdge[],
): Map<string, readonly number[]> {
  const incident = new Map<string, number[]>();
  for (const [index, { source, target }] of edges.entries()) {
    incident.set(source, [...(incident.get(source) ?? []), index]);
    if (target !== source) {
      incident.set(target, [...(incident.get(target) ?? []), index]);
    }
  }
  return incident;
}

/** The nodes no edge touches, declared one to a line. */
function loneNodes(
  { edges, nodes }: GraphNeighborhood,
  drawing: FlowchartDrawing,
): string[] {
  const lines: string[] = [];
  if (edges.length > 0) return lines;
  for (const node of nodes) lines.push(mention(node.id, drawing));
  return lines;
}

/** The node's short id, or its declaration the first time it is named. */
function mention(id: string, { declared, nodes }: FlowchartDrawing): string {
  const node = nodes.get(id);
  if (declared.has(id)) return node?.shortId ?? id;
  declared.add(id);
  return node?.declaration ?? id;
}

/** A node's icon and note on one line, empty when it has neither. */
function nodeDetail(node: GraphNode): string {
  const parts: string[] = [];
  for (const part of [node.icon, node.note]) {
    if (part !== undefined && part !== "") {
      parts.push(part);
    }
  }
  return parts.join(" · ");
}

/** The nodes with several parents: those a directed edge reaches from two sources. */
function sharedNodes(edges: readonly GraphEdge[]): Set<string> {
  const sources = new Map<string, string>();
  const shared = new Set<string>();
  for (const { source, target } of edges) {
    if (source === target) continue;
    const first = sources.get(target);
    if (first === undefined) sources.set(target, source);
    else if (first !== source) shared.add(target);
  }
  return shared;
}

/** The short ids of each styled class's nodes, in node order; classes without nodes are absent. */
function styledNodes(
  neighborhoods: readonly GraphNeighborhood[],
  context: FlowchartContext,
): Map<string, string[]> {
  const classes = new Map<string, string[]>();
  for (const { nodes } of neighborhoods) {
    for (const node of nodes) {
      let name: string | undefined;
      if (node.marker === "root") name = RENDER_MERMAID_ROOT_CLASS;
      else if (node.marker === "truncation") {
        name = RENDER_MERMAID_TRUNCATION_CLASS;
      } else if (context.shared.has(node.id)) {
        name = RENDER_MERMAID_SHARED_CLASS;
      }
      if (name === undefined) continue;
      const members = classes.get(name) ?? [];
      members.push(context.nodes.get(node.id)?.shortId ?? node.id);
      classes.set(name, members);
    }
  }
  return classes;
}

/** A `subgraph` titled `title` around `lines`, which sit one indent in. */
function subgraphLines(
  id: string,
  title: string,
  lines: readonly string[],
): string[] {
  return [
    `subgraph ${id}["${escapeMermaidText(title)}"]`,
    ...lines.map((line) => `${RENDER_MERMAID_INDENT}${line}`),
    "end",
  ];
}

/** Undirected edges chained into trails, one trail to a line, each link with its text. */
function trails(
  { hideLabels }: GraphNeighborhood,
  chains: readonly (readonly FlowchartLink[])[],
  drawing: FlowchartDrawing,
): string[] {
  const lines: string[] = [];
  for (const trail of chains) {
    const parts: string[] = [];
    for (const [position, { edge, from, to }] of trail.entries()) {
      const text = escapeMermaidText(edgeText(edge, hideLabels));
      if (position === 0) parts.push(mention(from, drawing));
      parts.push(
        `---${text === "" ? "" : `|"${text}"|`}`,
        mention(to, drawing),
      );
    }
    lines.push(parts.join(" "));
  }
  return lines;
}

/**
 * Splits undirected edges into trails, so a path draws as one chained line.
 */
function trailsOf(edges: readonly GraphEdge[]): FlowchartLink[][] {
  const walk: FlowchartWalk = {
    edges,
    incident: incidentEdges(edges),
    used: new Set<number>(),
  };
  const result: FlowchartLink[][] = [];
  for (const [index, first] of edges.entries()) {
    if (walk.used.has(index)) continue;
    walk.used.add(index);
    result.push(walkTrail(first, walk));
  }
  return result;
}

/** One trail: from `first`, on through any unused edge the last node touches. */
function walkTrail(first: GraphEdge, walk: FlowchartWalk): FlowchartLink[] {
  const trail = [{ edge: first, from: first.source, to: first.target }];
  let end = first.target;
  for (;;) {
    let found: GraphEdge | undefined;
    for (const index of walk.incident.get(end) ?? []) {
      const edge = walk.edges[index];
      if (!walk.used.has(index) && edge !== undefined) {
        walk.used.add(index);
        found = edge;
        break;
      }
    }
    if (found === undefined) return trail;
    const to = found.source === end ? found.target : found.source;
    trail.push({ edge: found, from: end, to });
    end = to;
  }
}
