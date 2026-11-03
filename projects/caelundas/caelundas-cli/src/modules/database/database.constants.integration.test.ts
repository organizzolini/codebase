import { readFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import {
  DATABASE_ENTITIES,
  DATABASE_MIGRATIONS,
  DATABASE_PROJECT,
} from "./database.constants";

import type { DataSource } from "typeorm";

// 🧪 Tests

/**
 * The migrations are the one description of the tables: caelundas-web reads
 * their generated SQL, so they must stay what the entities describe.
 *
 * TypeORM's own comparison, `createSchemaBuilder().log()`, cannot be used: it
 * finds foreign keys and partial indexes by matching upper-case SQL, while the
 * migrations are written in the lower-case form the SQL linter requires, so it
 * reports every table as needing a rebuild. The columns and index names of each
 * entity are compared instead.
 */
describe("the caelundas schema", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createSqliteDataSource(
      {
        entities: DATABASE_ENTITIES,
        migrations: DATABASE_MIGRATIONS,
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

  it("has every column and index the entities describe", async () => {
    expect.hasAssertions();

    const described = [];
    const created = [];

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

  it("loads the committed night sky seed with every segment's stars", async () => {
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
