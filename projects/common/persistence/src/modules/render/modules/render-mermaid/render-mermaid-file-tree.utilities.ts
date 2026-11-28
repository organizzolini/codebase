// 🌎 Utilities

import {
  findNeighborhoods,
  packNeighborhoods,
} from "./render-mermaid-sections.utilities";
import {
  RENDER_MERMAID_SECTION_NODES,
  RENDER_MERMAID_TREE_BRANCH,
  RENDER_MERMAID_TREE_GAP,
  RENDER_MERMAID_TREE_GUIDE,
  RENDER_MERMAID_TREE_LAST_BRANCH,
} from "./render-mermaid.constants";

import type {
  FileTreePlan,
  FileTreePosition,
  FileTreeView,
  GraphEdge,
  GraphMermaidOptions,
  GraphMermaidRendering,
  GraphMermaidSection,
  GraphModel,
  GraphNeighborhood,
  GraphNode,
} from "./render-mermaid.types";

/**
 * Draws `graph` as a text tree, one line per node.
 * @throws Error on a duplicate node id, or an edge naming no node.
 */
export function renderGraphFileTree(
  graph: GraphModel,
  options: GraphMermaidOptions = {},
): GraphMermaidRendering {
  const nodes = indexNodes(graph.nodes);
  const sectioned = options.sections === true;
  const groups = packNeighborhoods(
    findNeighborhoods(graph),
    sectioned ? RENDER_MERMAID_SECTION_NODES : Number.POSITIVE_INFINITY,
  );
  const sections: GraphMermaidSection[] = [];
  for (const { neighborhoods } of groups) {
    sections.push({
      diagram: fileTreeLines(neighborhoods, nodes).join("\n"),
      titles: neighborhoods.map(({ title }) => title),
    });
  }
  const diagram = sections.map((section) => section.diagram).join("\n");
  return {
    diagram,
    language: "text",
    ...(sectioned ? { sections } : {}),
    warnings: [...graph.warnings],
  };
}

/**
 * Draws one node's line, then those of the nodes placed under it, each under
 * its own branch and the guides of the lines above.
 */
function drawNode(
  id: string,
  view: FileTreeView,
  { below, branch, lead, under }: FileTreePosition,
): void {
  const node = view.nodes.get(id);
  if (node === undefined) throw new Error(`Node "${id}" is not a node`);
  const others: string[] = [];
  for (const parent of view.plan.parents.get(id) ?? []) {
    if (parent !== under) {
      others.push(view.nodes.get(parent)?.label ?? parent);
    }
  }
  view.lines.push(`${lead}${branch}${fileTreeText(node, others)}`);
  const kids = view.plan.placed.get(id) ?? [];
  for (const [position, child] of kids.entries()) {
    const last = position === kids.length - 1;
    drawNode(child, view, {
      below: last ? RENDER_MERMAID_TREE_GAP : RENDER_MERMAID_TREE_GUIDE,
      branch: last
        ? RENDER_MERMAID_TREE_LAST_BRANCH
        : RENDER_MERMAID_TREE_BRANCH,
      lead: `${lead}${below}`,
      under: id,
    });
  }
}

/** The tree of the neighborhoods' nodes and edges, as lines. */
function fileTreeLines(
  neighborhoods: readonly GraphNeighborhood[],
  nodes: ReadonlyMap<string, GraphNode>,
): string[] {
  const members: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  for (const neighborhood of neighborhoods) {
    for (const node of neighborhood.nodes) members.push(node);
    for (const edge of neighborhood.edges) edges.push(edge);
  }
  const view: FileTreeView = {
    lines: [],
    nodes,
    plan: placeNodes(members, edges),
  };
  for (const id of view.plan.roots) {
    drawNode(id, view, { below: "", branch: "", lead: "", under: undefined });
  }
  return view.lines;
}

/** A node's label, its icon in brackets, its note after a dash, and the labels of the other parents it is also under. */
function fileTreeText(node: GraphNode, others: readonly string[]): string {
  const icon =
    node.icon === undefined || node.icon === "" ? "" : ` [${node.icon}]`;
  const note =
    node.note === undefined || node.note === "" ? "" : ` — ${node.note}`;
  const also = others.length === 0 ? "" : ` (also under ${others.join(", ")})`;
  return `${node.label}${icon}${note}${also}`.replaceAll(/\r?\n/g, " ");
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

/** Each node's children and parents, in edge order, parents once. */
function linkNodes(edges: readonly GraphEdge[]): {
  children: Map<string, string[]>;
  parents: Map<string, string[]>;
} {
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const { source, target } of edges) {
    children.set(source, [...(children.get(source) ?? []), target]);
    const above = parents.get(target) ?? [];
    if (!above.includes(source)) parents.set(target, [...above, source]);
  }
  return { children, parents };
}

/** Gives each node its one place, under the first parent that reaches it. */
function placeNodes(
  members: readonly GraphNode[],
  edges: readonly GraphEdge[],
): FileTreePlan {
  const { children, parents } = linkNodes(edges);
  const placed = new Map<string, string[]>();
  const roots: string[] = [];
  const seen = new Set<string>();
  const place = (id: string): void => {
    seen.add(id);
    for (const child of children.get(id) ?? []) {
      if (seen.has(child)) continue;
      placed.set(id, [...(placed.get(id) ?? []), child]);
      place(child);
    }
  };
  for (const { id } of members) {
    if (!parents.has(id)) {
      roots.push(id);
      place(id);
    }
  }
  for (const { id } of members) {
    if (!seen.has(id)) {
      roots.push(id);
      place(id);
    }
  }
  return { parents, placed, roots };
}
