import { readFile } from "node:fs/promises";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { createProjectGraphAsync } from "@nx/devkit";

import {
  InvalidProjectGraphError,
  NEIGHBORHOOD_IMPLICIT_LEGEND,
  NEIGHBORHOOD_MERMAID_HEADER,
  NEIGHBORHOOD_SUBJECT_STYLE,
  NEIGHBORHOOD_UNCONNECTED,
} from "./neighborhood.constants";

import type {
  Neighborhood,
  NeighborhoodEdge,
  NxProject,
  NxProjectGraph,
} from "./neighborhood.types";

/**
 * Builds each project's one-hop Nx dependency neighborhood.
 *
 * Ported from `synchronization`'s `nx-project-graphs` command. File writing belongs to
 * `codependix-cli`, not this service. `collectEdges` and the rendering helpers are public
 * so `WorkspaceGraphService` can reuse them.
 */
@Injectable()
export class NeighborhoodService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Whether a parsed file looks like a project graph at all. Deliberately shallow:
   * it only separates Nx output from other JSON.
   */
  private isProjectGraph(value: unknown): value is NxProjectGraph {
    if (typeof value !== "object" || value === null) return false;

    const candidate = value as { dependencies?: unknown; nodes?: unknown };

    return (
      typeof candidate.dependencies === "object" &&
      candidate.dependencies !== null &&
      typeof candidate.nodes === "object" &&
      candidate.nodes !== null
    );
  }

  // 🌎 Public Methods

  /**
   * Builds every project's neighborhood from one read of the graph. The workspace root is
   * left out, as it contains every project.
   */
  buildNeighborhoods(
    graph: NxProjectGraph,
    projects: NxProject[],
  ): Map<string, Neighborhood> {
    const neighborhoods = new Map<string, Neighborhood>();
    const knownNames = new Set(projects.map((project) => project.name));

    for (const project of projects) {
      const edges = this.collectEdges(graph, knownNames, project.name);

      neighborhoods.set(project.name, {
        dependencies: this.sortNames(
          edges
            .filter((edge) => edge.source === project.name)
            .map((edge) => edge.target),
        ),
        dependents: this.sortNames(
          edges
            .filter((edge) => edge.target === project.name)
            .map((edge) => edge.source),
        ),
        edges: edges.toSorted((first, second) =>
          this.compareEdges(first, second),
        ),
        projectName: project.name,
      });
    }

    return neighborhoods;
  }

  /**
   * Collects edges between known projects. Naming `subjectName` keeps only edges where it
   * is the source or target.
   */
  collectEdges(
    graph: NxProjectGraph,
    knownNames: Set<string>,
    subjectName?: string,
  ): NeighborhoodEdge[] {
    const edges = new Map<string, NeighborhoodEdge>();

    for (const [source, dependencies] of Object.entries(graph.dependencies)) {
      for (const dependency of dependencies) {
        const touchesSubject =
          subjectName === undefined ||
          source === subjectName ||
          dependency.target === subjectName;
        if (!touchesSubject) continue;
        if (!knownNames.has(source) || !knownNames.has(dependency.target)) {
          continue;
        }
        if (source === dependency.target) continue;

        const key = `${source}->${dependency.target}`;
        // A pair can be declared both ways round; a static edge is the
        // stronger statement, so it wins over an implicit one.
        const implicit =
          dependency.type === "implicit" && (edges.get(key)?.implicit ?? true);

        edges.set(key, { implicit, source, target: dependency.target });
      }
    }

    return [...edges.values()];
  }

  /** Sorts edges by source then target so a rendered diagram never churns. */
  compareEdges(first: NeighborhoodEdge, second: NeighborhoodEdge): number {
    return (
      first.source.localeCompare(second.source) ||
      first.target.localeCompare(second.target)
    );
  }

  /**
   * Reads the working directory's project graph, or a supplied `nx graph --file` output,
   * which is only shape-checked.
   */
  async readProjectGraph(filePath?: string): Promise<NxProjectGraph> {
    if (filePath === undefined) {
      return createProjectGraphAsync({ exitOnError: false });
    }

    const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));

    if (!this.isProjectGraph(parsed)) {
      throw new InvalidProjectGraphError(filePath);
    }

    return parsed;
  }

  /** Lists every project the graph knows, apart from the workspace root. */
  readProjects(graph: NxProjectGraph, workspaceRoot: string): NxProject[] {
    return Object.entries(graph.nodes)
      .filter(([, node]) => node.data.root !== ".")
      .map(([name, node]) => ({
        absoluteRoot: path.join(workspaceRoot, node.data.root),
        name,
        tags: node.data.tags ?? [],
      }))
      .toSorted((first, second) => first.name.localeCompare(second.name));
  }

  /** Renders one edge, dotted when Nx inferred it from configuration. */
  renderEdge(edge: NeighborhoodEdge): string {
    const arrow = edge.implicit ? "-.->" : "-->";

    return `  ${this.toNodeIdentifier(edge.source)} ${arrow} ${this.toNodeIdentifier(edge.target)}`;
  }

  /** Renders a neighborhood as a fenced mermaid diagram. */
  renderMermaid(neighborhood: Neighborhood): string {
    if (neighborhood.edges.length === 0) {
      return NEIGHBORHOOD_UNCONNECTED;
    }

    const nodeNames = this.sortNames([
      ...neighborhood.dependencies,
      ...neighborhood.dependents,
      neighborhood.projectName,
    ]);
    const lines = [
      "```mermaid",
      NEIGHBORHOOD_MERMAID_HEADER,
      ...nodeNames.map((nodeName) => this.renderNode(nodeName)),
      ...neighborhood.edges.map((edge) => this.renderEdge(edge)),
      NEIGHBORHOOD_SUBJECT_STYLE,
      `  class ${this.toNodeIdentifier(neighborhood.projectName)} subject`,
      "```",
    ];

    if (neighborhood.edges.some((edge) => edge.implicit)) {
      lines.push("", NEIGHBORHOOD_IMPLICIT_LEGEND);
    }

    return lines.join("\n");
  }

  /** Declares one node, labelled with the project name it stands for. */
  renderNode(projectName: string): string {
    return `  ${this.toNodeIdentifier(projectName)}["${projectName}"]`;
  }

  /**
   * Widens project names to their transitive dependencies, never dependents. Names with no
   * graph node, such as `npm:` packages, are dropped.
   */
  resolveDependencyClosure(
    graph: NxProjectGraph,
    projectNames: readonly string[],
  ): string[] {
    const known = new Set(Object.keys(graph.nodes));
    const reached = new Set<string>();
    let pending = projectNames.filter((name) => known.has(name));

    // Walked a rank at a time; a cycle terminates because a name already
    // reached is never walked again.
    while (pending.length > 0) {
      const next: string[] = [];

      for (const projectName of pending) {
        if (reached.has(projectName)) continue;

        reached.add(projectName);
        next.push(
          ...(graph.dependencies[projectName] ?? [])
            .map((dependency) => dependency.target)
            .filter((target) => known.has(target)),
        );
      }

      pending = next;
    }

    return this.sortNames([...reached]);
  }

  /** Sorts names into a stable order, dropping duplicates. */
  sortNames(names: string[]): string[] {
    return [...new Set(names)].toSorted((first, second) =>
      first.localeCompare(second),
    );
  }

  /** Turns a project name into an identifier mermaid accepts. */
  toNodeIdentifier(projectName: string): string {
    return projectName.replaceAll(/[^\dA-Za-z]/gu, "_");
  }
}
