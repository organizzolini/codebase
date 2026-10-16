// 🏷️ Types

import type {
  CodependixBoundariesConfiguration,
  ResolvedCodependixBoundariesConfiguration,
} from "./configuration-boundaries.types";

/**
 * Configuration authored in a `codependix.config.ts` file.
 *
 * Every field is optional: a workspace with no configuration file at all
 * resolves every graph type for every project to `target: "none"`, so
 * codependix produces nothing until it is told where to write.
 */
export interface CodependixConfiguration {
  /**
   * Rules every built graph is judged against, keyed by graph level.
   *
   * Separate from a project's own `codependix.config.ts`, which says where
   * that project's export is written: a rule has no destination, and a
   * violation is reported to the console and the exit code rather than
   * published anywhere.
   */
  boundaries?: CodependixBoundariesConfiguration | undefined;
  /** Project names or roots excluded from every graph, as globs. */
  exclude?: string[] | undefined;
  /** Project names or roots participating in graph export, as globs. */
  include?: string[] | undefined;
  /**
   * How `nestjsModules` finds each application's container.
   *
   * Nothing about where an application's root module lives is assumed: a
   * project this does not name is treated as a library.
   */
  nestjsModules?: CodependixNestjsModulesConfiguration | undefined;
  /**
   * A project graph to read instead of resolving the working directory's.
   *
   * A path, relative to the workspace root, to the JSON `nx graph
   * --file=graph.json` emits. Nx resolves a project graph from the process
   * working directory and takes no directory argument, so this is the only
   * way to graph a workspace the process is not standing in — a CI job that
   * checked out one repository and graphs another, or a test with no Nx
   * workspace under it.
   *
   * A supplied graph's node roots are workspace-relative and resolve against
   * the same root every export path does.
   */
  projectGraph?: string | undefined;
  /**
   * Export configuration for the whole-workspace Workspace Graph.
   *
   * Separate from `defaults`/`projects`: the Workspace Graph is exported once
   * for the entire repository rather than once per project, so it carries no
   * per-project override and is unaffected by `include`/`exclude`.
   *
   * `--projects` and `--tags` do reach it: a run naming a selection narrows
   * the graph's node set to the projects it named. Its destination is still
   * read from `workspace` either way.
   */
  workspace?: CodependixWorkspaceConfiguration | undefined;
}

/**
 * Strict, per-field CLI overrides for a run's root configuration.
 *
 * Mirrors `@callidescope/configuration`'s override philosophy exactly: a
 * field may be overridden only when the configuration this run reads already
 * declared it — see `ConfigurationService.loadConfiguration`. An empty list is
 * read the same as the field being left off entirely, matching how
 * `--directories`/`--exclude` treat an empty list in callidescope.
 */
export interface CodependixConfigurationOverrides {
  /** Overrides `exclude` for this run. */
  exclude?: string[] | undefined;
  /** Overrides `include` for this run. */
  include?: string[] | undefined;
}

/**
 * Where a graph type's export lands for a project.
 *
 * `both` writes the JSON and the Markdown export together. Named explicitly
 * rather than inferred from which destinations are configured, so a project
 * carrying a `json` destination it does not want written yet can leave it in
 * place with the target set to `markdown`.
 */
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

/**
 * Where a graph's Markdown export is written.
 *
 * Naming `anchor` places the export inside a named anchor block in the file at
 * `path` — an existing Markdown file such as a project's `README.md`, defaulted
 * to `README.md` when `path` is left out. Leaving `anchor` unset instead writes
 * the export as the whole contents of a standalone file, whose `path` must then
 * be given explicitly since there is no default worth guessing for it.
 */
export interface CodependixMarkdownOutput {
  anchor?: string | undefined;
  path?: string | undefined;
}

