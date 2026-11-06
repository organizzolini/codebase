import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
} from "./database.constants";
import { DatabaseService } from "./database.service";

import type { DataSource } from "typeorm";

// 🧪 Tests

type Row = Record<string, number | string>;

const TAGS = [
  ["aspects", null],
  ["major", "aspects"],
  ["conjunction", "major"],
] as const;

const CLOSURE = [
  ["aspects", "aspects"],
  ["aspects", "major"],
  ["aspects", "conjunction"],
  ["major", "major"],
  ["major", "conjunction"],
  ["conjunction", "conjunction"],
] as const;

describe("databaseService.refreshReadModel", () => {
  let dataSource: DataSource;
  let service: DatabaseService;

  beforeAll(async () => {
    dataSource = createSqliteDataSource(
      {
        entities: CAELUNDAS_DATABASE_ENTITIES,
        migrations: CAELUNDAS_DATABASE_MIGRATIONS,
        project: CAELUNDAS_DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: ":memory:" },
    );
    await dataSource.initialize();
    await dataSource.runMigrations();
    service = new DatabaseService(dataSource);
  });

  beforeEach(async () => {
    for (const table of [
      "calendar_event_tag_nodes",
      "tag_nodes",
      "calendar_event_tags",
      "tags_closure",
      "tags",
      "calendar_events",
    ]) {
      await dataSource.query(`delete from ${table}`);
    }

    for (const [name, parent] of TAGS) {
      await dataSource.query(
        `insert into tags (id, name, parent_id) values (?, ?, ?)`,
        [name, name, parent],
      );
    }

    for (const [ancestor, descendant] of CLOSURE) {
      await dataSource.query(
        `insert into tags_closure (ancestor_id, descendant_id) values (?, ?)`,
        [ancestor, descendant],
      );
    }

    for (const [id, tag] of [
      ["event-1", "conjunction"],
      ["event-2", "major"],
    ]) {
      await dataSource.query(
        `insert into calendar_events (id, description, "end", latitude, longitude, "start", summary, timezone)
         values (?, 'd', '2026-01-01T00:00:00.000Z', '40.000000', '-70.000000', '2026-01-01T00:00:00.000Z', ?, 'UTC')`,
        [id, id],
      );
      await dataSource.query(
        `insert into calendar_event_tags (calendar_event_id, tag_id) values (?, ?)`,
        [id, tag],
      );
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("fills tag_nodes with every tag's depth, root and path", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(dataSource.manager);

    const rows = await dataSource.query<Row[]>(
      `select id, depth, root_id, path from tag_nodes order by depth`,
    );

    expect(rows).toStrictEqual([
      { depth: 0, id: "aspects", path: "aspects", root_id: "aspects" },
      { depth: 1, id: "major", path: "aspects / major", root_id: "aspects" },
      {
        depth: 2,
        id: "conjunction",
        path: "aspects / major / conjunction",
        root_id: "aspects",
      },
    ]);
  });

  it("fills one row per event and tag, ancestors included, marking the direct ones", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(dataSource.manager);

    const rows = await dataSource.query<Row[]>(
      `select calendar_event_id, tag_id, tag_depth, is_direct
         from calendar_event_tag_nodes order by calendar_event_id, tag_depth`,
    );

    expect(rows).toStrictEqual([
      {
        calendar_event_id: "event-1",
        is_direct: 0,
        tag_depth: 0,
        tag_id: "aspects",
      },
      {
        calendar_event_id: "event-1",
        is_direct: 0,
        tag_depth: 1,
        tag_id: "major",
      },
      {
        calendar_event_id: "event-1",
        is_direct: 1,
        tag_depth: 2,
        tag_id: "conjunction",
      },
      {
        calendar_event_id: "event-2",
        is_direct: 0,
        tag_depth: 0,
        tag_id: "aspects",
      },
      {
        calendar_event_id: "event-2",
        is_direct: 1,
        tag_depth: 1,
        tag_id: "major",
      },
    ]);
  });

  it("replaces what an earlier refresh left, so it can run after every ingest", async () => {
    expect.hasAssertions();

    await service.refreshReadModel(dataSource.manager);
    await dataSource.query(
      `delete from calendar_event_tags where calendar_event_id = 'event-2'`,
    );
    await service.refreshReadModel(dataSource.manager);

    const rows = await dataSource.query<Row[]>(
      `select count(*) as count from calendar_event_tag_nodes`,
    );

    expect(rows).toStrictEqual([{ count: 3 }]);
  });

  it("joins the caller's transaction, so a rollback undoes the refresh", async () => {
    expect.hasAssertions();

    await expect(
      dataSource.transaction(async (manager) => {
        await service.refreshReadModel(manager);

        throw new Error("rolled back");
      }),
    ).rejects.toThrow("rolled back");

    const rows = await dataSource.query<Row[]>(
      `select count(*) as count from tag_nodes`,
    );

    expect(rows).toStrictEqual([{ count: 0 }]);
  });
});
