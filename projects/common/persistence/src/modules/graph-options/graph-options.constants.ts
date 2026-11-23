// ♟️ Constants

import { z } from "zod";

/** Rows read per query, and ids named per follow-up query. */
export const GRAPH_BATCH_SIZE = 500;

/** The flag and help text of `--dry-run`, which every graph command takes. */
export const GRAPH_DRY_RUN_OPTION = {
  description:
    "Check the options and list the entity files, without connecting to a database or drawing anything",
  flags: "--dry-run",
} as const;

/** The flag and help text of `--entities`. */
export const GRAPH_ENTITIES_OPTION = {
  description:
    "Glob of the entity files to import, e.g. 'src/**/*.entity.ts'; repeat for several",
  flags: "--entities <glob>",
} as const;

/** Flag and help text of `--filter`, for every graph render command. */
export const GRAPH_FILTER_OPTION = {
  description:
    "Keep edges whose row matches column<op>value, e.g. --filter weight>1; columns are the edge entity's, repeat and all must match. Operators: = (equal), != (not equal), ~= (contains, case-sensitive), < and > (numeric or date columns only). A node is drawn only if a kept edge touches it",
  flags: "--filter <expression>",
} as const;

/** Flag and help text of `--max-breadth`, for every graph render command. */
export const GRAPH_MAX_BREADTH_OPTION = {
  description:
    "Most children drawn under any one node, in sort order; the rest become one '… K more' node and a warning. Roots are never capped. Positive integer",
  flags: "--max-breadth <n>",
} as const;

/** Flag and help text of `--max-depth`, for every graph render command. */
export const GRAPH_MAX_DEPTH_OPTION = {
  description:
    "Deepest level drawn, with roots at level 1; a node's level is its shortest distance from a root. Children below it become one '… K more' node and a warning. Positive integer",
  flags: "--max-depth <n>",
} as const;

/** The flag and help text of `--output-json`. */
export const GRAPH_OUTPUT_JSON_OPTION = {
  description:
    "Write the graph as pretty JSON to this file, creating its folders; with any output file, the diagram is not printed. An existing file is refused unless --overwrite. Relative paths resolve from the working directory",
  flags: "--output-json <path>",
} as const;

/** The flag and help text of `--output-markdown`. */
export const GRAPH_OUTPUT_MARKDOWN_OPTION = {
  description:
    "Write the diagram as a fenced Mermaid block to this file, creating its folders, with warnings after the fence; with any output file, the diagram is not printed. An existing file is refused unless --overwrite. Relative paths resolve from the working directory",
  flags: "--output-markdown <path>",
} as const;

/** The flag and help text of `--overwrite`. */
export const GRAPH_OVERWRITE_OPTION = {
  description:
    "Replace an existing --output-markdown or --output-json file; without it, an existing file is refused and left unchanged",
  flags: "--overwrite",
} as const;

/** The flag and help text of `--schema`. */
export const GRAPH_SCHEMA_OPTION = {
  description: "Schema the entity tables live in; required",
  flags: "--schema <name>",
} as const;

/** Flag and help text of `--sort`, for every graph render command. */
export const GRAPH_SORT_OPTION = {
  description:
    "Sort edges by column[:asc|desc], e.g. --sort weight:desc; repeat for several keys, applied in order, then by source and target. Edge order sets the order of roots and of siblings, before --max-depth and --max-breadth cut the graph",
  flags: "--sort <expression>",
} as const;

/** The flag and help text of `--source-uri`. */
export const GRAPH_SOURCE_URI_OPTION = {
  description:
    "Connection URI of the database to read from, e.g. postgresql://user:password@host:5432/database",
  flags: "--source-uri <uri>",
} as const;

/** Missing-option messages, keyed by option, each showing its usage. */
export const GRAPH_OPTION_MESSAGES = {
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
export class GraphOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = GraphOptionsError.name;
  }
}

/** A cap flag whose value is not a positive integer, naming the value given. */
export const graphPositiveIntegerMessage = (
  flag: string,
  value: string,
): string =>
  `${flag} must be a positive integer, e.g. ${flag} 3; got "${value}"`;

