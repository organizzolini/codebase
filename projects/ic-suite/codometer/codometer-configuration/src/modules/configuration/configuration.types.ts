// 🏷️ Types

import type { FORMAT_NAMES } from "./configuration-flags.constants";
import type { WriteMarkdownOutput } from "./output.types";
import type {
  CodometerSeverity,
  CodometerStatisticGroup,
  CodometerSymbolKind,
  CodometerSymbolModifier,
} from "@codometer/core";

/**
 * An analysis codometer runs over an input.
 *
 * `language` counts declarations; `size` counts compressed bytes.
 */
export type CodometerAnalysis = "language" | "size";

/**
 * A language a `comment` selector may narrow to. Every language with comments, except JSDoc, which `kind` selects.
 */
export type CodometerCommentLanguage =
  | "css"
  | "hcl"
  | "python"
  | "shell"
  | "sql"
  | "toml"
  | "typescript"
  | "yaml";

/**
 * One comment measured against its kind's limit, shared by all comment analyzers. `kind` is a plain string so no analyzer owns the union.
 */
export interface CodometerCommentMeasurement {
  breached: boolean;
  /** What the comment documents: a declaration's name, or the comment itself. */
  declaration: string;
  file: string;
  kind: string;
  limit: number;
  /** 1-indexed line the measured thing starts on. */
  line: number;
  measured: number;
  severity: CodometerSeverity;
  unit: CodometerDocumentationUnit;
}

/**
 * Comment budget for a custom statistic. Selectors never inherit. Omitting `language` covers all; `kind` narrows to JSDoc.
 */
export interface CodometerCommentSelector {
  kind?: CodometerSymbolKind | undefined;
  language?: CodometerCommentLanguage | undefined;
  /** How many characters a block may hold, markers and newlines and all. */
  maximumCharacters?: number | undefined;
  /** How many lines a block may span. */
  maximumLines?: number | undefined;
  /** How many words of prose a block may hold, once markers are stripped. */
  maximumWords?: number | undefined;
  /** How loudly a breach is reported. Defaults to `fail`, as limits do. */
  severity?: CodometerSeverity | undefined;
}

/**
 * How a target's files are compressed before size analysis. Explicit, because an unchosen compression is a byte count nobody can explain.
 */
export type CodometerCompression = "brotli" | "gzip" | "none";

/**
 * Configuration authored in a `codometer.config.ts`. Only `format` is required, with no built-in fallback.
 */
export interface CodometerConfiguration {
  /**
   * Every counter this configuration measures, whether or not an output renders it.
   *
   * An `outputs[].custom` entry only selects labels from these.
   */
  custom?: CodometerCustomStatistic[] | undefined;
  /**
   * Input an unqualified limit's metric path belongs to. Ambiguous paths are rejected, not resolved.
   */
  defaultInput?: string | undefined;
  exclude?: string[] | undefined;
  /**
   * Ignore files, in gitignore syntax, whose patterns also exclude files.
   *
   * For committed generated files such as lockfiles. `.gitignore` is read automatically.
   */
  excludeFrom?: string[] | undefined;
  /**
   * Which report shape a run produces. Required; no code-level fallback.
   *
   * A shared default object spread into each project config sets it once.
   */
  format: CodometerFormat;
  /**
   * Named file sets measured alongside, or instead of, the codebase.
   *
   * A built-in `codebase` entry, unless `inputs` declares its own.
   */
  inputs?: CodometerInput[] | undefined;
  /**
   * How high each measured metric may go.
   *
   * A metric nothing here names is measured and reported like every other one,
   * and gated by nothing.
   */
  limits?: CodometerLimit[] | undefined;
  /**
   * Destinations the measured statistics are written to.
   *
   * At most one entry per `type`: the command line could never address a second.
   */
  outputs?: CodometerOutput[] | undefined;
  python?: CodometerPythonConfiguration | undefined;
}

/**
 * One configured counter, measuring files by `patterns`, declarations by `symbols`, or comment blocks by `comment`.
 */
export interface CodometerCustomStatistic {
  /** Badge color, as a shields.io hexadecimal triplet. */
  color?: string | undefined;
  comment?: CodometerCommentSelector | undefined;
  /**
   * Badge group the counter renders into.
   *
   * Defaults to `conventions`, which is omitted when no counter is configured.
   */
  group?: CodometerStatisticGroup | undefined;
  label: string;
  patterns?: string[] | undefined;
  symbols?: CodometerSymbolMatcher | undefined;
}

