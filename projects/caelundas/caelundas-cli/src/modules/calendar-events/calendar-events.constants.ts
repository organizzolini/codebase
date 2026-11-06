import { POSTGRES_MAXIMUM_PARAMETERS } from "../../caelundas-cli.constants";

// ♟️ Constants

/**
 * The columns an upsert binds a value for, one bind parameter per row each.
 * The database assigns the id and both audit stamps, which are `DEFAULT`
 * keywords in the statement rather than parameters.
 */
export const CALENDAR_EVENT_INSERT_COLUMNS = [
  "color",
  "description",
  "end",
  "latitude",
  "location",
  "longitude",
  "start",
  "summary",
  "timezone",
] as const;

/** The columns that identify an event, which a conflicting upsert matches on. */
export const CALENDAR_EVENT_CONFLICT_COLUMNS = [
  "summary",
  "start",
  "end",
  "latitude",
  "longitude",
] as const;

/** The database columns a conflicting upsert overwrites; `created_at` is kept. */
export const CALENDAR_EVENT_UPDATE_COLUMNS = [
  "updated_at",
  "color",
  "description",
  "location",
  "timezone",
] as const;

/** Rows per `INSERT`, sized so a batch stays under {@link POSTGRES_MAXIMUM_PARAMETERS}. */
export const CALENDAR_EVENT_BATCH_SIZE = Math.floor(
  POSTGRES_MAXIMUM_PARAMETERS / CALENDAR_EVENT_INSERT_COLUMNS.length,
);

/** Event-tag links per `INSERT`, two bind parameters each. */
export const CALENDAR_EVENT_TAG_BATCH_SIZE = Math.floor(
  POSTGRES_MAXIMUM_PARAMETERS / 2,
);

/** Decimal places the `latitude` and `longitude` columns store. */
export const COORDINATE_DECIMAL_PLACES = 6;
