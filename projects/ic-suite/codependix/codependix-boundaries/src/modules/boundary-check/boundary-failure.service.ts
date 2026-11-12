import path from "node:path";
import { fileURLToPath } from "node:url";

import { NeighborhoodService } from "@codependix/nx-projects";
import { Injectable } from "@nestjs/common";

import {
  FRAME_POSITION,
  NODE_MODULES_SEGMENT,
  STACK_FRAME_PREFIX,
} from "./boundary-check.constants";

import type {
  BoundaryCheckFailure,
  CollectFailureArguments,
} from "./boundary-check.types";
import type { NxProject } from "@codependix/nx-projects";

/**
 * Turns an error a graph builder raised into the failure a run reports, charged to the project
 * being built. A module failing in a dependency rethrows into every importer, so the first stack
 * frame inside a dependency's root names the owner. Only the dependency closure is searched.
 */
@Injectable()
export class BoundaryFailureService {
  // 🏗 Dependency Injection

  constructor(private readonly neighborhoodService: NeighborhoodService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The innermost project whose root holds a file, or nothing for a file no project holds or one in `node_modules`.
   */
  private findProjectHolding(
    filePath: string,
    workspaceProjects: readonly NxProject[],
  ): string | undefined {
    if (filePath.includes(NODE_MODULES_SEGMENT)) {
      return undefined;
    }

    const holders = workspaceProjects.filter((project) =>
      filePath.startsWith(`${project.absoluteRoot}${path.sep}`),
    );

    return holders.toSorted(
      (first, second) => second.absoluteRoot.length - first.absoluteRoot.length,
    )[0]?.name;
  }

  /**
   * A stack line's location, without line and column. Plain string operations: any single regex
   * backtracks on a crafted stack line.
   */
  private readFrameLocation(line: string): string | undefined {
    const frame = line.trim();

    if (!frame.startsWith(STACK_FRAME_PREFIX)) return undefined;

    const body = frame.slice(STACK_FRAME_PREFIX.length);
    const location = body.endsWith(")")
      ? body.slice(body.lastIndexOf("(") + 1, -1)
      : body;
    const columnAt = location.lastIndexOf(":");
    const lineAt = location.lastIndexOf(":", columnAt - 1);
    const isPositioned =
      lineAt > 0 &&
      FRAME_POSITION.test(location.slice(lineAt + 1, columnAt)) &&
      FRAME_POSITION.test(location.slice(columnAt + 1));

    return isPositioned ? location.slice(0, lineAt) : undefined;
  }

  /**
   * The absolute path a stack line names, or nothing. A malformed frame is dropped, never the
   * failure it belongs to.
   */
  private readFramePath(line: string): string | undefined {
    const location = this.readFrameLocation(line);

    if (location?.startsWith("file:") === true) {
      try {
        return fileURLToPath(location);
      } catch {
        return undefined;
      }
    }

    return location !== undefined && path.isAbsolute(location)
      ? location
      : undefined;
  }

  /**
   * The project owning the first stack frame inside any charged project's dependency closure.
   * Frames below it are importers, so only the first counts.
   */
  private resolveOwnerProject(
    args: CollectFailureArguments,
  ): string | undefined {
    const closure = new Set(
      this.neighborhoodService.resolveDependencyClosure(
        args.graph,
        args.projects,
      ),
    );
    const candidates = args.workspaceProjects.filter((project) =>
      closure.has(project.name),
    );
    const stack = args.error instanceof Error ? (args.error.stack ?? "") : "";

    for (const line of stack.split("\n")) {
      const framePath = this.readFramePath(line);
      const owner =
        framePath === undefined
          ? undefined
          : this.findProjectHolding(framePath, candidates);

      if (owner !== undefined) {
        return owner;
      }
    }

    return undefined;
  }

  // 🌎 Public Methods

  /**
   * Collects one graph's failure, charged to its projects. `ownerProject` is set only when it names
   * an uncharged project.
   */
  public collect(args: CollectFailureArguments): BoundaryCheckFailure {
    const owner = this.resolveOwnerProject(args);

    return {
      error:
        args.error instanceof Error ? args.error.message : String(args.error),
      level: args.level,
      ...(owner !== undefined &&
        !args.projects.includes(owner) && { ownerProject: owner }),
      projects: args.projects,
    };
  }
}
