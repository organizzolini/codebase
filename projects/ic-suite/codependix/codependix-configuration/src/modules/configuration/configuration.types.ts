// 🏷️ Types

import type {
  CodependixBoundariesConfiguration,
  ResolvedCodependixBoundariesConfiguration,
} from "./configuration-boundaries.types";

/** Authored `codependix.config.ts`; every field optional, and none writes nothing. */
export interface CodependixConfiguration {
  /**
   * Rules every built graph is judged against, keyed by graph level. A violation
   * fails the run; it is never written to an export.
   */
  boundaries?: CodependixBoundariesConfiguration | undefined;
  /** Project names or roots excluded from every graph, as globs. */
  exclude?: string[] | undefined;
  /** Project names or roots participating in graph export, as globs. */
  include?: string[] | undefined;
  /**
   * How `nestjsModules` finds each application's container. A project not
   * named here is treated as a library.
   */
  nestjsModules?: CodependixNestjsModulesConfiguration | undefined;
  /**
   * Path, relative to the workspace root, of an `nx graph --file` JSON to read
   * instead of resolving the working directory's graph.
   */
  projectGraph?: string | undefined;
  /**
   * Export configuration for the Workspace Graph, exported once for the whole
   * repository. Unaffected by `include`/`exclude`; `--projects`/`--tags` narrow its nodes.
   */
  workspace?: CodependixWorkspaceConfiguration | undefined;
}

/** Per-field CLI overrides; only fields the file already declared. */
export interface CodependixConfigurationOverrides {
  /** Overrides `exclude` for this run. */
  exclude?: string[] | undefined;
  /** Overrides `include` for this run. */
  include?: string[] | undefined;
}

/** Where a graph type's export lands; named explicitly, not inferred. */
export type CodependixExportTarget = "both" | "json" | "markdown" | "none";

/** How one graph type's export is configured for a project. */
export interface CodependixGraphOutput {
  json?: CodependixJsonOutput | undefined;
  markdown?: CodependixMarkdownOutput | undefined;
  target?: CodependixExportTarget | undefined;
}

/** A level of dependency graph codependix can build. */
export type CodependixGraphType =
  | "fileImports"
  | "nestjsModules"
  | "nxProjects";

/** Where a graph's JSON export is written. */
export interface CodependixJsonOutput {
  path: string;
}

/** Markdown export; with `anchor`, spliced into that block of `path`. */
export interface CodependixMarkdownOutput {
  anchor?: string | undefined;
  path?: string | undefined;
}

/** How the NestJS module graph finds the applications it explores. */
export interface CodependixNestjsModulesConfiguration {
  /**
   * The root module of each NestJS application, keyed by Nx project name.
   * A `framework:nestjs` project not named here is a library.
   */
  rootModules?: Record<string, CodependixNestjsRootModule> | undefined;
}

/** Where one NestJS application's root module lives. */
export interface CodependixNestjsRootModule {
  /** Name of the class the file exports. */
  export: string;
  /** Path of the root module file, relative to the project root. */
  file: string;
}

/** A project's exports by graph type; `Partial<Record>` would reject unset. */
export interface CodependixProjectConfiguration {
  fileImports?: CodependixGraphOutput | undefined;
  nestjsModules?: CodependixGraphOutput | undefined;
  nxProjects?: CodependixGraphOutput | undefined;
}

/** `--projects` and `--tags` as captured: comma-separated, split later. */
export interface CodependixSelectionArguments {
  /** `false` for `--no-dependencies` — see `ResolvedCodependixSelection`. */
  dependencies?: boolean | undefined;
  projects?: string | undefined;
  tags?: string | undefined;
}

/** Workspace Graph exports, by graph type, each spanning all projects. */
export interface CodependixWorkspaceConfiguration {
  fileImports?: CodependixGraphOutput | undefined;
  nestjsModules?: CodependixGraphOutput | undefined;
  nxProjects?: CodependixGraphOutput | undefined;
}

/** Arguments accepted when loading a configuration file. */
export interface LoadConfigurationArguments {
  /** The main configuration file, resolved against the cwd then the workspace root. */
  configurationPath: string;
  /** Strict per-field CLI overrides, applied after the file is resolved. */
  overrides?: CodependixConfigurationOverrides | undefined;
  /** Command-line project selection, unparsed — see `CodependixSelectionArguments`. */
  selection?: CodependixSelectionArguments | undefined;
}

/** Arguments accepted when loading one project's own configuration file. */
export interface LoadProjectConfigurationArguments {
  /** The project's root, absolute or resolved against the process cwd. */
  projectRoot: string;
}

