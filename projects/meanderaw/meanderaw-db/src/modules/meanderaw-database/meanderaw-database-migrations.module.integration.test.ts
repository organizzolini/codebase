import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  type DatabaseTestingModule,
  startDatabaseTestingModule,
} from "@codebase/persistence/testing";

import {
  MEANDERAW_DATABASE_ENTITIES,
  MEANDERAW_DATABASE_MIGRATIONS,
} from "./data-source.constants";
import { MeanderawDatabaseModule } from "./meanderaw-database.module";

// 🧪 Tests

/** The tables of `meanderaw`'s schema, sorted, read as the migrations leave them. */
const TABLES_QUERY = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'meanderaw' AND table_name <> 'migrations' ORDER BY table_name`;

/**
 * Reverts every migration and runs them again over a throwaway Postgres
 * container, so each `down` is proved to undo what its `up` built, and the
 * schema is proved to build from nothing.
 */
describe("meanderaw-database migrations", () => {
  let database: DatabaseTestingModule;

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: MeanderawDatabaseModule,
      entities: [...MEANDERAW_DATABASE_ENTITIES],
      migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
      project: "meanderaw",
    });
  });

  afterAll(async () => {
    await database.close();
  });

  it("reverts to an empty schema, one migration at a time, and runs forward again", async () => {
    // The module's own connection runs no migrations, so this one is given them.
    const dataSource = await new DataSource({
      ...database.dataSource.options,
      migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
    }).initialize();

    await expect(
      dataSource.query<unknown[]>(TABLES_QUERY),
    ).resolves.toStrictEqual([
      { table_name: "characteristics" },
      { table_name: "meander_characteristics" },
      { table_name: "meanders" },
    ]);

    for (const _migration of MEANDERAW_DATABASE_MIGRATIONS) {
      await dataSource.undoLastMigration();
    }

    await expect(
      dataSource.query<unknown[]>(TABLES_QUERY),
    ).resolves.toStrictEqual([]);

    await dataSource.runMigrations();

    await expect(
      dataSource.query<unknown[]>(TABLES_QUERY),
    ).resolves.toStrictEqual([
      { table_name: "characteristics" },
      { table_name: "meander_characteristics" },
      { table_name: "meanders" },
    ]);

    await dataSource.destroy();
  });
});
