// 🏷️ Types

/**
 * Aggregated code statistics from the measurement pipeline, grouped by language. Lives here so `codometer.config.ts` can name it.
 */
export interface CodeStatisticsResult {
  css: CssStatistics;
  custom: CustomStatisticResult[];
  folders: number;
  hcl: HclStatistics;
  javascript: JavascriptStatistics;
  json: JsonStatistics;
  jupyter: JupyterStatistics;
  linesOfCode: number;
  markdown: MarkdownStatistics;
  python: PythonStatistics;
  /**
   * Byte-precise total of this target's files, uncompressed.
   *
   * Uses the size analysis with `none` compression, so the headline moves by the byte.
   */
  repositoryBytes: number;
  shell: ShellStatistics;
  sourceFiles: number;
  sql: SqlStatistics;
  toml: TomlStatistics;
  typescript: TypescriptStatistics;
  yaml: YamlStatistics;
}

/**
 * Everything one run measured, and what it could not. Each metric carries its limits and a stable name to join on.
 */
export interface CodometerReport {
  /**
   * What the run could not do. Empty on an ordinary run.
   *
   * Lets a consumer tell an unmeasured metric from a zero.
   */
  failures: ReportFailure[];
  targets: ReportTarget[];
}

/**
 * What a breach costs.
 *
 * `fail` is a gate and `warn` is a report. Both are reported identically.
 */
export type CodometerSeverity = "fail" | "warn";

/**
 * A badge group a configured counter can be rendered into.
 *
 * Every group the report renders, plus `conventions` for configured counters.
 */
export type CodometerStatisticGroup =
  | "conventions"
  | "css"
  | "hcl"
  | "json"
  | "jupyter"
  | "markdown"
  | "python"
  | "repository"
  | "shell"
  | "sql"
  | "toml"
  | "typescript"
  | "yaml";

/**
 * A kind of declaration a symbol counter can ask for.
 *
 * `function` covers callables outside a class; class-field arrows are `property`.
 */
export type CodometerSymbolKind =
  | "class"
  | "enum"
  | "file"
  | "function"
  | "getter"
  | "interface"
  | "method"
  | "property"
  | "setter"
  | "signature"
  | "type"
  | "variable";

/**
 * A modifier a counted declaration must carry.
 *
 * Matched literally: `public` misses members public only by omission.
 */
export type CodometerSymbolModifier =
  | "abstract"
  | "async"
  | "export"
  | "override"
  | "private"
  | "protected"
  | "public"
  | "readonly"
  | "static";

/**
 * Structural statistics specific to CSS stylesheets.
 */
export interface CssStatistics {
  atRules: number;
  comments: number;
  customProperties: number;
  declarations: number;
  files: number;
  lines: number;
  mediaQueries: number;
  rules: number;
  selectors: number;
}

/**
 * What one configured counter found. `count` is files for a path counter and declarations for a symbol counter.
 */
export interface CustomStatisticResult {
  color: string;
  count: number;
  group: CodometerStatisticGroup;
  /**
   * Where each measured instance was found, per instance.
   *
   * Unset for a counter that only counts; a `comment` selector fills it.
   */
  instances?: CustomStatisticResultInstance[] | undefined;
  label: string;
}
// 🏷️ Types

// What a measurement produces, as opposed to what a configuration asks
// for. This half imports nothing, so the authoring vocabulary can read it
// without the two sides forming a cycle.

/** One measured occurrence a per-instance selector found. */
export interface CustomStatisticResultInstance {
  file: string;
  /** 1-indexed line the measured thing starts on. */
  line: number;
  measured: number;
}

/**
 * Statistics specific to HCL, the Terraform configuration language.
 */
export interface HclStatistics {
  attributes: number;
  blocks: number;
  comments: number;
  files: number;
  interpolations: number;
  lines: number;
  outputs: number;
  resources: number;
  variables: number;
}

/** Code statistics specific to JavaScript source files. */
export interface JavascriptStatistics {
  asyncFunctions: number;
  classes: number;
  commentLines: number;
  comments: number;
  constants: number;
  exported: number;
  externalPackages: number;
  files: number;
  functions: number;
  imports: number;
  methods: number;
  syncFunctions: number;
  testFiles: number;
  todos: number;
}

/** Code statistics specific to JSON, JSONC, and JSONL files. */
export interface JsonStatistics {
  arrays: number;
  booleans: number;
  files: number;
  items: number;
  lines: number;
  maxDepth: number;
  nulls: number;
  numbers: number;
  objects: number;
  properties: number;
  strings: number;
  totalNodes: number;
}

/**
 * Statistics specific to Jupyter notebooks. Counters come from three analyzers: JSON document, Python cells, and markdown cells.
 */
