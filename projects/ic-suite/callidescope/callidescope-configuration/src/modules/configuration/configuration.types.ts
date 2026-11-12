// 🏷️ Types

import type { CallGraphResult } from "@callidescope/core";

/** The shape of a `callidescope.config.ts` default export. */
export interface CallidescopeConfiguration {
  /** Project directories to trace, defaulting to every directory with its own `tsconfig.json`. Narrowing it speeds a run. */
  directories?: string[] | undefined;
  entryPoints?: CallidescopeEntryPoints | undefined;
  exclude?: string[] | undefined;
  /** Globs matching a callable's `Type.member` name; matches are dropped from depth and breadth. Meant for cross-cutting callables like loggers. */
  excludeCallees?: string[] | undefined;
  /** Gitignore-syntax files listing paths to leave untraced. */
  excludeFrom?: string[] | undefined;
  limits?: CallidescopeLimits | undefined;
  write?: CallidescopeWriteConfiguration | undefined;
}

/** Which callables are treated as the roots of a call stack. */
export interface CallidescopeEntryPoints {
  /** Extra call-stack roots as `<file>#<qualified-name>`, the address form reports print. Optional `:<line>` disambiguates duplicate names; additive to the rules. */
  addresses?: string[] | undefined;
  /** Decorators whose methods a framework invokes; matched by name, then confirmed against the declaring package. */
  decorators?: string[] | undefined;
  /** Treat every `src/index.ts` export as a root. Defaults to true. */
  includeExportedFunctions?: boolean | undefined;
  /** Promote callables nothing calls to roots. Defaults to true; without it, a missing rule silently drops whole subtrees. */
  includeOrphans?: boolean | undefined;
  /** Trace test files too. Defaults to false. */
  includeTests?: boolean | undefined;
}

/** JSON output destination. */
export interface CallidescopeJsonOutputConfiguration {
  indentation?: number | undefined;
  path: string;
}

/** Limits a flag overrode; absent members were not supplied. */
export interface CallidescopeLimitOverrides {
  maximumBreadth?: number | undefined;
  maximumDepth?: number | undefined;
}

/** Per-project stack depth and callable breadth limits. */
export interface CallidescopeLimits {
  /** Distinct direct callees a callable may have before it is reported. No default: a project must set it for `--check breadth`. */
  maximumBreadth?: number | undefined;
  /** Frames a call stack may hold before it is reported. */
  maximumDepth?: number | undefined;
}

/** Markdown output destination. */
export interface CallidescopeMarkdownOutputConfiguration {
  description?: string | undefined;
  endMarker?: string | undefined;
  /** Heading the block sits under; `# 🔭 Callidescope` by default. Use `##` when splicing into an already-titled file. */
  heading?: string | undefined;
  path: string;
  /** Stacks shown before the rest fold into a disclosure; set per destination, since a README and a report differ. */
  previewCount?: number | undefined;
  render?: RenderMarkdownOutput | undefined;
  startMarker?: string | undefined;
  writeBlock?: undefined | WriteMarkdownOutput;
}

/** How a run renders what it found. */
export type CallidescopeOutputFormat = "json" | "markdown" | "mermaid";

/** A project's own `callidescope.config.ts`, every member required. */
export interface CallidescopeProjectConfiguration {
  entryPoints: CallidescopeProjectEntryPoints;
  /** Globs matched against paths relative to this project's own root. */
  exclude: string[];
  limits: CallidescopeProjectLimits;
  write: CallidescopeProjectWriteConfiguration;
}

/** Which callables a project treats as call stack roots. */
export interface CallidescopeProjectEntryPoints {
  addresses: string[];
  decorators: string[];
  includeExportedFunctions: boolean;
  includeOrphans: boolean;
  includeTests: boolean;
}

/** Two gate limits. `maximumBreadth` may be `undefined`: no breadth gate. */
export interface CallidescopeProjectLimits {
  maximumBreadth: number | undefined;
  maximumDepth: number;
}

/** Project section and diagram paths, relative to its root. */
export interface CallidescopeProjectWriteConfiguration {
  markdown: CallidescopeMarkdownOutputConfiguration | undefined;
  mermaid: CallidescopeMarkdownOutputConfiguration | undefined;
}

/** Where a run writes its findings. */
export interface CallidescopeWriteConfiguration {
  json?: CallidescopeJsonOutputConfiguration | undefined;
  markdown?: CallidescopeMarkdownOutputConfiguration | undefined;
  /** A markdown block drawing call stacks as a diagram, published alongside the `markdown` tree rather than replacing it. */
  mermaid?: CallidescopeMarkdownOutputConfiguration | undefined;
}

/** Arguments accepted by the configuration loader. */
export interface LoadConfigurationArguments {
  /** The workspace configuration file, relative to the cwd or the repository root. */
  configurationPath: string;
}

/** Resolved configuration, plus the file's raw object and its path. */
export interface LoadedCallidescopeConfiguration {
  /** The file's own object, before a single default was applied. */
  authored: CallidescopeConfiguration;
  configuration: ResolvedCallidescopeConfiguration;
  /** The absolute path of the file that was read. */
  path: string;
}

/** One project's own configuration file, and the project it configures. */
export interface LoadedProjectConfiguration {
  /** The file's own object, before a single default was applied. */
  authored: CallidescopeConfiguration;
  configuration: ResolvedCallidescopeConfiguration;
  path: string;
  /** Workspace-relative root of the project the file sits at. */
  project: string;
}

