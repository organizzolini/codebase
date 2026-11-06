import { readFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
} from "@codebase/caelundas-entities";
import { createSqliteDataSource } from "@codebase/persistence";

import type { DataSource } from "typeorm";

// 🧪 Tests

/**
 * `caelundas-web` loads `data/night-sky-seed.sql` into the tables the
 * `caelundas-entities` migration creates, so the seed must keep fitting them.
 */
describe("the committed night sky seed", () => {
  let dataSource: DataSource;

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
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("loads with every segment's stars", async () => {
    const seed = readFileSync(
      path.join(import.meta.dirname, "../../../data/night-sky-seed.sql"),
      "utf8",
    );

    await dataSource.transaction(async (manager) => {
      for (const statement of seed.split(/;\s*\n/u)) {
        if (statement.trim() !== "") {
          await manager.query<unknown>(statement);
        }
      }
    });

    await expect(
      dataSource.query("pragma foreign_key_check"),
    ).resolves.toStrictEqual([]);
    await expect(
      dataSource.query(
        "select count(*) as count from constellation where zodiac = 1",
      ),
    ).resolves.toStrictEqual([{ count: 12 }]);
  });
});
