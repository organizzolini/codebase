// 🏷️ Types

/** Arguments for building the set of paths a run will not trace. */
export interface BuildExclusionsArguments {
  readonly exclude: readonly string[];
  readonly excludeFrom: readonly string[];
  readonly workspaceRoot: string;
}

/** Arguments for layering each project's own exclusions over a run's. */
export interface BuildProjectFileFilterArguments {
  /** Each project's own exclusion globs, keyed by project name. A project with none is absent, not empty. */
  readonly excludeByProject: ReadonlyMap<string, readonly string[]>;
  /** The run's own filter, which every project's globs are layered over. */
  readonly fileFilter: FileFilter;
  /** Every project the run reached, so a file is judged by its owning project, not the root that contains it. */
  readonly projects: readonly WorkspaceProject[];
}

/** Arguments for discovering the projects a run will trace. */
export interface DiscoverProjectsArguments {
  /**
   * Project directories to trace, workspace-relative or absolute. Every
   * directory under the workspace root holding its own `tsconfig.json`
   * when empty.
   */
  readonly directories: readonly string[];
  /** Judges each project by its `tsconfig.json`, so excluded projects are never read, not even to be refused. */
  readonly fileFilter?: FileFilter | undefined;
  readonly workspaceRoot: string;
}

/** Decides whether a file is traced. */
export interface FileFilter {
  /** True when the file should be left out of the graph. */
  readonly isExcluded: (workspaceRelativePath: string) => boolean;
}

/** Reports the workspace-relative paths one project's program pulled in, however that program was built. */
export type ResolveProjectFilesFunction = (
  project: WorkspaceProject,
) => readonly string[];

/** Arguments for walking the projects a set of starting roots' imports reach. */
export interface WalkImportedProjectClosureArguments {
  /** Reports the workspace-relative paths one project's program pulled in. */
  readonly resolveProjectFiles: ResolveProjectFilesFunction;
  /** Project roots the traversal begins from. Always present in the result. */
  readonly startingProjects: readonly WorkspaceProject[];
  /** Every workspace project, so a pulled-in file can resolve to a project not yet visited. */
  readonly workspaceProjects: readonly WorkspaceProject[];
}

/** One project discovered from a directory holding its own `tsconfig.json`. */
export interface WorkspaceProject {
  /** Absolute path to the project's `tsconfig.json`. */
  readonly configurationPath: string;
  /** Whether the project's root holds a `package.json`, read once at discovery. Consulted per path, so it is data, not a filesystem read. */
  readonly hasPackageManifest: boolean;
  /** Same as `root`: the project's own directory is its identity. */
  readonly name: string;
  /** Workspace-relative project root, POSIX separators. */
  readonly root: string;
}
