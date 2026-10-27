import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import { DATABASE_ENTITIES, DATABASE_PROJECT } from "./database.constants";
import { Migration1793045891250 } from "./migrations/1793045891250-migration";

import type { DataSource } from "typeorm";

// 🧪 Tests

/**
 * The migration is the one description of the tables: caelundas-web reads its
 * generated SQL, so it must stay what the entities describe.
 */
describe("the caelundas schema", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createSqliteDataSource(
      {
        entities: DATABASE_ENTITIES,
        migrations: [Migration1793045891250],
        project: DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: ":memory:" },
    );
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("has no change left for the next generated migration to make", async () => {
    expect.hasAssertions();

    const pending = await dataSource.driver.createSchemaBuilder().log();

    expect(pending.upQueries).toStrictEqual([]);
  });
});
