import { Injectable } from "@nestjs/common";
import { createProjectGraphAsync } from "@nx/devkit";

import type {
  NxProject,
  ResolvedProjectDirectories,
  ResolvedProjectSelection,
} from "./projects.types";
import type { ProjectGraph } from "@nx/devkit";

/**
 * Resolves Nx project names to the directories a callidescope run traces.
 *
 * This is the only part of callidescope that knows about Nx. The CLI and graph
 * packages take plain directories, so this turns a stable project name into one.
 *
 * The project graph is passed in, so resolution rules are testable without a workspace.
 */
@Injectable()
export class ProjectsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Every tag any project carries, sorted and deduplicated. */
  private readTags(projects: readonly NxProject[]): string[] {
    return [...new Set(projects.flatMap((project) => project.tags))].toSorted(
      (first, second) => first.localeCompare(second),
    );
  }

  /**
   * Collects projects carrying any of the given tags, and the tags nothing carries. Any, not all,
   * since tag families exclude each other.
   */
  private resolveTaggedNames(args: {
    projects: readonly NxProject[];
    tags: readonly string[];
  }): { names: string[]; unmatchedTags: string[] } {
    const names: string[] = [];
    const unmatchedTags: string[] = [];

    for (const tag of args.tags) {
      const tagged = args.projects.filter((project) =>
        project.tags.includes(tag),
      );

      if (tagged.length === 0) {
        unmatchedTags.push(tag);
        continue;
      }

      names.push(...tagged.map((project) => project.name));
    }

    return { names, unmatchedTags };
  }

  // 🌎 Public Methods

  /** Reads the workspace's Nx project graph. */
  public async readProjectGraph(): Promise<ProjectGraph> {
    return createProjectGraphAsync({ exitOnError: false });
  }

  /**
   * Lists every project the graph knows, sorted by name, keeping the root project,
   * which resolves to `.`.
   */
  public readProjects(graph: ProjectGraph): NxProject[] {
    return Object.entries(graph.nodes)
      .map(([name, node]) => ({
        name,
        root: node.data.root,
        tags: node.data.tags ?? [],
      }))
      .toSorted((first, second) => first.name.localeCompare(second.name));
  }

  /**
   * Widens project names to their dependencies, not dependents, since stacks run downward.
   * External `npm:` targets are dropped.
   */
  public resolveDependencyClosure(args: {
    graph: ProjectGraph;
    projectNames: readonly string[];
  }): string[] {
    const known = new Set(Object.keys(args.graph.nodes));
    const reached = new Set<string>();
    let pending = args.projectNames.filter((name) => known.has(name));

    // Walked a rank at a time rather than off a stack, so no step ever has to
    // ask whether it popped anything. A cycle terminates because a name
    // already reached is never queued again.
    while (pending.length > 0) {
      const next: string[] = [];

      for (const projectName of pending) {
        if (reached.has(projectName)) {
          continue;
        }

        reached.add(projectName);

        for (const dependency of args.graph.dependencies[projectName] ?? []) {
          if (known.has(dependency.target)) {
            next.push(dependency.target);
          }
        }
      }

      pending = next;
    }

    return [...reached].toSorted((first, second) =>
      first.localeCompare(second),
    );
  }

  /**
   * Resolves project names and tags to workspace-relative roots, merging them and collecting
   * unknown names rather than throwing.
   */
  public resolveDirectories(args: {
    graph: ProjectGraph;
    projectNames?: readonly string[] | undefined;
    tags?: readonly string[] | undefined;
  }): ResolvedProjectDirectories {
    const selection = this.resolveProjectNames(args);

    return {
      ...selection,
      directories: this.toDirectories({
        graph: args.graph,
        projectNames: selection.projectNames,
      }),
    };
  }

  /**
   * Resolves names and tags to project names, kept separate from directories because widening
   * happens in names.
   */
  public resolveProjectNames(args: {
    graph: ProjectGraph;
    projectNames?: readonly string[] | undefined;
    tags?: readonly string[] | undefined;
  }): ResolvedProjectSelection {
    const projects = this.readProjects(args.graph);
    const known = new Set(projects.map((project) => project.name));
    const selected = new Set<string>();
    const unknownNames: string[] = [];

    for (const projectName of args.projectNames ?? []) {
      if (known.has(projectName)) {
        selected.add(projectName);
        continue;
      }

      unknownNames.push(projectName);
    }

    const tagged = this.resolveTaggedNames({ projects, tags: args.tags ?? [] });

    for (const projectName of tagged.names) {
      selected.add(projectName);
    }

    return {
      // Already sorted, since `readProjects` sorts by name.
      knownNames: projects.map((project) => project.name),
      knownTags: this.readTags(projects),
      projectNames: [...selected].toSorted((first, second) =>
        first.localeCompare(second),
      ),
      unknownNames,
      unmatchedTags: tagged.unmatchedTags,
    };
  }

  /** Maps project names to their workspace-relative roots, sorted and deduplicated. */
  public toDirectories(args: {
    graph: ProjectGraph;
    projectNames: readonly string[];
  }): string[] {
    const rootByName = new Map(
      this.readProjects(args.graph).map((project) => [
        project.name,
        project.root,
      ]),
    );
    const directories = new Set<string>();

    for (const projectName of args.projectNames) {
      const root = rootByName.get(projectName);

      if (root !== undefined) {
        directories.add(root);
      }
    }

    return [...directories].toSorted((first, second) =>
      first.localeCompare(second),
    );
  }
}
