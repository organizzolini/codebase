// 🌎 Utilities

import { RENDER_MERMAID_TITLE_LABELS } from "./render-mermaid.constants";

import type {
  GraphEdge,
  GraphGroup,
  GraphLanguage,
  GraphMermaidRendering,
  GraphModel,
  GraphNeighborhood,
  GraphNode,
} from "./render-mermaid.types";

/**
 * A fenced block of `diagram` in `language`, the fence one backtick longer
 * than the longest backtick run in it, and at least three.
 */
export function fencedBlock(diagram: string, language: GraphLanguage): string {
  let longest = 2;
  for (const [run] of diagram.matchAll(/`+/g)) {
    longest = Math.max(longest, run.length);
  }
  const fence = "`".repeat(longest + 1);
  return [`${fence}${language}`, diagram, fence].join("\n");
}

/**
 * Splits the model into weakly connected, titled neighborhoods.
 * @throws Error on an edge naming no node.
 */
export function findNeighborhoods(graph: GraphModel): GraphNeighborhood[] {
  const groups = groupMembers(graph);
  const several = groups.size > 1;
  const found: GraphNeighborhood[] = [];
  for (const { edges, nodes } of groups.values()) {
    const { hideLabels, title } = neighborhoodTitle(edges, nodes);
    found.push({ edges, hideLabels: several && hideLabels, nodes, title });
  }
  return found;
}

/** Text safe in a heading or link: one line, with Markdown's brackets and escapes marked by a backslash. */
export function markdownText(text: string): string {
  return text
    .replaceAll(/\s+/g, " ")
    .replaceAll(/([\\[\]<>*_`#|])/g, String.raw`\$1`)
    .trim();
}

/**
 * Packs neighborhoods in order into groups of at most `budget` nodes, at least one group.
 */
export function packNeighborhoods(
  neighborhoods: readonly GraphNeighborhood[],
  budget: number,
): GraphGroup[] {
  const groups: {
    members: GraphNeighborhood[];
    nodes: number;
    start: number;
  }[] = [];
  for (const [index, neighborhood] of neighborhoods.entries()) {
    const last = groups.at(-1);
    if (
      last !== undefined &&
      last.nodes + neighborhood.nodes.length <= budget
    ) {
      last.members.push(neighborhood);
      last.nodes += neighborhood.nodes.length;
    } else {
      groups.push({
        members: [neighborhood],
        nodes: neighborhood.nodes.length,
        start: index,
      });
    }
  }
  if (groups.length === 0) return [{ neighborhoods: [], start: 0 }];
  return groups.map(({ members, start }) => ({
    neighborhoods: members,
    start,
  }));
}

/** Writes an index of links, then each section under a heading. */
export function renderSectionsMarkdown(
  renderings: readonly GraphMermaidRendering[],
  headings: readonly string[],
): string {
  const slug = slugger();
  const paged = renderings.length > 1;
  const index: string[] = [];
  const body: string[] = [];
  for (const [position, rendering] of renderings.entries()) {
    const heading = paged
      ? (headings[position] ?? `Page ${position + 1}`)
      : undefined;
    const page = pageParts(rendering, heading, slug);
    index.push(page.index);
    body.push(...page.body);
  }
  const lines = [...index, ...body, ...warningLines(renderings)];
  return `${lines.join("\n").trimEnd()}\n`;
}

/** The sections of every rendering, none for one without. */
export function sectionCount(
  renderings: readonly GraphMermaidRendering[],
): number {
  let total = 0;
  for (const { sections } of renderings) total += sections?.length ?? 0;
  return total;
}

/** GitHub's heading anchors: lowercase, punctuation dropped, spaces dashed, repeats suffixed `-1`, `-2`. */
export function slugger(): (heading: string) => string {
  const seen = new Map<string, number>();
  return (heading) => {
    const base = heading
      .toLowerCase()
      .replaceAll(/[^\p{L}\p{N}\s_-]/gu, "")
      .trim()
      .replaceAll(/\s/g, "-");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** The warnings of renderings as blockquote lines, after a blank line when there are any. */
export function warningLines(
  renderings: readonly GraphMermaidRendering[],
): string[] {
  const lines: string[] = [];
  for (const { warnings } of renderings) {
    for (const warning of warnings) {
      lines.push(`> ⚠️ ${warning.replaceAll(/\r?\n/g, " ")}`);
    }
  }
  return lines.length === 0 ? lines : ["", ...lines];
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

/** The nodes and edges of each weakly connected group, in order of its first node. */
function groupMembers(
  graph: GraphModel,
): Map<string, { edges: GraphEdge[]; nodes: GraphNode[] }> {
  const parents = new Map(graph.nodes.map((node) => [node.id, node.id]));
  for (const edge of graph.edges) {
    if (!parents.has(edge.source)) {
      throw new Error(`Edge source "${edge.source}" is not a node`);
    }
    if (!parents.has(edge.target)) {
      throw new Error(`Edge target "${edge.target}" is not a node`);
    }
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
  return groups;
}

/**
 * The shared edge label, else the few labels joined, else the first root's label.
 */
function neighborhoodTitle(
  edges: readonly GraphEdge[],
  nodes: readonly GraphNode[],
): { hideLabels: boolean; title: string } {
  const truncations = new Set(
    nodes.filter(({ marker }) => marker === "truncation").map(({ id }) => id),
  );
  const labelled = edges.filter(({ target }) => !truncations.has(target));
  const labels = [...new Set(labelled.map(({ label }) => label ?? ""))];
  const [shared] = labels;
  if (shared !== undefined && shared !== "" && labels.length === 1) {
    return { hideLabels: true, title: shared };
  }
  if (
    labels.length > 0 &&
    labels.length <= RENDER_MERMAID_TITLE_LABELS &&
    !labels.includes("")
  ) {
    return { hideLabels: false, title: labels.join(", ") };
  }
  const first = nodes.find((node) => node.marker === "root") ?? nodes[0];
  return { hideLabels: false, title: first?.label ?? "" };
}

/** One rendering's index entry and body, under a page heading when paged. */
function pageParts(
  rendering: GraphMermaidRendering,
  heading: string | undefined,
  slug: (heading: string) => string,
): { body: string[]; index: string } {
  const sections = rendering.sections ?? [];
  const pageSlug = heading === undefined ? "" : slug(heading);
  const body = heading === undefined ? [] : ["", `## ${markdownText(heading)}`];
  const alone = heading !== undefined && sections.length === 1;
  const links: string[] = [];
  for (const section of sections) {
    const title = section.titles.join(", ");
    const anchor = alone ? pageSlug : slug(title);
    if (!alone) {
      body.push(
        "",
        `${heading === undefined ? "##" : "###"} ${markdownText(title)}`,
      );
    }
    body.push("", fencedBlock(section.diagram, rendering.language));
    for (const part of section.titles) {
      links.push(`[${markdownText(part)}](#${anchor})`);
    }
  }
  const joined = links.join(" · ");
  return {
    body,
    index:
      heading === undefined
        ? joined
        : `- [${markdownText(heading)}](#${pageSlug}): ${joined}`,
  };
}
