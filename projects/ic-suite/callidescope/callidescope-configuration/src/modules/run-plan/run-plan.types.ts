// 🏷️ Types

import type {
  CallidescopeLimitOverrides,
  CallidescopeLimits,
  CallidescopeOutputFormat,
  ResolvedCallidescopeConfiguration,
} from "../configuration/configuration.types";

/**
 * Options `depth` and `breadth` accept, scoping a lookup to one workspace. Only graph-shaping overrides appear here.
 */
export interface AddressCommandOptions {
  /** Callable addresses to report on, each `<file>#<qualified-name>`. Prompted for when empty, never refused. */
  readonly addresses?: string[] | undefined;
  readonly config: string;
  /** Project directories to trace. Every project in the workspace when omitted. */
  readonly directories?: string[] | undefined;
  /** Overrides `entryPoints.addresses` for this lookup. */
  readonly entryPointAddresses?: string[] | undefined;
  /** Overrides `entryPoints.decorators` for this lookup. */
  readonly entryPointDecorators?: string[] | undefined;
  /** Overrides `exclude` for this lookup. */
  readonly exclude?: string[] | undefined;
  /** Overrides `excludeCallees` for this lookup. */
  readonly excludeCallees?: string[] | undefined;
  /** `--format`, exactly as it was typed, for the resolver to judge. */
  readonly format?: string | undefined;
  /** Overrides `entryPoints.includeExportedFunctions`, as it was typed. */
  readonly includeExportedFunctions?: string | true | undefined;
  /** Overrides `entryPoints.includeOrphans`, as it was typed. */
  readonly includeOrphans?: string | true | undefined;
  /** Overrides `entryPoints.includeTests`, as it was typed. */
  readonly includeTests?: string | true | undefined;
}

/** Options the CLI accepts. */
export interface CallidescopeCommandOptions {
  /** The written `--check` set, or `true` for the flag with no value. Kept as written so only one place reads its names. */
  readonly check?: string | true | undefined;
  readonly config: string;
  /** Project directories to trace. Every project in the workspace when omitted. */
  readonly directories?: string[] | undefined;
  /** Overrides `entryPoints.addresses` for this run. */
  readonly entryPointAddresses?: string[] | undefined;
  /** Overrides `entryPoints.decorators` for this run. */
  readonly entryPointDecorators?: string[] | undefined;
  /** Overrides `exclude` for this run. */
  readonly exclude?: string[] | undefined;
  /** Overrides `excludeCallees` for this run. */
  readonly excludeCallees?: string[] | undefined;
  /** `--format` as typed. Left unvalidated so the resolver, which knows the formats, refuses a bad one. */
  readonly format?: string | undefined;
  /** Overrides `entryPoints.includeExportedFunctions`, as typed. `true` is the flag written with no value. */
  readonly includeExportedFunctions?: string | true | undefined;
  /** Overrides `entryPoints.includeOrphans`, exactly as it was typed. */
  readonly includeOrphans?: string | true | undefined;
  /** Overrides `entryPoints.includeTests`, exactly as it was typed. */
  readonly includeTests?: string | true | undefined;
  readonly json?: string | undefined;
  readonly markdown?: string | undefined;
  /** Overrides `limits.maximumBreadth`, exactly as it was typed. */
  readonly maximumBreadth?: string | undefined;
  /** Overrides `limits.maximumDepth`, exactly as it was typed. */
  readonly maximumDepth?: string | undefined;
  readonly mermaid?: string | undefined;
  readonly write?: boolean | undefined;
}

/**
 * What a lookup's flags and configuration resolved to, minus the mode, which lookups do not have.
 */
export interface PreparedLookup {
  readonly authoredLimits: CallidescopeLimits | undefined;
  /** The configuration, with the scope a `--directories` flag named applied. */
  readonly configuration: ResolvedCallidescopeConfiguration;
  readonly configurationPath: string;
  readonly format: CallidescopeOutputFormat;
  readonly workspaceRoot: string;
}

/** What a command line and its configuration resolved to. */
export interface PreparedRun {
  /** The limits the workspace file wrote, as authored. Resolution fills every limit with a default, so only this shows which were chosen. */
  readonly authoredLimits: CallidescopeLimits | undefined;
  /** The configuration with every flag override applied. Scope and destinations are read from here, not from the options. */
  readonly configuration: ResolvedCallidescopeConfiguration;
  /** The file the configuration was read from, always the one `--config` named. Trace skips it as a project's own file. */
  readonly configurationPath: string;
  /** What the run prints to standard output. A per-invocation presentation choice, never written in a configuration. */
  readonly format: CallidescopeOutputFormat;
  /** The limits this command line overrode. Kept beside the configuration because each project's gate reads its own number. */
  readonly limitOverrides: CallidescopeLimitOverrides;
  readonly mode: RunMode;
  readonly workspaceRoot: string;
}

/**
 * What the run does with what it traces. The four flags are independent, so none turns another on.
 */
export interface RunMode {
  readonly checksBreadth: boolean;
  readonly checksDepth: boolean;
  readonly checksReports: boolean;
  readonly writes: boolean;
}

/**
 * What the command line asked the run to do, and the complaints about it.
 */
export interface RunModeSelection {
  readonly errors: readonly string[];
  readonly mode: RunMode;
}

/**
 * What one command line resolved to, and the complaints it drew.
 */
export interface RunPreparation {
  readonly errors: readonly string[];
  /** Absent exactly when `errors` is not empty. */
  readonly run: PreparedRun | undefined;
}
