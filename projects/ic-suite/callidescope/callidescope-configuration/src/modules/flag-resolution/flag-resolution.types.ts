// 🏷️ Types

import type {
  CallidescopeLimitOverrides,
  CallidescopeOutputFormat,
  ResolvedCallidescopeConfiguration,
} from "../configuration/configuration.types";

/**
 * Command-line flags as parsed. `--config` is absent: it picks the file the others resolve against.
 */
export interface CallidescopeRunFlags {
  /** Mode. The written `--check` set, or `true` for the flag with no value. */
  readonly check?: string | true | undefined;
  /** Scope. `--directories`, already split on commas. */
  readonly directories?: readonly string[] | undefined;
  /** Judgement. `--entry-point-addresses`, already split on commas. */
  readonly entryPointAddresses?: readonly string[] | undefined;
  /** Judgement. `--entry-point-decorators`, already split on commas. */
  readonly entryPointDecorators?: readonly string[] | undefined;
  /** Judgement. `--exclude`, already split on commas. */
  readonly exclude?: readonly string[] | undefined;
  /** Judgement. `--exclude-callees`, already split on commas. */
  readonly excludeCallees?: readonly string[] | undefined;
  /** Presentation. `--format`, exactly as it was typed. */
  readonly format?: string | undefined;
  /** Judgement. `--include-exported-functions`, exactly as typed. `true` is a flag written with no value, not a coercion. */
  readonly includeExportedFunctions?: string | true | undefined;
  /** Judgement. `--include-orphans`, exactly as it was typed. */
  readonly includeOrphans?: string | true | undefined;
  /** Judgement. `--include-tests`, exactly as it was typed. */
  readonly includeTests?: string | true | undefined;
  /** Destination. `--json`, a path and nothing else. */
  readonly json?: string | undefined;
  /** Destination. `--markdown`, a path and nothing else. */
  readonly markdown?: string | undefined;
  /** Judgement. `--maximum-breadth`, exactly as it was typed. */
  readonly maximumBreadth?: string | undefined;
  /** Judgement. `--maximum-depth`, exactly as it was typed. */
  readonly maximumDepth?: string | undefined;
  /** Destination. `--mermaid`, a path and nothing else. */
  readonly mermaid?: string | undefined;
  /** Mode. `--write`. */
  readonly write?: boolean | undefined;
}

/** What a command line and the configuration it was resolved against produced. */
export interface ResolvedRunFlags {
  /** The configuration with every override applied. Scope and destinations are read from here, so nothing re-checks which value won. */
  readonly configuration: ResolvedCallidescopeConfiguration;
  /** Every reason the command line could not be resolved, collected so two mistakes read as two fixes, not two runs. */
  readonly errors: readonly string[];
  /** What the run prints. The default whenever the flag was left off. */
  readonly format: CallidescopeOutputFormat;
  /** The limits a flag chose, and only those. Carried beside the configuration because each project's gate reads its own file. */
  readonly limitOverrides: CallidescopeLimitOverrides;
}
