// ♟️ Constants

import { z } from "zod";

/** Rows read per query, and ids named per follow-up query. */
export const RENDER_BATCH_SIZE = 500;

/** The flag and help text of `--dry-run`, which every graph command takes. */
export const RENDER_DRY_RUN_OPTION = {
  description:
    "Check the options and list the entity files, without connecting to a database or drawing anything",
  flags: "--dry-run",
} as const;

/** The flag and help text of `--entities`. */
export const RENDER_ENTITIES_OPTION = {
  description:
    "Glob of the entity files to import, e.g. 'src/**/*.entity.ts'; repeat for several",
  flags: "--entities <glob>",
} as const;

/** Flag and help text of `--filter`, for every graph render command. */
export const RENDER_FILTER_OPTION = {
  description:
    "Keep edges whose row matches column<op>value, e.g. --filter weight>1; columns are the edge entity's, repeat and all must match. Operators: = (equal), != (not equal), ~= (contains, case-sensitive), < and > (numeric or date columns only). A node is drawn only if a kept edge touches it",
  flags: "--filter <expression>",
} as const;

/** Flag and help text of `--truncate-breadth`, for every graph render command. */
export const RENDER_TRUNCATE_BREADTH_OPTION = {
  description:
    "Most children drawn under any one node, in sort order; the rest become one '… K more' node and a warning. Roots are never capped. Positive integer",
  flags: "--truncate-breadth <n>",
} as const;

/** Flag and help text of `--truncate-depth`, for every graph render command. */
export const RENDER_TRUNCATE_DEPTH_OPTION = {
  description:
    "Deepest level drawn, with roots at level 1; a node's level is its shortest distance from a root. Children below it become one '… K more' node and a warning. Positive integer",
  flags: "--truncate-depth <n>",
} as const;

/** The flag and help text of `--output-json`. */
export const RENDER_OUTPUT_JSON_OPTION = {
  description:
    "Write the graph as pretty JSON to this file, creating its folders; with any output file, the diagram is not printed. An existing file is refused unless --overwrite. Relative paths resolve from the working directory",
  flags: "--output-json <path>",
} as const;

/** The flag and help text of `--output-markdown`. */
export const RENDER_OUTPUT_MARKDOWN_OPTION = {
  description:
    "Write the diagram as a fenced Mermaid block to this file, creating its folders, with warnings after the fence; with any output file, the diagram is not printed. An existing file is refused unless --overwrite. Relative paths resolve from the working directory",
  flags: "--output-markdown <path>",
} as const;

/** The flag and help text of `--overwrite`. */
export const RENDER_OVERWRITE_OPTION = {
  description:
    "Replace an existing --output-markdown or --output-json file; without it, an existing file is refused and left unchanged",
  flags: "--overwrite",
} as const;

/** The flag and help text of `--schema`. */
export const RENDER_SCHEMA_OPTION = {
  description: "Schema the entity tables live in; required",
  flags: "--schema <name>",
} as const;

/** Flag and help text of `--sort`, for every graph render command. */
export const RENDER_SORT_OPTION = {
  description:
    "Sort edges by column[:asc|desc], e.g. --sort weight:desc; repeat for several keys, applied in order, then by source and target. Edge order sets the order of roots and of siblings, before --truncate-depth and --truncate-breadth cut the graph",
  flags: "--sort <expression>",
} as const;

/** The flag and help text of `--source-uri`. */
export const RENDER_SOURCE_URI_OPTION = {
  description:
    "Connection URI of the database to read from, e.g. postgresql://user:password@host:5432/database",
  flags: "--source-uri <uri>",
} as const;

/** Missing-option messages, keyed by option, each showing its usage. */
export const RENDER_OPTION_MESSAGES = {
  entities:
    "--entities is required: name the entity files to read, e.g. --entities 'src/**/*.entity.ts'",
  pageNeedsLimit:
    "--page needs --limit: name how many roots a page holds, e.g. --page 2 --limit 20",
  schema:
    "--schema is required: name the schema the entity tables live in, e.g. --schema caelundas",
  sourceUri:
    "--source-uri is required: name the database to read from, e.g. --source-uri postgresql://user@host:5432/database",
} as const;

/**
 * A graph command line that cannot run, raised before any connection opens.
 * Its message names the option to fix and never repeats a URI.
 */
export class RenderOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = RenderOptionsError.name;
  }
}

/** A cap flag whose value is not a positive integer. */
export const renderOptionsPositiveIntegerMessage = (
  flag: string,
  value: string,
): string =>
  `${flag} must be a positive integer, e.g. ${flag} 3; got "${value}"`;

