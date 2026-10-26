import { z } from "zod";

import {
  DATASET_SQL,
  EVENTS_IN_WINDOW_SQL,
  FACETS_SQL,
  GROUP_COLUMN_SQL,
  WHOLE_DATASET_WINDOW,
} from "./events-database.constants";

import type {
  CalendarEventRecord,
  EventFacet,
  EventsDatabase,
  EventsDataset,
  EventsQuery,
  SqlExecutor,
  SqlGroupSource,
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

// A key SQL could not work out, such as the day of an event in a zone that
// does not parse, puts the event in no group rather than one named "null".
const groupKeysSchema = z
  .array(
    z.object({
      key: z.union([z.number(), z.string()]).nullable(),
      label: z.string().nullable(),
      path: z.string().nullable(),
    }),
  )
  .transform((keys) =>
    keys.flatMap(({ key, label, path }) =>
      key === null ? [] : [{ key: String(key), label, path }],
    ),
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
      const filter = query.filter ?? null;
      const groups = query.groups ?? [];
      const rows = await executor.select(
        // Replacer functions, so nothing in a condition or a group source is
        // read as a replacement pattern.
        EVENTS_IN_WINDOW_SQL.replace("{groups}", () =>
          toGroupColumns(groups),
        ).replace("{filter}", () =>
          filter === null ? "" : `and ${filter.sql}`,
        ),
        [
          ...groups.flatMap((group) => group.parameters),
          query.window.end.toISOString(),
          query.window.start.toISOString(),
          ...(filter?.parameters ?? []),
        ],
      );

      return rows.map((row) => toEventRecord(row, groups.length));
    },

    async findFacets(window = WHOLE_DATASET_WINDOW) {
      return toFacets(
        await executor.select(FACETS_SQL, [
          window.end.toISOString(),
          window.start.toISOString(),
        ]),
      );
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
 * Maps one event row, whose tags and each level's groups arrive as JSON
 * arrays, to the calendar's event shape.
 */
function toEventRecord(row: SqlRow, groupLevels: number): CalendarEventRecord {
  return {
    color: readText(row, "color"),
    description: readRequiredText(row, "description"),
    durationMinutes: Number(row["duration_minutes"]),
    end: readDate(row, "end"),
    groups: Array.from({ length: groupLevels }, (_, level) =>
      groupKeysSchema.parse(
        JSON.parse(readRequiredText(row, `group_${String(level)}`)),
      ),
    ),
    id: readRequiredText(row, "id"),
    location: readText(row, "location"),
    start: readDate(row, "start"),
    summary: readRequiredText(row, "summary"),
    tags: tagsSchema.parse(JSON.parse(readRequiredText(row, "tags"))),
    timezone: readRequiredText(row, "timezone"),
  };
}

/**
 * Gathers the tag rows, roots first in path order, into one facet per root.
 */
function toFacets(rows: readonly SqlRow[]): EventFacet[] {
  const facets = new Map<string, EventFacet>();

  for (const row of rows) {
    const depth = Number(row["depth"]);
    const id = readRequiredText(row, "id");
    const name = readRequiredText(row, "name");

    if (depth === 0) {
      facets.set(id, { id, name, values: [] });
      continue;
    }

    facets.get(readRequiredText(row, "root_id"))?.values.push({
      count: Number(row["count"]),
      depth,
      id,
      name,
      path: readRequiredText(row, "path_below_root"),
    });
  }

  return [...facets.values()];
}

/**
 * The select list's extra columns, one JSON array of group keys per level,
 * named `group_0` onward.
 */
function toGroupColumns(groups: readonly SqlGroupSource[]): string {
  return groups
    .map((group, level) =>
      GROUP_COLUMN_SQL.replace("{source}", () => group.sql).replace(
        "{column}",
        `group_${String(level)}`,
      ),
    )
    .join("");
}
