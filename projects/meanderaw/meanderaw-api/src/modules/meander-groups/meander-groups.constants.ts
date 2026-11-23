import { z } from "zod";

// ♟️ Constants

/** The most levels one grouping may nest. */
export const MAXIMUM_GROUP_LEVELS = 4;

/** The longest level field accepted. */
export const MAXIMUM_FIELD_LENGTH = 512;

/** The levels that are not a characteristic key. */
export const SHAPE_GROUP_FIELDS = [
  "columns",
  "isHardcoded",
  "lattice",
  "rows",
  "rowsColumns",
] as const;

/** What the `meanderGroups` query describes, for the schema. */
export const MEANDER_GROUPS_QUERY_DESCRIPTION =
  "Counts the meanders a filter keeps, grouped by one or more levels, nested level by level. Counts are exact; the 0 or false bucket of a characteristic is its own group.";

/** What the `groupBy` argument describes, for the schema. */
export const GROUP_BY_ARGUMENT_DESCRIPTION =
  "The levels, outermost first: rows, columns, rowsColumns, lattice, isHardcoded or a characteristic key.";

/** What a `meanderGroups` query may ask for, checked at the API boundary. */
export const groupByArgumentsSchema = z
  .array(z.object({ field: z.string().min(1).max(MAXIMUM_FIELD_LENGTH) }))
  .min(1)
  .max(MAXIMUM_GROUP_LEVELS);

/** Orders keys as a person reads them: 2 before 10. */
export const KEY_ORDER = new Intl.Collator("en", { numeric: true });
