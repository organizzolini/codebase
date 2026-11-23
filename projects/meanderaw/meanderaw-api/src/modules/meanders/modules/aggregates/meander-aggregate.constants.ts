// ♟️ Constants

/** The shape fields the shape count tables are keyed by. */
export const AGGREGATE_SHAPE_FIELDS: ReadonlySet<string> = new Set([
  "columns",
  "rows",
]);

/** The most shape rows a snapshot loads. */
export const MAXIMUM_SHAPE_ROWS = 10_000;