export interface JupyterStatistics {
  cells: number;
  classes: number;
  codeBlocks: number;
  codeCells: number;
  codeLines: number;
  decorators: number;
  executedCells: number;
  files: number;
  functions: number;
  headings: number;
  images: number;
  imports: number;
  links: number;
  markdownCells: number;
  markdownLines: number;
  maxDepth: number;
  outputs: number;
  properties: number;
  rawCells: number;
  totalNodes: number;
}

/** Structural statistics specific to markdown documents. */
export interface MarkdownStatistics {
  blockQuotes: number;
  codeBlocks: number;
  files: number;
  headingLevel1: number;
  headingLevel2: number;
  headingLevel3: number;
  headingLevel4: number;
  headingLevel5: number;
  headingLevel6: number;
  images: number;
  inlineCode: number;
  lines: number;
  links: number;
  listItems: number;
  lists: number;
  paragraphs: number;
  tableRows: number;
  tables: number;
  taskListItems: number;
  thematicBreaks: number;
}

/**
 * What a metric's number counts.
 *
 * Only bytes are called out. Every other metric counts things, and a count has
 * no unit to get wrong.
 */
export type MetricUnit = "bytes" | null;

/** Code statistics specific to Python source files. */
export interface PythonStatistics {
  classes: number;
  commentLines: number;
  comments: number;
  constants: number;
  decorators: number;
  docstringLines: number;
  docstrings: number;
  files: number;
  functions: number;
  imports: number;
  lines: number;
  protocols: number;
}

/**
 * Something the run could not do, and what it was trying to act on. `CodometerReport.failures` is where consumers read it.
 */
export interface ReportFailure {
  /** Which part of the run it failed in. */
  kind: ReportFailureKind;
  reason: string;
  /** An input's name for an input failure, a limit's written path for a limit. */
  subject: string;
}

/**
 * Which part of a run a failure belongs to: `input` or `limit`.
 *
 * Neither is a breach; do not read them as passing.
 */
export type ReportFailureKind = "input" | "limit";

/**
 * The limit declared on one metric, and whether the metric cleared it. Held and breached limits are written out alike.
 */
export interface ReportLimit {
  breached: boolean;
  /** Stays `null` when none was written; a renderer falls back to the path. */
  label: null | string;
  severity: CodometerSeverity;
  value: number;
}

/** One measured number, and whatever limits it. */
export interface ReportMetric {
  /**
   * Each measured instance and where it was found, if the metric tracks them.
   *
   * `null` for a metric that only counts.
   */
  instances: CustomStatisticResultInstance[] | null;
  /**
   * Every limit on the metric, in written order.
   *
   * A list, since a `warn` may sit short of a `fail`. Empty, never absent.
   */
  limits: ReportLimit[];
  /**
   * The metric's name: its target's name, then its path.
   *
   * Stable across runs, so a consumer can join one report to the next.
   */
  name: string;
  /** The metric's path within its target, with no target name on the front. */
  path: string;
  /**
   * `bytes` where the value counts bytes, `null` for a plain count.
   *
   * Bytes are raw and decimal: a renderer showing kilobytes divides by 1000.
   */
  unit: MetricUnit;
  value: number;
}

/** One target's metrics, and whether its globs claimed anything at all. */
export interface ReportTarget {
  /**
   * True when the target's globs matched no files.
   *
   * Said outright, since a target matching nothing passes every limit while measuring nothing.
   */
  empty: boolean;
  /** How many files the target's globs claimed. */
  files: number;
  metrics: ReportMetric[];
  name: string;
}

/**
 * Statistics specific to shell scripts, counted with patterns rather than a parser. Only constructs a reader recognizes on sight.
 */
export interface ShellStatistics {
  commentLines: number;
  comments: number;
  conditionals: number;
  exports: number;
  files: number;
  functions: number;
  lines: number;
  loops: number;
  pipelines: number;
  shebangs: number;
  variables: number;
}

/**
 * Statistics specific to SQL scripts.
 */
export interface SqlStatistics {
  comments: number;
  commonTableExpressions: number;
  creates: number;
  deletes: number;
  files: number;
  inserts: number;
  joins: number;
  lines: number;
  selects: number;
  statements: number;
  updates: number;
}

/**
 * Structural statistics specific to TOML documents.
 */
export interface TomlStatistics {
  arrays: number;
  arrayTables: number;
  comments: number;
  files: number;
  keys: number;
  lines: number;
  tables: number;
}
// 🏷️ Types

/** Code statistics specific to TypeScript source files. */
export interface TypescriptStatistics {
  decorators: number;
  docComments: number;
  enums: number;
  files: number;
  genericDeclarations: number;
  interfaces: number;
}

/**
 * Structural statistics specific to YAML documents. A file is a stream, so `documents` is counted apart from `files`.
 */
export interface YamlStatistics {
  aliases: number;
  anchors: number;
  comments: number;
  documents: number;
  files: number;
  keys: number;
  lines: number;
  mappings: number;
  maxDepth: number;
  scalars: number;
  sequences: number;
}