/** `--table` qualified with a schema other than `--schema`. */
export const renderOptionsTableSchemaMessage = (
  table: string,
  schema: string,
): string =>
  `--table ${table} is qualified with a schema other than --schema ${schema}: name the table as ${schema}.<table> or as <table> alone`;

/** A `--filter` that is not `column<op>value`, naming the grammar and its operators. */
export const renderOptionsFilterSyntaxMessage = (expression: string): string =>
  `--filter "${expression}" must be column<op>value, e.g. --filter name~=Inbox; operators are =, !=, ~= (contains), <, >`;

/** A `--sort` that is not `column`, `column:asc`, or `column:desc`. */
export const renderOptionsSortSyntaxMessage = (expression: string): string =>
  `--sort "${expression}" must be column, column:asc, or column:desc, e.g. --sort name:desc`;

/** A `--filter` or `--sort` naming a column the entity lacks. */
export const renderOptionsUnknownColumnMessage = ({
  column,
  columns,
  expression,
  flag,
}: {
  readonly column: string;
  readonly columns: readonly string[];
  readonly expression: string;
  readonly flag: "--filter" | "--sort";
}): string =>
  `${flag} "${expression}" names no column "${column}"; columns are ${columns.join(", ")}`;

/** `column<op>value`, where the value keeps any operator characters. */
export const RENDER_FILTER_PATTERN =
  /^([A-Za-z_][A-Za-z0-9_]*)(!=|~=|=|<|>)([\s\S]*)$/u;

/** `column`, optionally followed by `:asc` or `:desc`. */
export const RENDER_SORT_PATTERN =
  /^([A-Za-z_][A-Za-z0-9_]*)(?::(asc|desc))?$/u;

/** The operators a `--filter` may use, each a token `RENDER_FILTER_PATTERN` matches. */
export const RENDER_FILTER_OPERATORS = ["!=", "<", "=", ">", "~="] as const;

/** SQL types a filter compares as numbers, such as `integer` or `numeric(10,2)`. */
export const RENDER_NUMBER_TYPE =
  /^(?:(?:small|big)?int(?:eger)?\d?|numeric|decimal|real|float\d*|double precision|(?:small|big)?serial)(?:\(.*\))?$/u;

/** SQL types a filter compares as dates or times, such as `timestamp`. */
export const RENDER_DATE_TYPE = /^(?:date|time|timestamp)(?:\s|\(|$)/u;

/**
 * The numeric `<` or `>` value's shape: optional sign, digits, and fraction.
 */
export const RENDER_NUMBER_VALUE = /^[+-]?(?:\d+\.?\d*|\.\d+)$/u;

/** A `--filter` whose pattern matched: its column, its operator, and its value. */
export const RENDER_FILTER_SCHEMA = z.object({
  column: z.string(),
  operator: z.enum(RENDER_FILTER_OPERATORS),
  value: z.string(),
});

/** A parsed `--sort`: its column, and its direction, ascending by default. */
export const RENDER_SORT_SCHEMA = z.object({
  column: z.string(),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

/** A `<` or `>` filter on a text column. */
export const renderOptionsComparisonKindMessage = (
  expression: string,
  column: string,
): string =>
  `--filter "${expression}" compares with < or >, which needs a numeric or date column; "${column}" is a text column`;

/** A `<` or `>` filter whose value is not a number. */
export const renderOptionsNumberValueMessage = (
  expression: string,
  value: string,
): string => `--filter "${expression}": "${value}" is not a number`;

/** A `<` or `>` filter whose value is not a date. */
export const renderOptionsDateValueMessage = (
  expression: string,
  value: string,
): string => `--filter "${expression}": "${value}" is not a date`;

/** An output path that names a directory, not a file. */
export const renderOptionsOutputDirectoryMessage = (
  flag: "--output-json" | "--output-markdown",
  file: string,
): string => {
  const example = flag === "--output-json" ? "tree.json" : "tree.md";
  return `${flag} ${file} is a directory: name a file path, e.g. ${flag} ${example}`;
};

/** An existing output file, left unchanged unless `--overwrite` allows replacing it. */
export const renderOptionsOutputExistsMessage = (file: string): string =>
  `${file} already exists and was left unchanged: choose another path, or pass --overwrite to replace it`;

/** An output whose nearest existing folder cannot hold a new file. */
export const renderOptionsOutputParentMessage = (
  flag: "--output-json" | "--output-markdown",
  parent: string,
): string =>
  `${flag} cannot write into ${parent}: it is not a writable directory`;

/** Both output flags given one path, which cannot hold two files. */
export const renderOptionsOutputSameFileMessage = (file: string): string =>
  `--output-markdown and --output-json name the same file ${file}: name two files`;