/** Unit a documentation length is measured in. */
export type CodometerDocumentationUnit = "characters" | "lines" | "words";

/** Which report shape a run produces. */
export type CodometerFormat = "json" | "markdown";

/**
 * A named set of files, declared by include and exclude globs. Only `compression` and `analyses` are read from an input named `codebase`.
 */
export interface CodometerInput {
  /** Which analyses run over the matched files. At least one. */
  analyses: CodometerAnalysis[];
  compression?: CodometerCompression | undefined;
  /**
   * Where the input's globs start, relative to the working directory. Defaults to it; `"../.."` reaches a build tree.
   */
  directory?: string | undefined;
  exclude?: string[] | undefined;
  include: string[];
  name: string;
}

/**
 * Where the JSON report is written. Selecting a `custom` label the top level never declared is refused.
 */
export interface CodometerJsonOutput {
  custom?: string[] | undefined;
  indentation?: number | undefined;
  path: string;
  type: "json";
}

/**
 * How high one measured metric may go, compared against `value` alone, with no baseline or floor.
 */
export interface CodometerLimit {
  /** What to call the limit in a report, when the path itself reads poorly. */
  label?: string | undefined;
  /**
   * The metric this limits, as a dotted path: input name, then metric path.
   *
   * Example: `codebase.typescript.interfaces`. Ambiguous or unmatched paths fail the run.
   */
  metric: string;
  /**
   * How loudly a breach is reported. Defaults to `fail`.
   *
   * The strict default is deliberate: a limit exists to gate.
   */
  severity?: CodometerSeverity | undefined;
  /**
   * The ceiling for the metric, as a number or a unit string.
   *
   * Units are decimal and need a trailing `b`.
   */
  value: number | string;
}

/**
 * Where the markdown report is written. One of `path` or `write` is required; `write` overrides the built-in rendering.
 */
export interface CodometerMarkdownOutput {
  custom?: string[] | undefined;
  description?: string | undefined;
  endMarker?: string | undefined;
  path?: string | undefined;
  startMarker?: string | undefined;
  type: "markdown";
  write?: undefined | WriteMarkdownOutput;
}

/** Destination the measured statistics are written to, one report shape each. */
export type CodometerOutput = CodometerJsonOutput | CodometerMarkdownOutput;

/** How Python sources are analyzed. */
export interface CodometerPythonConfiguration {
  command?: string | undefined;
}

/**
 * TypeScript and JavaScript declarations a counter claims: a listed kind carrying every `modifiers` entry, or the kind alone when absent.
 */
export interface CodometerSymbolMatcher {
  kinds: CodometerSymbolKind[];
  modifiers?: CodometerSymbolModifier[] | undefined;
}

/** Arguments accepted when loading a configuration file. */
export interface LoadConfigurationArguments {
  /** The configuration file, relative to the cwd or the repository root. */
  configurationPath: string;
}

/**
 * Options for the measure command. Each `--output-*` flag writes only its own destination. There is no `--write`.
 */
export interface MeasureCommandOptions {
  /** The comma-separated set of things to fail on, as it was written. */
  check?: string | true | undefined;
  config?: string | undefined;
  /** What to print to standard output, as it was written. */
  format?: string | undefined;
  /**
   * The glob array that replaces every configured input for this run, as
   * written. `undefined` when the flag was never passed at all.
   */
  inputs?: string[] | undefined;
  /**
   * The report's destination, as written: `true` for a bare flag, a string for a path.
   *
   * `undefined` when the flag was never passed.
   */
  outputJson?: string | true | undefined;
  /**
   * The markdown destination, as written: `true` for a bare flag, a string for a path.
   *
   * `undefined` when the flag was never passed.
   */
  outputMarkdown?: string | true | undefined;
}

/**
 * What a run prints to standard output.
 *
 * Derived from the list `--format` validates against, so they cannot drift.
 */
export type MeasureFormat = (typeof FORMAT_NAMES)[number];

/**
 * What the command line asked for, and what it could not parse. Every complaint is collected before any is reported.
 */
export interface ModeSelection {
  errors: string[];
  mode: RunMode;
}

/**
 * What the run does with what it measures: gates on `checksReports` and `checksLimits`, and writes per `--output-*` flag.
 */
export interface RunMode {
  checksLimits: boolean;
  checksReports: boolean;
  writesJson: boolean;
  writesMarkdown: boolean;
}
