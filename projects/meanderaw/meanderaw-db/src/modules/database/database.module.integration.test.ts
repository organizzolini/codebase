import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  type DatabaseTestingModule,
  startDatabaseTestingModule,
} from "@codebase/persistence/testing";

import { meanderRecord } from "../../../testing/meanders";

import {
  DATABASE_ENTITIES,
  MEANDERAW_DATABASE_MIGRATIONS,
} from "./data-source.constants";
import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";
import { Meander } from "./modules/meander/meander.entity";

// 🧪 Tests

describe("meanderaw database module", () => {
  /**
   * Boots the real `DatabaseModule` from configuration alone, the way the CLI
   * does, against a throwaway Postgres container standing in for the local
   * one, migrated by the project's real migrations: the server's address,
   * credentials, database, and schema all arrive as `MEANDERAW_POSTGRES_*`
   * variables, while the unprefixed `POSTGRES_DB` the workspace root's `.env`
   * sets for the shared container's admin login is ignored.
   */
  describe(DatabaseModule, () => {
    let database: DatabaseTestingModule;

    beforeAll(async () => {
      // 🎯 The workspace root's `.env`, which Nx loads into every task, names
      // the admin login under the unprefixed variable; it must be ignored.
      vi.stubEnv("POSTGRES_DB", "postgres");

      database = await startDatabaseTestingModule({
        database: DatabaseModule,
        entities: [Meander],
        migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
        project: "meanderaw",
      });
    });

    afterAll(async () => {
      await database.close();
      vi.unstubAllEnvs();
    });

    it("writes rows into the meanderaw schema, every column in snake case", async () => {
      await database.module
        .get(DatabaseService)
        .save(meanderRecord({ code: "01x02y0" }));

      const columns: { column_name: string }[] = await database.module
        .get(DataSource)
        .query(
          "SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'meanders' ORDER BY column_name",
          [database.container.connection.schema],
        );

      expect(columns.map((column) => column.column_name)).toStrictEqual([
        "code",
        "columns",
        "created_at",
        "created_by",
        "id",
        "is_hardcoded",
        "lattice",
        "repeats",
        "rows",
        "symmetrical_codes",
        "updated_at",
        "updated_by",
      ]);
      expect(database.container.connection.schema).toBe("meanderaw");
    });

    it("reads back the row it wrote", async () => {
      await expect(
        database.module.get(DatabaseService).findOneByCode("01x02y0"),
      ).resolves.toMatchObject({ code: "01x02y0", isHardcoded: true });
    });

    it("builds the table by migration alone, never by synchronizing", async () => {
      const migrations: unknown[] = await database.module
        .get(DataSource)
        .query(`SELECT name FROM "meanderaw"."migrations" ORDER BY timestamp`);

      expect(migrations).toStrictEqual([
        { name: "Migration1791160950069" },
        { name: "Migration1791414023001" },
        { name: "Migration1794630084904" },
        { name: "Migration1794700000000" },
        { name: "Migration1794800000000" },
        { name: "Migration1794900000000" },
        { name: "Migration1795000000000" },
      ]);
    });
  });

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
        database: DatabaseModule,
        entities: [...DATABASE_ENTITIES],
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
        { table_name: "aggregate_markers" },
        { table_name: "characteristic_pair_counts" },
        { table_name: "characteristic_shape_counts" },
        { table_name: "characteristic_value_counts" },
        { table_name: "characteristics" },
        { table_name: "meander_characteristics" },
        { table_name: "meanders" },
        { table_name: "shape_counts" },
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
        { table_name: "aggregate_markers" },
        { table_name: "characteristic_pair_counts" },
        { table_name: "characteristic_shape_counts" },
        { table_name: "characteristic_value_counts" },
        { table_name: "characteristics" },
        { table_name: "meander_characteristics" },
        { table_name: "meanders" },
        { table_name: "shape_counts" },
      ]);

      await dataSource.destroy();
    });
  });
});