/** Command-line options `codependix` accepts. */
export interface MapCommandOptions {
  /**
   * The findings `--check` gates, unparsed. `true` (a bare flag) is refused,
   * not read as a shorthand; see `ConfigurationService.selectMode`.
   */
  check?: string | true | undefined;
  config?: string | undefined;
  /**
   * Whether `--projects`/`--tags` also build their dependency closure; `false`
   * for `--no-dependencies`. Inert without a selection.
   */
  dependencies?: boolean | undefined;
  directory?: string | undefined;
  /** Overrides `exclude` for this run. Refused when never configured. */
  exclude?: string[] | undefined;
  /**
   * Builds, checks, and writes the `fileImports` graph type for this run.
   * Unset leaves it enabled.
   */
  fileImports?: boolean | undefined;
  /**
   * What `--format` prints to standard output, unparsed. Defaults to
   * `"markdown"`, a fixed constant rather than a configured field.
   */
  format?: string | undefined;
  /** Overrides `include` for this run. Refused when never configured. */
  include?: string[] | undefined;
  /**
   * Writes every active graph type's data, combined into one JSON file at
   * this path, keyed by graph type name.
   */
  jsonOutput?: string | undefined;
  /**
   * Writes every active graph type's rendered diagram into one Markdown file
   * at this path, each as an anchor-spliced section.
   */
  markdownOutput?: string | undefined;
  /** Builds, checks, and writes the `nestjsModules` graph type for this run. */
  nestjsModules?: boolean | undefined;
  /** Builds, checks, and writes the `nxProjects` graph type for this run. */
  nxProjects?: boolean | undefined;
  /**
   * Projects to export for beyond what `include` already selects, unparsed.
   *
   * Comma-separated globs matched against a project's name or its
   * workspace-relative root.
   */
  projects?: string | undefined;
  /** Nx tags to export for beyond what `include` selects, unparsed. */
  tags?: string | undefined;
  write?: boolean | undefined;
}

/** Arguments accepted when resolving one project's export configuration. */
export interface ProjectSelectionArguments {
  configuration: ResolvedCodependixConfiguration;
  projectName: string;
  /**
   * The project's root, relative to the workspace. Optional for a caller that
   * knows the project only by name.
   */
  projectRoot?: string | undefined;
  /**
   * The project's own Nx tags, for matching `--tags`. Optional, as `projectRoot` is.
   */
  projectTags?: string[] | undefined;
}

/** Configuration with defaults applied; per-project state lives elsewhere. */
export interface ResolvedCodependixConfiguration {
  boundaries: ResolvedCodependixBoundariesConfiguration;
  exclude: string[];
  include: string[];
  /** The root module of each NestJS application, keyed by Nx project name. */
  nestjsRootModules: Record<string, CodependixNestjsRootModule>;
  /** A project graph to read instead of the working directory's, if named. */
  projectGraph: string | undefined;
  /**
   * What `--projects` and `--tags` named, resolved. Carried here so every
   * consumer of the configuration sees the same selection.
   */
  selection: ResolvedCodependixSelection;
  workspace: CodependixWorkspaceConfiguration;
}

/** A graph type's export configuration with every default applied. */
export interface ResolvedCodependixGraphOutput {
  json: ResolvedCodependixJsonOutput | undefined;
  markdown: ResolvedCodependixMarkdownOutput | undefined;
  target: CodependixExportTarget;
}

/** JSON output destination, unresolved beyond what `CodependixJsonOutput` is. */
export type ResolvedCodependixJsonOutput = CodependixJsonOutput;

/** Markdown output destination with its path defaulted. */
export interface ResolvedCodependixMarkdownOutput {
  anchor: string | undefined;
  path: string;
}

/** Project selection; empty means no selection, not one matching nothing. */
export interface ResolvedCodependixSelection {
  /**
   * Whether graphs build over the selected projects' dependency closure, or
   * over them alone. Only selected projects are judged; dependencies get notes.
   */
  dependencies: boolean;
  /** Globs matched against a project's name or its workspace-relative root. */
  projects: string[];
  /** Nx tags, matched exactly against a project's own. */
  tags: string[];
}

/** Arguments for resolving one project's export configuration. */
export interface ResolveForProjectArguments extends ProjectSelectionArguments {
  graphType: CodependixGraphType;
  /**
   * The project's own loaded `codependix.config.ts`, or `undefined` when it has
   * none. Read as-is, never merged; no file means `target: "none"`.
   */
  projectConfiguration: CodependixProjectConfiguration | undefined;
}