/** `--table` qualified with a schema other than `--schema`. */
export const graphTableSchemaMessage = (
  table: string,
  schema: string,
): string =>
  `--table ${table} is qualified with a schema other than --schema ${schema}: name the table as ${schema}.<table> or as <table> alone`;

/** A `--filter` that is not `column<op>value`, naming the grammar and its operators. */
export const graphFilterSyntaxMessage = (expression: string): string =>
  `--filter "${expression}" must be column<op>value, e.g. --filter name~=Inbox; operators are =, !=, ~= (contains), <, >`;

/** A `--sort` that is not `column`, `column:asc`, or `column:desc`. */
export const graphSortSyntaxMessage = (expression: string): string =>
  `--sort "${expression}" must be column, column:asc, or column:desc, e.g. --sort name:desc`;

/** A `--filter` or `--sort` that names a column the entity does not have. */
export const graphUnknownColumnMessage = ({
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

/** `column<op>value`: a column name, the operator, then the value, which keeps any operator characters after it. */
export const GRAPH_FILTER_PATTERN =
  /^([A-Za-z_][A-Za-z0-9_]*)(!=|~=|=|<|>)([\s\S]*)$/u;

/** `column`, optionally followed by `:asc` or `:desc`. */
export const GRAPH_SORT_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)(?::(asc|desc))?$/u;

/** The operators a `--filter` may use, each a token `GRAPH_FILTER_PATTERN` matches. */
export const GRAPH_FILTER_OPERATORS = ["!=", "<", "=", ">", "~="] as const;

/** SQL types a filter compares as numbers, such as `integer` or `numeric(10,2)`. */
export const GRAPH_NUMBER_TYPE =
  /^(?:(?:small|big)?int(?:eger)?\d?|numeric|decimal|real|float\d*|double precision|(?:small|big)?serial)(?:\(.*\))?$/u;

/** SQL types a filter compares as dates or times, such as `timestamp with time zone`. */
export const GRAPH_DATE_TYPE = /^(?:date|time|timestamp)(?:\s|\(|$)/u;

/** A `<` or `>` value a numeric column accepts: an optional sign, digits, and an optional fraction. */
export const GRAPH_NUMBER_VALUE = /^[+-]?(?:\d+\.?\d*|\.\d+)$/u;

/** A `--filter` whose pattern matched: its column, its operator, and its value. */
export const GRAPH_FILTER_SCHEMA = z.object({
  column: z.string(),
  operator: z.enum(GRAPH_FILTER_OPERATORS),
  value: z.string(),
});

/** A `--sort` whose pattern matched: its column, and its direction, ascending when none was given. */
export const GRAPH_SORT_SCHEMA = z.object({
  column: z.string(),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

/** A `<` or `>` filter on a column that is not numeric or a date. */
export const graphComparisonKindMessage = (
  expression: string,
  column: string,
): string =>
  `--filter "${expression}" compares with < or >, which needs a numeric or date column; "${column}" is a text column`;

/** A `<` or `>` filter whose value is not a number, for a numeric column. */
export const graphNumberValueMessage = (
  expression: string,
  value: string,
): string => `--filter "${expression}": "${value}" is not a number`;

/** A `<` or `>` filter whose value is not a date, for a date column. */
export const graphDateValueMessage = (
  expression: string,
  value: string,
): string => `--filter "${expression}": "${value}" is not a date`;

/** An output path that names a directory, not a file. */
export const graphOutputDirectoryMessage = (
  flag: "--output-json" | "--output-markdown",
  file: string,
): string => {
  const example = flag === "--output-json" ? "tree.json" : "tree.md";
  return `${flag} ${file} is a directory: name a file path, e.g. ${flag} ${example}`;
};

/** An existing output file, left unchanged unless `--overwrite` allows replacing it. */
export const graphOutputExistsMessage = (file: string): string =>
  `${file} already exists and was left unchanged: choose another path, or pass --overwrite to replace it`;

/** An output whose nearest existing folder cannot hold a new file. */
export const graphOutputParentMessage = (
  flag: "--output-json" | "--output-markdown",
  parent: string,
): string =>
  `${flag} cannot write into ${parent}: it is not a writable directory`;

/** Both output flags given one path, which cannot hold two files. */
export const graphOutputSameFileMessage = (file: string): string =>
  `--output-markdown and --output-json name the same file ${file}: name two files`;
