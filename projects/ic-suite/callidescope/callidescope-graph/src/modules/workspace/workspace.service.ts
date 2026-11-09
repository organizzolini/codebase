import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  MISSING_PROJECT_CONFIGURATION_MESSAGE,
  ProgramConfigurationError,
} from "../program/program.constants";

import {
  EXCLUDED_SCAN_DIRECTORY_NAMES,
  PACKAGE_MANIFEST_NAME,
  PROJECT_CONFIGURATION_NAME,
  TEST_DIRECTORY_SEGMENT,
  TEST_FILE_PATTERN,
} from "./workspace.constants";

import type {
  DiscoverProjectsArguments,
  FileFilter,
  WalkImportedProjectClosureArguments,
  WorkspaceProject,
} from "./workspace.types";

/** Finds the projects a run traces, and says which one owns a file. */
@Injectable()
export class WorkspaceService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(WorkspaceService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Walks the whole workspace for every directory holding a `tsconfig.json`. */
  private findAllProjectDirectories(workspaceRoot: string): string[] {
    const found: string[] = [];

    this.findProjectDirectories({
      directory: workspaceRoot,
      found,
      workspaceRoot,
    });

    return found;
  }

  /**
   * Walks a directory recursively, collecting every subdirectory holding a
   * `tsconfig.json`, including nested ones.
   */
  private findProjectDirectories(args: {
    directory: string;
    found: string[];
    workspaceRoot: string;
  }): void {
    if (existsSync(path.join(args.directory, PROJECT_CONFIGURATION_NAME))) {
      args.found.push(
        this.toWorkspaceRelative({
          absolutePath: args.directory,
          workspaceRoot: args.workspaceRoot,
        }),
      );
    }

    for (const entry of readdirSync(args.directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || this.isExcludedFromScan(entry.name)) {
        continue;
      }

      this.findProjectDirectories({
        directory: path.join(args.directory, entry.name),
        found: args.found,
        workspaceRoot: args.workspaceRoot,
      });
    }
  }

  /**
   * True when a project may join another's closure. Roots without a `package.json`,
   * and the workspace root, are refused.
   */
  private isClosureDestination(project: WorkspaceProject): boolean {
    return project.root !== "" && project.hasPackageManifest;
  }

  /**
   * True when a project's root is a path-segment prefix of a file's path; the empty
   * root contains every file.
   */
  private isContainedByRoot(args: {
    root: string;
    workspaceRelativePath: string;
  }): boolean {
    return (
      args.root === "" ||
      args.workspaceRelativePath === args.root ||
      args.workspaceRelativePath.startsWith(`${args.root}/`)
    );
  }

  /**
   * True for a directory a whole-workspace scan should never enter, including
   * scaffolding placeholders named with `{{` and `}}`.
   */
  private isExcludedFromScan(directoryName: string): boolean {
    return (
      directoryName.startsWith(".") ||
      directoryName.includes("{{") ||
      (EXCLUDED_SCAN_DIRECTORY_NAMES as readonly string[]).includes(
        directoryName,
      )
    );
  }

  /** True when an exclusion already names the project's own `tsconfig.json`. */
  private isExcludedProject(args: {
    configurationPath: string;
    fileFilter: FileFilter | undefined;
    workspaceRoot: string;
  }): boolean {
    return (
      args.fileFilter?.isExcluded(
        this.toWorkspaceRelative({
          absolutePath: args.configurationPath,
          workspaceRoot: args.workspaceRoot,
        }),
      ) === true
    );
  }

  // 🌎 Public Methods

  /**
   * Resolves the project directories a run will trace. Named directories are trusted,
   * and one with no `tsconfig.json` ends the run.
   */
  public discoverProjects(args: DiscoverProjectsArguments): WorkspaceProject[] {
    const roots =
      args.directories.length > 0
        ? args.directories.map((directory) =>
            this.toWorkspaceRelative({
              absolutePath: path.resolve(args.workspaceRoot, directory),
              workspaceRoot: args.workspaceRoot,
            }),
          )
        : this.findAllProjectDirectories(args.workspaceRoot);

    const projects: WorkspaceProject[] = [];

    for (const root of roots) {
      const configurationPath = path.join(
        args.workspaceRoot,
        root,
        PROJECT_CONFIGURATION_NAME,
      );

      if (
        this.isExcludedProject({
          configurationPath,
          fileFilter: args.fileFilter,
          workspaceRoot: args.workspaceRoot,
        })
      ) {
        this.logger.debug("🔭 Skipped an excluded project", undefined, {
          root,
        });
        continue;
      }

      if (!existsSync(configurationPath)) {
        throw new ProgramConfigurationError({
          configurationPath,
          messages: [MISSING_PROJECT_CONFIGURATION_MESSAGE],
        });
      }

      projects.push({
        configurationPath,
        // Read here, where each root is already being stat-ed: it is a fixed
        // fact about a project, and asking again once per file a program
        // pulled in is tens of thousands of calls for the same answer.
        hasPackageManifest: existsSync(
          path.join(args.workspaceRoot, root, PACKAGE_MANIFEST_NAME),
        ),
        name: root,
        root,
      });
    }

    // Sorted so that a report's per-project rows — and anything else keyed
    // off this order — read the same on every run, rather than however the
    // filesystem happened to enumerate directories this time.
    return projects.toSorted((first, second) =>
      first.name.localeCompare(second.name),
    );
  }

  /** True when a path names a test file, or scaffolding written for tests. */
  public isTestFile(filePath: string): boolean {
    return (
      TEST_FILE_PATTERN.test(filePath) ||
      filePath.split("/").includes(TEST_DIRECTORY_SEGMENT)
    );
  }

  /**
   * Names the traced project whose root most narrowly contains a file, or
   * `undefined` when none does.
   */
  public resolveOwningProject(args: {
    projects: readonly WorkspaceProject[];
    workspaceRelativePath: string;
  }): undefined | WorkspaceProject {
    let owner: undefined | WorkspaceProject;

    for (const project of args.projects) {
      if (
        !this.isContainedByRoot({
          root: project.root,
          workspaceRelativePath: args.workspaceRelativePath,
        })
      ) {
        continue;
      }

      if (owner === undefined || project.root.length > owner.root.length) {
        owner = project;
      }
    }

    return owner;
  }

  /** Rewrites an absolute path as workspace-relative with POSIX separators. */
  public toWorkspaceRelative(args: {
    absolutePath: string;
    workspaceRoot: string;
  }): string {
    return path
      .relative(args.workspaceRoot, args.absolutePath)
      .split(path.sep)
      .join("/");
  }

  /**
   * Walks the projects a starting set's imports transitively reach, asking
   * `resolveProjectFiles` about each exactly once.
   */
  public walkImportedProjectClosure(
    args: WalkImportedProjectClosureArguments,
  ): void {
    const reached = new Set<string>();
    let pending = args.startingProjects;

    while (pending.length > 0) {
      const next: WorkspaceProject[] = [];

      for (const project of pending) {
        if (reached.has(project.name)) {
          continue;
        }

        reached.add(project.name);

        for (const workspaceRelativePath of args.resolveProjectFiles(project)) {
          const owner = this.resolveOwningProject({
            projects: args.workspaceProjects,
            workspaceRelativePath,
          });

          if (
            owner !== undefined &&
            !reached.has(owner.name) &&
            this.isClosureDestination(owner)
          ) {
            next.push(owner);
          }
        }
      }

      pending = next;
    }
  }
}
