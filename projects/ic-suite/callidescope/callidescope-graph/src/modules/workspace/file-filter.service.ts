import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { WorkspaceService } from "./workspace.service";

import type {
  BuildExclusionsArguments,
  BuildProjectFileFilterArguments,
  FileFilter,
  WorkspaceProject,
} from "./workspace.types";

/**
 * Decides which files a run leaves out of the graph.
 *
 * Kept apart from `WorkspaceService` because the run's exclusions are known before
 * projects are discovered, while a project's own exclusions are only readable after.
 * This service layers the two.
 */
@Injectable()
export class FileFilterService {
  // 🏗 Dependency Injection

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FileFilterService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * True when the project owning a file excludes it with its own glob, matched
   * relative to that project's root.
   */
  private isExcludedByOwningProject(args: {
    excludeByProject: ReadonlyMap<string, readonly string[]>;
    projects: readonly WorkspaceProject[];
    workspaceRelativePath: string;
  }): boolean {
    const owner = this.workspaceService.resolveOwningProject({
      projects: args.projects,
      workspaceRelativePath: args.workspaceRelativePath,
    });

    if (owner === undefined) {
      return false;
    }

    const globs = args.excludeByProject.get(owner.name);

    if (globs === undefined) {
      return false;
    }

    const projectRelativePath = path.posix.relative(
      owner.root,
      args.workspaceRelativePath,
    );

    return globs.some((glob) => path.matchesGlob(projectRelativePath, glob));
  }

  /**
   * Asks git which tracked files an ignore file excludes, rather than reimplementing
   * gitignore matching.
   */
  private listIgnoredFiles(args: {
    ignorePath: string;
    workspaceRoot: string;
  }): string[] {
    try {
      const output = execFileSync(
        "git",
        [
          "ls-files",
          "--cached",
          "--ignored",
          `--exclude-from=${args.ignorePath}`,
        ],
        { cwd: args.workspaceRoot, encoding: "utf8" },
      );

      return output.trim().split("\n").filter(Boolean);
    } catch {
      this.logger.warn("🔭 Skipped an unreadable ignore file", undefined, {
        ignorePath: args.ignorePath,
      });

      return [];
    }
  }

  // 🌎 Public Methods

  /**
   * Builds the predicate deciding which files stay out of the graph, from the run's
   * own workspace-relative exclusions.
   */
  public buildFileFilter(args: BuildExclusionsArguments): FileFilter {
    const ignored = new Set<string>();

    for (const ignoreFile of args.excludeFrom) {
      const ignorePath = path.resolve(args.workspaceRoot, ignoreFile);

      if (!existsSync(ignorePath)) {
        this.logger.warn("🔭 Skipped a missing ignore file", undefined, {
          ignoreFile,
        });
        continue;
      }

      for (const filePath of this.listIgnoredFiles({
        ignorePath,
        workspaceRoot: args.workspaceRoot,
      })) {
        ignored.add(filePath);
      }
    }

    const globs = [...args.exclude];

    return {
      isExcluded: (workspaceRelativePath: string): boolean =>
        ignored.has(workspaceRelativePath) ||
        globs.some((glob) => path.matchesGlob(workspaceRelativePath, glob)),
    };
  }

  /**
   * Layers every project's own exclusion globs over the run's filter, anchored to
   * each project's root.
   */
  public buildProjectFileFilter(
    args: BuildProjectFileFilterArguments,
  ): FileFilter {
    if (args.excludeByProject.size === 0) {
      return args.fileFilter;
    }

    return {
      isExcluded: (workspaceRelativePath: string): boolean =>
        args.fileFilter.isExcluded(workspaceRelativePath) ||
        this.isExcludedByOwningProject({
          excludeByProject: args.excludeByProject,
          projects: args.projects,
          workspaceRelativePath,
        }),
    };
  }
}
