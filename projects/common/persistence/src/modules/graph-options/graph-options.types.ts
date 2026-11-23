// 🏷️ Types

import type { PostgresConnection } from "../postgresql/postgresql.types";

/** A column of an entity, as a graph command reads it. */
export interface GraphColumn {
  /** The kind that decides which comparisons a filter may make. */
  readonly kind: GraphColumnKind;

  /** The column's property name, which `--filter` and `--sort` name. */
  readonly name: string;

  /** The column's name in the table, escaped for SQL by the connection's driver. */
  readonly sqlName: string;
}

/** How a column's values compare: numbers, dates and times, or everything else as text. */
export type GraphColumnKind = "date" | "number" | "text";

/** Options a graph render command receives: the graph options, and `--dry-run`. */
export interface GraphCommandOptions extends GraphOptions {
  /** Check the options and list the entity files, without connecting to a database. */
  readonly dryRun?: boolean | undefined;
}

/** One parsed `--filter`: the column it names, its comparison, and the value compared with. */
export interface GraphFilter {
  /** The column's property name, as the entity names it. */
  readonly column: string;

  /** The filter as the user typed it, for error messages. */
  readonly expression: string;

  /** The comparison the filter makes. */
  readonly operator: GraphFilterOperator;

  /** The text after the operator, which is compared as given. */
  readonly value: string;
}

/** A filter's comparison: equal, not equal, contains, less than, or greater than. */
export type GraphFilterOperator = "!=" | "<" | "=" | ">" | "~=";

/** Caps on the drawn graph; an absent cap draws all. */
export interface GraphLimits {
  /** The most children drawn under one node; `undefined` draws every child. */
  readonly maximumBreadth?: number | undefined;

  /** The deepest level drawn, with roots at level 1; `undefined` draws every level. */
  readonly maximumDepth?: number | undefined;
}

/** The options every graph command shares. The command validates them. */
export interface GraphOptions {
  /** Glob patterns of the entity files to import; repeatable. */
  readonly entities?: string[] | undefined;

  /** Each `column<op>value` row filter as text; repeatable, all must match. */
  readonly filter?: string[] | undefined;

  /** Roots per page, as text; a positive integer when given. */
  readonly limit?: string | undefined;

  /** The most children drawn under one node, as text; a positive integer when given. */
  readonly maxBreadth?: string | undefined;

  /** The deepest level drawn, roots being level 1, as text; a positive integer when given. */
  readonly maxDepth?: string | undefined;

  /** Path of the JSON graph file to write, as text. */
  readonly outputJson?: string | undefined;

  /** Path of the Markdown diagram file to write, as text. */
  readonly outputMarkdown?: string | undefined;

  /** Whether an existing output file may be replaced. */
  readonly overwrite?: boolean | undefined;

  /** Page of roots to draw, from 1, as text; needs `limit`. */
  readonly page?: string | undefined;

  /** The schema the entity tables live in; required. */
  readonly schema?: string | undefined;

  /** Each `column[:asc|desc]` sort key as text; repeatable, applied in order among siblings. */
  readonly sort?: string[] | undefined;

  /** Connection URI of the database to read from. */
  readonly sourceUri?: string | undefined;

  /** The table to pick when the entities match several; unqualified. */
  readonly table?: string | undefined;
}

/** A sort key resolved to its column, ready to become SQL. */
export interface GraphOrder {
  /** The column the key orders by. */
  readonly column: GraphColumn;

  /** The key's direction. */
  readonly direction: GraphSortDirection;
}

/** A file to write, with its content and path. */
export interface GraphOutputFile {
  /** The text written to the file. */
  readonly content: string;

  /** The absolute path the file is written to. */
  readonly path: string;
}

/** Output paths as the command line named them, relative or absolute. */
export interface GraphOutputRequest {
  /** The JSON graph file, as named. */
  readonly json?: string | undefined;

  /** The Markdown diagram file, as named. */
  readonly markdown?: string | undefined;

  /** Whether an existing output file may be replaced. */
  readonly overwrite?: boolean | undefined;
}

/** Where a graph command writes its files, each absolute when given. */
export interface GraphOutputs {
  /** Absolute path of the JSON graph file, if one is written. */
  readonly json: string | undefined;

  /** Absolute path of the Markdown diagram file, if one is written. */
  readonly markdown: string | undefined;

  /** Whether an existing output file may be replaced. */
  readonly overwrite: boolean;
}

/** One page of root nodes, numbered from 1. */
export interface GraphPaging {
  /** The roots a page holds. */
  readonly limit: number;

  /** The page drawn, from 1. */
  readonly page: number;
}

/** A validated graph command: where to read, which entities, and which table. */
export interface GraphPlan {
  /** The database and schema, with the password in it; never logged. */
  readonly connection: PostgresConnection;

  /** The entity glob patterns, in the order given. */
  readonly entities: readonly string[];

  /** The row filters, in the order given; every one must match. */
  readonly filters: readonly GraphFilter[];

  /** The most children drawn under one node, or `undefined` for every child. */
  readonly maximumBreadth: number | undefined;

  /** The deepest level drawn, or `undefined` for every level. */
  readonly maximumDepth: number | undefined;

  /** The files to write; with none, the diagram goes to stdout. */
  readonly outputs: GraphOutputs;

  /** The page of root nodes drawn, or `undefined` for every root. */
  readonly paging: GraphPaging | undefined;

  /** The sort keys, in the order given. */
  readonly sorts: readonly GraphSort[];

  /** `--source-uri` with its password masked, for log lines. */
  readonly source: string;

  /** The table name picked with `--table`, or `undefined` to pick the only one. */
  readonly table: string | undefined;
}

/** A filter resolved to its column, ready to become SQL. */
export interface GraphPredicate {
  /** The column the filter compares. */
  readonly column: GraphColumn;

  /** The comparison the filter makes. */
  readonly operator: GraphFilterOperator;

  /** The value compared with, bound as a parameter. */
  readonly value: string;
}

/** What a graph read draws: filters, sorts, paging, then caps. */
export interface GraphReadOptions extends GraphLimits {
  /** Rows read per query; a test seam, `undefined` for the default. */
  readonly batchSize?: number | undefined;

  /** The row filters, each by a column name; a row must match all of them. */
  readonly filters: readonly GraphFilter[];

  /** The page of root nodes to draw; `undefined` draws every root. */
  readonly paging?: GraphPaging | undefined;

  /** The sort keys, applied in order. */
  readonly sorts: readonly GraphSort[];
}

/** One parsed `--sort` key: the column it names and its direction. */
export interface GraphSort {
  /** The column's property name, as the entity names it. */
  readonly column: string;

  /** The key's direction; ascending when the user gave none. */
  readonly direction: GraphSortDirection;

  /** The key as the user typed it, for error messages. */
  readonly expression: string;
}

/** A sort's direction. */
export type GraphSortDirection = "asc" | "desc";

/** The row filters and sort keys a graph read applies, both resolved to columns. */
export interface GraphView {
  /** Every filter; a row must match all of them. */
  readonly filters: readonly GraphPredicate[];

  /** The sort keys, applied in order among siblings. */
  readonly sorts: readonly GraphOrder[];
}
