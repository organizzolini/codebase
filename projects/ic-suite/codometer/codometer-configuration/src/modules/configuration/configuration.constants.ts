// ♟️ Constants

import type {
  CodometerAnalysis,
  CodometerCommentLanguage,
  CodometerCompression,
  CodometerDocumentationUnit,
  CodometerFormat,
  CodometerInput,
} from "./configuration.types";
import type { CodometerSeverity } from "@codometer/core";

/** Extensions the configuration loader can read. */
export const SUPPORTED_CONFIGURATION_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsonc",
  ".mjs",
  ".mts",
  ".ts",
]);

/**
 * File names a configuration may be written under.
 *
 * Used to spot config files when listing a tree; a run always takes `--config`.
 */
export const CONFIGURATION_FILE_NAMES = [
  "codometer.config.ts",
  "codometer.config.mts",
  "codometer.config.cts",
  "codometer.config.js",
  "codometer.config.mjs",
  "codometer.config.cjs",
  "codometer.config.json",
  "codometer.config.jsonc",
] as const;

/**
 * Path globs excluded when a configuration names none: only what every ecosystem generates.
 *
 * Repository-specific noise belongs in its own configuration.
 */
export const DEFAULT_EXCLUDE_GLOBS = [
  "**/.nx/**",
  "**/build/**",
  "**/coverage/**",
  "**/dist/**",
  "**/node_modules/**",
] as const;

/**
 * Badge colors for configured counters that name none, cycled in order.
 *
 * Cycling keeps each counter's color stable between runs.
 */
export const DEFAULT_CUSTOM_STATISTIC_COLORS = [
  "7c3aed",
  "0284c7",
  "16a34a",
  "ea580c",
  "db2777",
  "0ea5e9",
  "059669",
  "ca8a04",
] as const;

/** Badge group a configured counter is rendered into when it names none. */
export const DEFAULT_CUSTOM_STATISTIC_GROUP = "conventions";

/**
 * Name of the input every run measures: the whole codebase.
 *
 * Its files come from ignore files, not globs.
 */
export const DEFAULT_INPUT_NAME = "codebase";

/**
 * The built-in `codebase` input, present unless a configuration's `inputs`
 * names an entry of its own by that name.
 */
export const DEFAULT_CODEBASE_INPUT: CodometerInput = {
  analyses: ["language"],
  include: ["**/*"],
  name: DEFAULT_INPUT_NAME,
};

/**
 * Compression applied to an input that names none.
 *
 * Gzip, since clients understand it; `none` measures bytes on disk.
 */
export const DEFAULT_INPUT_COMPRESSION = "gzip" satisfies CodometerCompression;

/**
 * Where an input's globs start when it names no directory: the working directory.
 *
 * Reaching outside it must be written down.
 */
export const DEFAULT_INPUT_DIRECTORY = ".";

/**
 * Severity of a limit that names none. Strict on purpose: a quietly warning limit gates nothing.
 */
export const DEFAULT_LIMIT_SEVERITY = "fail" satisfies CodometerSeverity;

/**
 * Multiplier per unit suffix. Decimal, with a required trailing `b`.
 *
 * A map, so an inherited name such as `constructor` finds nothing.
 */
export const LIMIT_UNIT_MULTIPLIERS: ReadonlyMap<string, number> = new Map([
  ["b", 1],
  ["gb", 1_000_000_000],
  ["kb", 1_000],
  ["mb", 1_000_000],
  ["tb", 1_000_000_000_000],
]);

/**
 * Splits a string limit into its number and unit.
 *
 * Anchored at both ends, so anything extra is rejected rather than half-parsed.
 */
export const LIMIT_VALUE_PATTERN = /^(\d+(?:\.\d+)?)\s*([a-z]*)$/i;

/** Spaces used to indent the JSON report when a configuration names none. */
export const DEFAULT_JSON_INDENTATION = 2;

/** Closing marker of the generated badge block. */
export const DEFAULT_MARKDOWN_END_MARKER = "<!-- codometer:end -->";

/** Opening marker of the generated badge block. */
export const DEFAULT_MARKDOWN_START_MARKER = "<!-- codometer:start -->";

/**
 * Interpreter for Python analysis when a configuration names none.
 *
 * Repositories with managed environments override it, e.g. `uv run python`.
 */
export const DEFAULT_PYTHON_COMMAND = "python3";

/**
 * Prefix turning an include glob into an exclusion.
 *
 * Read wherever an input's globs are resolved.
 */
export const NEGATION_PREFIX = "!";

/**
 * Marks the repository root for an upward search.
 *
 * Package manifests are excluded: every monorepo package has one.
 */
export const REPOSITORY_ROOT_MARKERS = [".git", "pnpm-workspace.yaml"] as const;

/** Analyses an input may ask to have run over it. */
export const CODOMETER_ANALYSES = [
  "language",
  "size",
] as const satisfies readonly CodometerAnalysis[];

/** Languages a `comment` selector may narrow itself to. */
export const CODOMETER_COMMENT_LANGUAGES = [
  "css",
  "hcl",
  "python",
  "shell",
  "sql",
  "toml",
  "typescript",
  "yaml",
] as const satisfies readonly CodometerCommentLanguage[];

/** Compressions an input may ask its size to be measured under. */
export const CODOMETER_COMPRESSIONS = [
  "brotli",
  "gzip",
  "none",
] as const satisfies readonly CodometerCompression[];

/**
 * Message for a configuration with no `format`, written out rather than left to the schema's generic line.
 */
export const MISSING_FORMAT_MESSAGE =
  'A codometer configuration must name a `format` of "json" or "markdown", and nothing supplies one for it. Set it in this file, or spread a shared default object that sets it — every run has to be told which report shape it produces, and a directory with no configuration file anywhere above it fails here rather than measuring with a format nobody chose.';

/** Report shapes a run may produce. */
export const CODOMETER_FORMATS = [
  "json",
  "markdown",
] as const satisfies readonly CodometerFormat[];

/** Units a documentation limit may measure a comment's length in. */
export const CODOMETER_DOCUMENTATION_UNITS = [
  "characters",
  "lines",
  "words",
] as const satisfies readonly CodometerDocumentationUnit[];