/** Arguments accepted by the project configuration loader. */
export interface LoadProjectConfigurationsArguments {
  /** Workspace-relative project roots to look beside. */
  projects: readonly string[];
  /** The run's own configuration file, resolved against `workspaceRoot`. A file read as the run's own is never also read as a project's. */
  workspaceConfigurationPath: string;
  workspaceRoot: string;
}

/** Splicing helpers handed to a configured `writeBlock` function. */
export interface MarkdownAnchorHelpers {
  endMarker: string;
  startMarker: string;
  /** Splices the anchored block into a file, appending or creating it. In check mode nothing is written; returns whether the block is current. */
  syncAnchoredBlock: (overrides?: {
    content?: string | undefined;
    path?: string | undefined;
  }) => boolean;
  /** The content wrapped in the configured markers, ready to place anywhere. */
  wrapInAnchors: (content?: string) => string;
}

/** Whether a project's own configuration may set one field, or one member. */
export type ProjectFieldPermission = "forbidden" | "permitted";

/** One project's depth and breadth limits, and their file. */
export interface ProjectLimits {
  /** Absent when the project declared no breadth limit, which most do not. */
  maximumBreadth: number | undefined;
  maximumDepth: number;
  /** The file both numbers were written in. Absent when `maximumDepth` was only defaulted, so no file is named for it. */
  path: string | undefined;
}

/** Limits judging each traced project and the workspace file. */
export interface ProjectLimitsLookup {
  /** Keyed by workspace-relative project root. */
  byProject: ReadonlyMap<string, ProjectLimits>;
  workspace: ProjectLimits;
}

/** What a `render` function is handed. */
export interface RenderMarkdownArguments {
  /** The configured description, for a renderer that wants to place it itself. */
  description: string | undefined;
  /**
   * The built-in table rendering of these same findings.
   *
   * Call it to add to the default report rather than replace it.
   */
  renderTables: () => string;
  result: CallGraphResult;
}

/** Turns the traced findings into the markdown that will be written. */
export type RenderMarkdownOutput = (args: RenderMarkdownArguments) => string;

/** Configuration with every default applied; analyzers need no defaults. */
export interface ResolvedCallidescopeConfiguration {
  directories: string[];
  entryPoints: ResolvedCallidescopeEntryPoints;
  exclude: string[];
  excludeCallees: string[];
  excludeFrom: string[];
  limits: ResolvedCallidescopeLimits;
  write: ResolvedCallidescopeWriteConfiguration;
}

/** Entry-point rules with defaults applied. */
export interface ResolvedCallidescopeEntryPoints {
  addresses: string[];
  decorators: string[];
  includeExportedFunctions: boolean;
  includeOrphans: boolean;
  includeTests: boolean;
}

/** JSON output destination with defaults applied. */
export interface ResolvedCallidescopeJsonOutputConfiguration {
  indentation: number;
  path: string;
}

/** Thresholds with defaults applied. */
export interface ResolvedCallidescopeLimits {
  /** Distinct direct callees a callable may have before it is reported. Optional even after resolution, since it has no default. */
  maximumBreadth?: number | undefined;
  maximumDepth: number;
}

/** Markdown destination with defaults applied. Unset `render`/`writeBlock` pick built-ins. */
export interface ResolvedCallidescopeMarkdownOutputConfiguration {
  description: string | undefined;
  endMarker: string;
  heading: string;
  path: string;
  previewCount: number;
  render: RenderMarkdownOutput | undefined;
  startMarker: string;
  writeBlock: undefined | WriteMarkdownOutput;
}

/** Output destinations, with defaults applied. Unset means nothing is written. */
export interface ResolvedCallidescopeWriteConfiguration {
  json: ResolvedCallidescopeJsonOutputConfiguration | undefined;
  markdown: ResolvedCallidescopeMarkdownOutputConfiguration | undefined;
  mermaid: ResolvedCallidescopeMarkdownOutputConfiguration | undefined;
}

/** Arguments accepted by the per-project limit resolver. */
export interface ResolveProjectLimitsArguments {
  /** Limits this run's command line overrode. Applied to every project that declared that limit; a flag never supplies a missing one. */
  limitOverrides?: CallidescopeLimitOverrides | undefined;
  /** The configuration files projects declared for themselves. */
  projectConfigurations: readonly LoadedProjectConfiguration[];
  /** Workspace-relative root of every project the run reached. */
  projects: readonly string[];
  /** The limits the workspace file wrote, exactly as authored. Its presence decides whether the workspace row names a file. */
  workspaceAuthoredLimits: CallidescopeLimits | undefined;
  /** The run's own configuration, which the workspace row reads its numbers from. */
  workspaceConfiguration: ResolvedCallidescopeConfiguration;
  /** The file that configuration was read from, when one was found. */
  workspaceConfigurationPath: string;
}

/** What a `writeBlock` function is handed. */
export interface WriteMarkdownArguments {
  /** True when nothing may be written and staleness is the only question. */
  check: boolean;
  /** The rendered markdown, before any anchoring. */
  content: string;
  helpers: MarkdownAnchorHelpers;
  path: string | undefined;
  result: CallGraphResult;
}

/** Chooses where markdown lands; `false` marks it stale, failing checks. */
export type WriteMarkdownOutput = (args: WriteMarkdownArguments) => boolean;
