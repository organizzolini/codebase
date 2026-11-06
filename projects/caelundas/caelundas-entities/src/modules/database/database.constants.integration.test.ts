import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
} from "./database.constants";

import type { DataSource } from "typeorm";

// 🧪 Tests

interface SchemaTable {
  columns: string[];
  indexes: string[];
  table: string;
}

describe("the caelundas entities", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "caelundas-entities-"));
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createSqliteDataSource(
      {
        entities: CAELUNDAS_DATABASE_ENTITIES,
        migrations: CAELUNDAS_DATABASE_MIGRATIONS,
        project: CAELUNDAS_DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: path.join(directory, "database.sqlite") },
    );
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await dataSource.destroy();
    rmSync(directory, { force: true, recursive: true });
  });

  it("has every column and index the entities describe", async () => {
    expect.hasAssertions();

    const described: SchemaTable[] = [];
    const created: SchemaTable[] = [];

    for (const metadata of dataSource.entityMetadatas) {
      const columns = await dataSource.query<{ name: string }[]>(
        `select name from pragma_table_info('${metadata.tableName}')`,
      );
      const indexes = await dataSource.query<{ name: string }[]>(
        `select name from pragma_index_list('${metadata.tableName}') where origin = 'c'`,
      );

      described.push({
        columns: metadata.columns
          .map(({ databaseName }) => databaseName)
          .toSorted(),
        indexes: metadata.indices.map(({ name }) => name).toSorted(),
        table: metadata.tableName,
      });
      created.push({
        columns: columns.map(({ name }) => name).toSorted(),
        indexes: indexes.map(({ name }) => name).toSorted(),
        table: metadata.tableName,
      });
    }

    expect(created).toStrictEqual(described);
  });

  it("creates the derived-times view", async () => {
    expect.hasAssertions();

    const views = await dataSource.query<{ name: string }[]>(
      `select name from sqlite_master where type = 'view'`,
    );

    expect(views.map(({ name }) => name)).toStrictEqual([
      "calendar_events_derived",
    ]);
  });

  it("records the view so a later generated migration finds it", async () => {
    expect.hasAssertions();

    const { upQueries } = await dataSource.driver.createSchemaBuilder().log();

    expect(
      upQueries.filter(({ query }) => /view|typeorm_metadata/iu.test(query)),
    ).toStrictEqual([]);
  });

  it("reverts to an empty database", async () => {
    expect.hasAssertions();

    await dataSource.undoLastMigration();

    const objects = await dataSource.query<{ name: string }[]>(
      `select name from sqlite_master where name not like 'sqlite_%' and name not in ('migrations', 'typeorm_metadata')`,
    );

    expect(objects).toStrictEqual([]);

    await dataSource.runMigrations();
  });

  it("describes the event, tag, closure, join, derived and night sky tables", async () => {
    expect.hasAssertions();

    const tables = await dataSource.query<{ name: string }[]>(
      `select name from sqlite_master where type = 'table' and name not like 'sqlite_%' and name not in ('migrations', 'typeorm_metadata') order by name`,
    );

    expect(tables.map(({ name }) => name)).toStrictEqual([
      "calendar_event_tag_nodes",
      "calendar_event_tags",
      "calendar_events",
      "constellation",
      "constellation_line",
      "star",
      "tag_nodes",
      "tags",
      "tags_closure",
    ]);
  });

  it("indexes the derived event tag table for both directions of lookup", async () => {
    expect.hasAssertions();

    const indexes = await dataSource.query<{ name: string }[]>(
      `select name from pragma_index_list('calendar_event_tag_nodes') where origin = 'c' order by name`,
    );

    expect(indexes.map(({ name }) => name)).toStrictEqual([
      "calendar_event_tag_nodes_event",
      "calendar_event_tag_nodes_tag",
    ]);
  });

  it("derives an event's times in a view", async () => {
    expect.hasAssertions();

    const insert = `insert into calendar_events
      (id, description, "end", latitude, longitude, "start", summary, timezone)
      values (?, 'd', ?, '40.000000', '-70.000000', ?, ?, 'UTC')`;

    await dataSource.query(insert, [
      "view-a",
      "2026-03-04T15:20:00.000Z",
      "2026-03-04T14:00:00.000Z",
      "view duration",
    ]);
    await dataSource.query(insert, [
      "view-b",
      "2026-03-04T14:00:00.000Z",
      "2026-03-04T14:00:00.000Z",
      "view instant",
    ]);

    const rows = await dataSource.query<Record<string, unknown>[]>(
      `select start_year, start_month, start_hour, start_quarter, start_day, duration_minutes, temporality
       from calendar_events_derived where id like 'view-%' order by id`,
    );

    expect(rows).toStrictEqual([
      {
        duration_minutes: 80,
        start_day: "2026-03-04",
        start_hour: 14,
        start_month: 3,
        start_quarter: 1,
        start_year: 2026,
        temporality: "Duration",
      },
      {
        duration_minutes: 0,
        start_day: "2026-03-04",
        start_hour: 14,
        start_month: 3,
        start_quarter: 1,
        start_year: 2026,
        temporality: "Instant",
      },
    ]);
  });

  it("keeps an event's natural key unique", async () => {
    expect.hasAssertions();

    const insert = `insert into calendar_events
      (id, description, "end", latitude, longitude, "start", summary, timezone)
      values (?, 'd', '2026-01-01T00:00:00.000Z', '40.000000', '-70.000000', '2026-01-01T00:00:00.000Z', 's', 'UTC')`;

    await dataSource.query(insert, ["a"]);

    await expect(dataSource.query(insert, ["b"])).rejects.toThrow(/UNIQUE/u);
  });
});
