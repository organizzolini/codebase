import { z } from "zod";

import { DATASET_SQL, EVENTS_IN_WINDOW_SQL } from "./events-database.constants";

import type {
  CalendarEventRecord,
  EventsDatabase,
  EventsDataset,
  EventsQuery,
  SqlExecutor,
  SqlRow,
} from "./events-database.types";

const tagsSchema = z.array(
  z.object({
    depth: z.number(),
    id: z.string(),
    name: z.string(),
    path: z.string(),
  }),
);

/**
 * Builds the events database over any executor. Every query lives here, so
 * the browser worker and the tests' `node:sqlite` database run the same SQL.
 */
export function createEventsDatabase(executor: SqlExecutor): EventsDatabase {
  return {
    async describeDataset() {
      const rows = await executor.select(DATASET_SQL, []);

      return rows.map((row) => toDataset(row)).at(0) ?? null;
    },

    async findEvents(query: EventsQuery) {
      const rows = await executor.select(EVENTS_IN_WINDOW_SQL, [
        query.window.end.toISOString(),
        query.window.start.toISOString(),
      ]);

      return rows.map((row) => toEventRecord(row));
    },
  };
}

/**
 * Reads an ISO 8601 text column as an instant.
 */
function readDate(row: SqlRow, column: string): Date {
  return new Date(readRequiredText(row, column));
}

/**
 * Reads a column the schema declares `not null` as text.
 */
function readRequiredText(row: SqlRow, column: string): string {
  return String(row[column]);
}

/**
 * Reads a nullable text column.
 */
function readText(row: SqlRow, column: string): null | string {
  const value = row[column];

  return typeof value === "string" ? value : null;
}

/**
 * Maps the dataset summary row.
 */
function toDataset(row: SqlRow): EventsDataset {
  return {
    count: Number(row["count"]),
    end: readDate(row, "end"),
    start: readDate(row, "start"),
    timezone: readRequiredText(row, "timezone"),
  };
}

/**
 * Maps one event row, whose tags arrive as a JSON array, to the calendar's
 * event shape.
 */
function toEventRecord(row: SqlRow): CalendarEventRecord {
  return {
    color: readText(row, "color"),
    description: readRequiredText(row, "description"),
    durationMinutes: Number(row["duration_minutes"]),
    end: readDate(row, "end"),
    id: readRequiredText(row, "id"),
    location: readText(row, "location"),
    start: readDate(row, "start"),
    summary: readRequiredText(row, "summary"),
    tags: tagsSchema.parse(JSON.parse(readRequiredText(row, "tags"))),
    timezone: readRequiredText(row, "timezone"),
  };
}
