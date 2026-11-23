// ♟️ Constants

/** Missing-option messages, keyed by option, each showing its usage. */
export const GRAPH_OPTION_MESSAGES = {
  entities:
    "--entities is required: name the entity files to read, e.g. --entities 'src/**/*.entity.ts'",
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