/** How the NestJS module graph finds the applications it explores. */
export interface CodependixNestjsModulesConfiguration {
  /**
   * The root module each NestJS application boots from, keyed by Nx project
   * name.
   *
   * A project named here is an application, and its container is rooted in
   * this module. A `framework:nestjs` project not named here is a library, and
   * gets a synthetic root built from every module it defines instead.
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

/**
 * A project's export configuration, keyed by graph type.
 *
 * Written out field by field rather than as `Partial<Record<...>>`: under
 * `exactOptionalPropertyTypes`, `Partial` makes a field optional without
 * widening its type to include `undefined`, which then rejects the very
 * "unset" value every default-resolution path needs to assign.
 */
export interface CodependixProjectConfiguration {
  fileImports?: CodependixGraphOutput | undefined;
  nestjsModules?: CodependixGraphOutput | undefined;
  nxProjects?: CodependixGraphOutput | undefined;
}

/**
 * The `--projects` and `--tags` arguments as the command line captured them.
 *
 * Comma-separated strings rather than lists: the host captures raw option
 * text and hands it over, and splitting it is resolution, which belongs
 * beside the configuration file this package already parses.
 */
export interface CodependixSelectionArguments {
  /** `false` for `--no-dependencies` — see `ResolvedCodependixSelection`. */
  dependencies?: boolean | undefined;
  projects?: string | undefined;
  tags?: string | undefined;
}

/**
 * The Workspace Graph's export configuration, keyed by graph type.
 *
 * All three graph types are declared: `codependix-file-imports` and
 * `codependix-nestjs-modules` each build a whole-workspace aggregate graph the
 * same way `codependix-nx-projects` always has, spanning every project rather
 * than one — see each package's own `workspace-graph` module.
 */
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
   * The set of findings `--check` gates, unparsed.
   *
   * `true` is the flag written with no value at all, which is refused rather
   * than read as a shorthand — see `ConfigurationService.selectMode`.
   */
  check?: string | true | undefined;
  config?: string | undefined;
  /**
   * Whether `--projects`/`--tags` build over the named projects' dependency
   * closure too — `false` for `--no-dependencies`.
   *
   * `undefined` when neither `--dependencies` nor `--no-dependencies` was
   * given, which builds over the closure. Inert without a selection, since
   * every project is then both built and judged.
   */
  dependencies?: boolean | undefined;
  directory?: string | undefined;
  /** Overrides `exclude` for this run. Refused when never configured. */
  exclude?: string[] | undefined;
  /**
   * Builds, checks, and writes the `fileImports` graph type for this run.
   *
   * `undefined` when neither `--file-imports` nor `--no-file-imports` was
   * given, which leaves the graph type enabled — the behavior every run had
   * before this flag existed.
   */
  fileImports?: boolean | undefined;
  /**
   * What `--format` prints to standard output, unparsed.
   *
   * Defaults to `"markdown"` when the flag was left off entirely — unlike
   * codometer's `--format`, which falls back to a resolved configuration
   * field, codependix's configuration declares no such field, so the default
   * is a fixed constant instead.
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
   * Writes every active graph type's rendered diagram, combined into one
   * Markdown file at this path — each type's own anchor-spliced section,
   * the same splicing `DeliveryService` applies per project, applied here to
   * one shared destination instead.
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
   * The project's root, relative to the workspace, as read from the Nx
   * project graph.
   *
   * Optional so a caller with no root handy — a test, or a host that only
   * knows a project by name — still resolves against `include`/`exclude`
   * globs written against project names.
   */
  projectRoot?: string | undefined;
  /**
   * The project's own Nx tags, for matching `--tags`.
   *
   * Optional for the same reason `projectRoot` is: a caller that knows a
   * project only by name still resolves against everything else.
   */
  projectTags?: string[] | undefined;
}

/**
 * Configuration with every default applied.
 *
 * Carries no per-project state at all: a project's own export configuration
 * lives in its own colocated `codependix.config.ts`, loaded on demand by
 * `ConfigurationService.loadProjectConfiguration` and handed to
 * `resolveForProject` — which is also where `include` and `exclude` globs
 * are applied.
 */
export interface ResolvedCodependixConfiguration {
  boundaries: ResolvedCodependixBoundariesConfiguration;
  exclude: string[];
  include: string[];
  /** The root module of each NestJS application, keyed by Nx project name. */
  nestjsRootModules: Record<string, CodependixNestjsRootModule>;
  /** A project graph to read instead of the working directory's, if named. */
  projectGraph: string | undefined;
  /**
   * What `--projects` and `--tags` named, resolved.
   *
   * Carried on the resolved configuration rather than passed alongside it so
   * that everything already handed a configuration — the export passes, the
   * workspace graph, and the boundary gate — sees the same selection without
   * a second argument threaded through each of them.
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

/**
 * A run's project selection, split and trimmed.
 *
 * Both lists empty means no selection was made at all, which is not the same
 * as a selection that matches nothing: an absent selection leaves the
 * whole-workspace graph and the boundary gate judging every project, while a
 * selection naming something narrows both to what it names.
 */
export interface ResolvedCodependixSelection {
  /**
   * Whether graphs are built over the selected projects' dependency closure,
   * or over the selected projects alone.
   *
   * `true` unless `--no-dependencies` was given. Either way only the selected
   * projects are judged: a finding charged to a dependency is reported as a
   * note rather than failing the run.
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
   * The project's own loaded `codependix.config.ts`, or `undefined` when it
   * has none — see `ConfigurationService.loadProjectConfiguration`.
   *
   * Read as-is rather than merged with anything else: a project's own file
   * already spreads the root-exported `projectDefaults` at authoring time, so
   * whatever `loadProjectConfiguration` returns is the complete statement of
   * that project's export configuration. A project naming no file of its own
   * resolves to `target: "none"` regardless of `include`/`exclude` — it
   * simply has nothing to export.
   */
  projectConfiguration: CodependixProjectConfiguration | undefined;
}
