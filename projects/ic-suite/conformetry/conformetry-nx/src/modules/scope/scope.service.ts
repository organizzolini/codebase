import path from "node:path";

import { ConfigurationService } from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";

import { PROJECT_ROOT_PATTERN } from "./scope.constants";

import type { ProjectScope } from "../instances/instances.types";
import type { ConformetryInstanceGroup } from "@conformetry/configuration";

/**
 * Reads an instance group as Nx resolves it.
 *
 * A group with `tags` is read inside each project; one without is a workspace glob.
 */
@Injectable()
export class ScopeService {
  // 🏗 Dependency Injection

  constructor(private readonly configurationService: ConfigurationService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether a group locates its instances by project tag. */
  private isProjectGroup(group: ConformetryInstanceGroup): boolean {
    return this.configurationService.isProjectScoped(group);
  }

  // 🌎 Public Methods

  /**
   * Returns whether a group applies to a project.
   *
   * An untagged group applies everywhere; each tag a group names must be on the project.
   */
  public matchesProject(args: {
    group: ConformetryInstanceGroup;
    project: ProjectScope;
  }): boolean {
    if (!this.isProjectGroup(args.group)) {
      return true;
    }

    return (args.group.tags ?? []).every((tag) => {
      return args.project.tags.includes(tag);
    });
  }

  /**
   * Resolves one group against a project, into workspace-relative globs.
   *
   * Tagged globs are read inside the project; untagged ones are kept as written.
   */
  public resolveGroup(args: {
    group: ConformetryInstanceGroup;
    project: ProjectScope;
  }): ConformetryInstanceGroup[] {
    const patterns = args.group.patterns;

    if (
      !this.matchesProject(args) ||
      patterns === undefined ||
      patterns.length === 0
    ) {
      return [];
    }

    if (!this.isProjectGroup(args.group)) {
      return [args.group];
    }

    return [
      {
        ...args.group,
        patterns: patterns.map((pattern) => {
          return path.posix.join(args.project.root, pattern);
        }),
      },
    ];
  }

  /**
   * The folder a group's first glob points at.
   *
   * A glob starting with a wildcard places nothing, so layout falls back to inference.
   */
  public resolveScopedDirectory(
    groups: ConformetryInstanceGroup[],
  ): string | undefined {
    const group = groups.find((entry) => this.isProjectGroup(entry));
    const [pattern] = group?.patterns ?? [];

    if (pattern === undefined || pattern === PROJECT_ROOT_PATTERN) {
      return undefined;
    }

    const segments = pattern.split("/");
    const globIndex = segments.findIndex((segment) => segment.includes("*"));
    const staticSegments =
      globIndex === -1 ? segments : segments.slice(0, globIndex);

    return staticSegments.length === 0 ? undefined : staticSegments.join("/");
  }

  /**
   * The projects a generator's tagged groups admit, by name and sorted.
   *
   * Sorted so the emitted schema stays stable across re-emits.
   */
  public resolveScopedProjectNames(args: {
    groups: ConformetryInstanceGroup[];
    projects: ProjectScope[];
  }): string[] {
    const taggedGroups = args.groups.filter((group) => {
      return this.isProjectGroup(group);
    });

    if (taggedGroups.length === 0) {
      return [];
    }

    return args.projects
      .filter((project) => {
        return taggedGroups.some((group) => {
          return this.matchesProject({ group, project });
        });
      })
      .map((project) => project.name)
      .toSorted((left, right) => left.localeCompare(right));
  }
}
