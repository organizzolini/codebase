// 🌎 Utilities

import {
  RENDER_MERMAID_FILE_TREE_HEADER,
  RENDER_MERMAID_INDENT,
} from "./render-mermaid.constants";
import { limitWarnings } from "./render-mermaid.utilities";

import type {
  GraphEdge,
  GraphMermaidRendering,
  GraphModel,
  GraphNode,
} from "./render-mermaid.types";

/**
 * Draws `graph` as a `treeView-beta` file tree, directories ending in `/`.
 * @throws Error on a duplicate node id, or an edge naming no node.
 */
export function renderGraphFileTree(graph: GraphModel): GraphMermaidRendering {
  const nodes = indexNodes(graph.nodes);
  const { children, nested } = nestEdges(graph.edges, nodes);

  const lines = [RENDER_MERMAID_FILE_TREE_HEADER];
  // A node with several parents is listed under each, with what is beneath it; a walk that meets a node it is inside of ends there.
  const draw = (
    node: GraphNode,
    level: number,
    above: ReadonlySet<string>,
  ): void => {
    if (above.has(node.id)) return;
    const below = children.get(node.id) ?? [];
    lines.push(
      `${RENDER_MERMAID_INDENT.repeat(level)}${fileTreeLabel(fileTreeText(node, below.length > 0), false)}`,
    );
    for (const child of below)
      draw(
        requireNode(nodes, child, "Edge"),
        level + 1,
        new Set([...above, node.id]),
      );
  };
  for (const node of graph.nodes) {
    if (!nested.has(node.id)) draw(node, 1, new Set());
  }

  const diagram = lines.join("\n");
  return {
    diagram,
    warnings: [...graph.warnings, ...limitWarnings(0, diagram.length)],
  };
}

/** A quoted label, `/`-ended for a directory; a `"` in it means single quotes. */
function fileTreeLabel(label: string, directory: boolean): string {
  const text = `${label.replaceAll(/\r?\n/g, " ")}${directory ? "/" : ""}`;
  if (!text.includes('"')) return `"${text}"`;
  return `'${text.replaceAll("'", "’")}'`;
}

/** A node's label, `/`-ended for a directory, then its icon in brackets and its note after a dash, when it has them. */
function fileTreeText(node: GraphNode, directory: boolean): string {
  const icon =
    node.icon === undefined || node.icon === "" ? "" : ` [${node.icon}]`;
  const note =
    node.note === undefined || node.note === "" ? "" : ` — ${node.note}`;
  return `${node.label}${directory ? "/" : ""}${icon}${note}`;
}

/** Indexes `nodes` by id, rejecting a repeated id. */
function indexNodes(nodes: readonly GraphNode[]): Map<string, GraphNode> {
  const byId = new Map<string, GraphNode>();
  for (const node of nodes) {
    if (byId.has(node.id)) throw new Error(`Duplicate node id "${node.id}"`);
    byId.set(node.id, node);
  }
  return byId;
}

/** Each node's children in edge order, and the ids that are some node's child. */
function nestEdges(
  edges: readonly GraphEdge[],
  nodes: ReadonlyMap<string, GraphNode>,
): { children: Map<string, string[]>; nested: Set<string> } {
  const children = new Map<string, string[]>();
  const nested = new Set<string>();
  for (const { source, target } of edges) {
    requireNode(nodes, source, "Edge source");
    requireNode(nodes, target, "Edge target");
    children.set(source, [...(children.get(source) ?? []), target]);
    nested.add(target);
  }
  return { children, nested };
}

/** The node `id` names, rejecting an id no node has. */
function requireNode(
  nodes: ReadonlyMap<string, GraphNode>,
  id: string,
  role: string,
): GraphNode {
  const node = nodes.get(id);
  if (node === undefined) throw new Error(`${role} "${id}" is not a node`);
  return node;
}
