// ♟️ Constants

/** The most bind parameters one SQLite statement accepts, as SQLite 3.32 and later set it. */
export const SQLITE_MAXIMUM_PARAMETERS = 32_766;

/**
 * The database columns an upsert writes, each one bind parameter per row:
 * the application generates the id and writes both audit stamps.
 */
export const CALENDAR_EVENT_INSERT_COLUMNS = [
  "id",
  "createdAt",
  "updatedAt",
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

/** Rows per `INSERT`, sized so a batch stays under {@link SQLITE_MAXIMUM_PARAMETERS}. */
export const CALENDAR_EVENT_BATCH_SIZE = Math.floor(
  SQLITE_MAXIMUM_PARAMETERS / CALENDAR_EVENT_INSERT_COLUMNS.length,
);

/** Event-tag links per `INSERT`, two bind parameters each. */
export const CALENDAR_EVENT_TAG_BATCH_SIZE = Math.floor(
  SQLITE_MAXIMUM_PARAMETERS / 2,
);

/** Decimal places the `latitude` and `longitude` columns store. */
export const COORDINATE_DECIMAL_PLACES = 6;
