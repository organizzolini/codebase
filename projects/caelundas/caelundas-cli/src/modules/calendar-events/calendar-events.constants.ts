// ♟️ Constants
import { z } from "zod";

/** The most bind parameters one Postgres statement accepts. */
export const POSTGRES_MAXIMUM_PARAMETERS = 65_535;

/** The database columns an upsert writes, each one bind parameter per row. */
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
  "latitude",
  "longitude",
] as const;

/** The columns a conflicting upsert overwrites; `updated_at` advances on its own. */
export const CALENDAR_EVENT_UPDATE_COLUMNS = [
  "color",
  "description",
  "end",
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

/** The columns an upsert reads back from each row it writes, to link its tags. */
export const CALENDAR_EVENT_RETURNING_COLUMNS = [
  "id",
  "summary",
  "start",
] as const;

/** What an upsert reads back from each row it writes: its id and its key. */
export const WRITTEN_ROWS_SCHEMA = z.array(
  z.object({ id: z.string(), start: z.date(), summary: z.string() }),
);
