import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_PROJECT,
} from "./database.constants";

import type { DataSource } from "typeorm";

// 🧪 Tests

describe("the caelundas base entities", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createSqliteDataSource(
      {
        entities: CAELUNDAS_DATABASE_ENTITIES,
        migrations: [],
        project: CAELUNDAS_DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: ":memory:" },
    );
    await dataSource.initialize();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("describes the event, tag, closure, join and night sky tables", async () => {
    expect.hasAssertions();

    const tables = await dataSource.query<{ name: string }[]>(
      `select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name`,
    );

    expect(tables.map(({ name }) => name)).toStrictEqual([
      "calendar_event_tags",
      "calendar_events",
      "constellation",
      "constellation_line",
      "star",
      "tags",
      "tags_closure",
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
