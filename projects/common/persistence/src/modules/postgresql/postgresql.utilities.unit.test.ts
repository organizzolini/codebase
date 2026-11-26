import { createMock } from "@golevelup/ts-vitest";
import { DataSource, MigrationExecutor } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  MigrationFailedError,
  PluralSnakeNamingStrategy,
} from "./postgresql.constants";
import {
  assertPostgresEnvironmentKeys,
  createDataSource,
  openDataSource,
  postgresConnection,
  postgresDataSourceOptions,
  postgresEnvironment,
  postgresEnvironmentSchema,
  runMigrationsLocked,
} from "./postgresql.utilities";

import type { PostgresConnection } from "./postgresql.types";
import type { QueryRunner } from "typeorm";

// 🧪 Tests

const connection: PostgresConnection = {
  database: "fixture_development",
  host: "localhost",
  password: "fixture_password",
  port: 5432,
  schema: "fixture",
  username: "fixture_username",
};

describe("database utilities", () => {
  describe(assertPostgresEnvironmentKeys, () => {
    it("accepts a shape with a key for every one of the project's variables", () => {
      expect(() => {
        assertPostgresEnvironmentKeys(
          postgresEnvironmentSchema({ project: "fixture" }),
          "fixture",
        );
      }).not.toThrow();
    });

    it("names every variable a shape has no key for", () => {
      expect(() => {
        assertPostgresEnvironmentKeys(
          { FIXTURE_POSTGRES_HOST: z.string() },
          "fixture",
        );
      }).toThrow(/FIXTURE_POSTGRES_DATABASE, FIXTURE_POSTGRES_PASSWORD/);
    });
  });

  describe(createDataSource, () => {
    it("builds the command-line data source from the project's prefixed variables alone", () => {
      const dataSource = createDataSource(
        {
          entities: [],
          migrations: ["src/modules/sample-database/migrations/*.ts"],
          project: "sample",
        },
        {
          POSTGRES_DB: "postgres",
          POSTGRES_USER: "postgres",
          SAMPLE_POSTGRES_HOST: "database.internal",
        },
      );

      expect(dataSource.options).toMatchObject({
        database: "sample_development",
        host: "database.internal",
        migrations: ["src/modules/sample-database/migrations/*.ts"],
        migrationsRun: false,
        schema: "sample",
        synchronize: false,
        username: "sample_username",
      });
    });
  });

  describe(postgresConnection, () => {
    it("reads the connection from the project's prefixed variables", () => {
      expect(
        postgresConnection({
          environment: {
            FIXTURE_POSTGRES_DATABASE: "fixture_testing",
            FIXTURE_POSTGRES_HOST: "database.internal",
            FIXTURE_POSTGRES_PORT: "6543",
            POSTGRES_DB: "postgres",
          },
          project: "fixture",
        }),
      ).toStrictEqual({
        database: "fixture_testing",
        host: "database.internal",
        password: "fixture_password",
        port: 6543,
        schema: "fixture",
        username: "fixture_username",
      });
    });
  });

  describe(postgresDataSourceOptions, () => {
    it("connects to the given database and schema as the given role", () => {
      expect(
        postgresDataSourceOptions(connection, { entities: [], migrations: [] }),
      ).toMatchObject({
        database: "fixture_development",
        host: "localhost",
        password: "fixture_password",
        port: 5432,
        schema: "fixture",
        type: "postgres",
        username: "fixture_username",
      });
    });

    it("pins every pooled connection's search path to the schema alone", () => {
      expect(
        postgresDataSourceOptions(connection, { entities: [], migrations: [] }),
      ).toMatchObject({ extra: { options: "-c search_path=fixture" } });
    });

    it("refuses a schema it could not name in the search path unquoted", () => {
      expect(() =>
        postgresDataSourceOptions(
          { ...connection, schema: "fixture,public" },
          { entities: [], migrations: [] },
        ),
      ).toThrow(/fixture,public/);
    });

    it("refuses a schema that would smuggle another setting into the parameter", () => {
      expect(() =>
        postgresDataSourceOptions(
          { ...connection, schema: "fixture -c statement_timeout=0" },
          { entities: [], migrations: [] },
        ),
      ).toThrow(/statement_timeout/);
    });

    it("never synchronizes and never runs migrations on start", () => {
      expect(
        postgresDataSourceOptions(connection, { entities: [], migrations: [] }),
      ).toMatchObject({ migrationsRun: false, synchronize: false });
    });

    it("names tables in plural snake case", () => {
      expect(
        postgresDataSourceOptions(connection, { entities: [], migrations: [] })
          .namingStrategy,
      ).toBeInstanceOf(PluralSnakeNamingStrategy);
    });

    it("passes the entities and migrations through", () => {
      expect(
        postgresDataSourceOptions(connection, {
          entities: ["src/**/*.entity.ts"],
          migrations: ["src/modules/fixture-persistence/migrations/*.ts"],
        }),
      ).toMatchObject({
        entities: ["src/**/*.entity.ts"],
        migrations: ["src/modules/fixture-persistence/migrations/*.ts"],
      });
    });
  });

  describe(postgresEnvironment, () => {
    it("renders a connection as the project's prefixed variables", () => {
      expect(
        postgresEnvironment({
          connection: {
            ...connection,
            database: "fixture_testing",
            host: "127.0.0.1",
            port: 55_432,
          },
          project: "fixture",
        }),
      ).toStrictEqual({
        FIXTURE_POSTGRES_DATABASE: "fixture_testing",
        FIXTURE_POSTGRES_HOST: "127.0.0.1",
        FIXTURE_POSTGRES_PASSWORD: "fixture_password",
        FIXTURE_POSTGRES_PORT: "55432",
        FIXTURE_POSTGRES_SCHEMA: "fixture",
        FIXTURE_POSTGRES_USERNAME: "fixture_username",
      });
    });
  });

  describe(postgresEnvironmentSchema, () => {
    it("defaults every variable from the project's name alone", () => {
      const environmentSchema = z.object(
        postgresEnvironmentSchema({ project: "fixture" }),
      );

      expect(environmentSchema.parse({})).toStrictEqual({
        FIXTURE_POSTGRES_DATABASE: "fixture_development",
        FIXTURE_POSTGRES_HOST: "localhost",
        FIXTURE_POSTGRES_PASSWORD: "fixture_password",
        FIXTURE_POSTGRES_PORT: 5432,
        FIXTURE_POSTGRES_SCHEMA: "fixture",
        FIXTURE_POSTGRES_USERNAME: "fixture_username",
      });
    });

    it("ignores the root's unprefixed variables", () => {
      const environmentSchema = z.object(
        postgresEnvironmentSchema({ project: "sample" }),
      );

      expect(
        environmentSchema.parse({
          POSTGRES_DB: "postgres",
          POSTGRES_PASSWORD: "postgres",
          POSTGRES_USER: "postgres",
        }),
      ).toMatchObject({
        SAMPLE_POSTGRES_DATABASE: "sample_development",
        SAMPLE_POSTGRES_PASSWORD: "sample_password",
        SAMPLE_POSTGRES_USERNAME: "sample_username",
      });
    });

    it("reads a set variable over its default, coercing the port to a number", () => {
      const environmentSchema = z.object(
        postgresEnvironmentSchema({ project: "fixture" }),
      );

      expect(
        environmentSchema.parse({
          FIXTURE_POSTGRES_DATABASE: "fixture_testing",
          FIXTURE_POSTGRES_PORT: "15432",
        }),
      ).toMatchObject({
        FIXTURE_POSTGRES_DATABASE: "fixture_testing",
        FIXTURE_POSTGRES_PORT: 15_432,
      });
    });

    it("spreads beside an application's own variables", () => {
      const environmentSchema = z.object({
        ...postgresEnvironmentSchema({ project: "fixture" }),
        LOG_LEVEL: z.string().default("info"),
      });

      expect(environmentSchema.parse({})).toMatchObject({
        FIXTURE_POSTGRES_SCHEMA: "fixture",
        LOG_LEVEL: "info",
      });
    });

    it("rejects a port that is not a positive integer", () => {
      const environmentSchema = z.object(
        postgresEnvironmentSchema({ project: "fixture" }),
      );

      expect(() =>
        environmentSchema.parse({ FIXTURE_POSTGRES_PORT: "not-a-port" }),
      ).toThrow(/expected number/i);
    });

    it("rejects a schema it could not name unquoted, naming the variable", () => {
      const environmentSchema = z.object(
        postgresEnvironmentSchema({ project: "fixture" }),
      );

      expect(() =>
        environmentSchema.parse({ FIXTURE_POSTGRES_SCHEMA: "fixture,public" }),
      ).toThrow(/FIXTURE_POSTGRES_SCHEMA/);
    });

    it("refuses a project name that cannot prefix a variable", () => {
      expect(() =>
        postgresEnvironmentSchema({ project: "fixture-api" }),
      ).toThrow(/fixture-api/);
    });
  });

  describe(runMigrationsLocked, () => {
    /** A runner recording, in `calls`, each step it is asked to take. */
    const recordingRunner = (calls: string[]): QueryRunner => {
      const runner = createMock<QueryRunner>();
      const record = (step: string) => async (): Promise<void> => {
        await Promise.resolve();
        calls.push(step);
      };
      runner.connect.mockImplementation(async () => {
        await record("connect")();
      });
      runner.startTransaction.mockImplementation(record("start"));
      runner.commitTransaction.mockImplementation(record("commit"));
      runner.rollbackTransaction.mockImplementation(record("rollback"));
      runner.release.mockImplementation(record("release"));
      runner.query.mockImplementation(async (sql: string) => {
        await Promise.resolve();
        calls.push(sql);

        return [];
      });

      return runner;
    };

    /** A data source handing out `runner`, whose migrations succeed or fail. */
    const sourceOf = (
      runner: QueryRunner,
      calls: string[],
      failure?: Error,
    ): DataSource => {
      vi.spyOn(
        MigrationExecutor.prototype,
        "executePendingMigrations",
      ).mockImplementation(async () => {
        await Promise.resolve();
        calls.push("migrate");
        if (failure) {
          throw failure;
        }

        return [];
      });

      return createMock<DataSource>({ createQueryRunner: () => runner });
    };

    it("migrates in one transaction that holds a transaction-scoped lock", async () => {
      const calls: string[] = [];

      await runMigrationsLocked(sourceOf(recordingRunner(calls), calls));

      expect(calls).toStrictEqual([
        "connect",
        "start",
        "select pg_advisory_xact_lock(7361040911)",
        "migrate",
        "commit",
        "release",
      ]);
    });

    it("runs the migrations on the runner that holds the lock", async () => {
      const calls: string[] = [];
      const runner = recordingRunner(calls);
      const spy = vi.spyOn(
        MigrationExecutor.prototype,
        "executePendingMigrations",
      );
      const source = sourceOf(runner, calls);

      await runMigrationsLocked(source);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.contexts[0]).toMatchObject({ queryRunner: runner });
    });

    it("rolls back, releases, and rethrows when a migration fails", async () => {
      const calls: string[] = [];
      const failure = new Error("boom");

      await expect(
        runMigrationsLocked(sourceOf(recordingRunner(calls), calls, failure)),
      ).rejects.toThrow(failure);

      expect(calls.slice(-3)).toStrictEqual(["migrate", "rollback", "release"]);
    });

    it("rethrows the migration error when the rollback fails too", async () => {
      const calls: string[] = [];
      const failure = new Error("boom");
      const runner = recordingRunner(calls);
      vi.mocked(runner.rollbackTransaction).mockRejectedValue(
        new Error("rollback failed"),
      );

      await expect(
        runMigrationsLocked(sourceOf(runner, calls, failure)),
      ).rejects.toThrow(failure);
    });
  });

  describe(openDataSource, () => {
    // Its connection is stubbed, and `failure` is raised by the migrations.
    /** Opens a data source with `migrations`. */
    const open = async (
      migrations: string[],
      failure?: Error,
    ): Promise<{ destroyed: number; migrated: number }> => {
      const executor = vi
        .spyOn(MigrationExecutor.prototype, "executePendingMigrations")
        .mockImplementation(async () => {
          await Promise.resolve();
          if (failure) {
            throw failure;
          }

          return [];
        });
      vi.spyOn(DataSource.prototype, "initialize").mockResolvedValue(
        createMock<DataSource>(),
      );
      const destroy = vi
        .spyOn(DataSource.prototype, "destroy")
        .mockResolvedValue(undefined);
      vi.spyOn(DataSource.prototype, "createQueryRunner").mockReturnValue(
        createMock<QueryRunner>(),
      );

      await openDataSource({ migrations, type: "postgres" });

      return {
        destroyed: destroy.mock.calls.length,
        migrated: executor.mock.calls.length,
      };
    };

    it("applies no migrations when the project gave none", async () => {
      await expect(open([])).resolves.toStrictEqual({
        destroyed: 0,
        migrated: 0,
      });
    });

    it("applies the pending migrations when the project gave some", async () => {
      await expect(open(["migrations/*.ts"])).resolves.toStrictEqual({
        destroyed: 0,
        migrated: 1,
      });
    });

    it("closes the connection and throws a MigrationFailedError that keeps the cause", async () => {
      const failure = new Error("boom");

      const rejection = open(["migrations/*.ts"], failure);

      await expect(rejection).rejects.toBeInstanceOf(MigrationFailedError);
      await expect(rejection).rejects.toMatchObject({
        cause: failure,
        message: expect.stringContaining("boom") as string,
      });
      expect(DataSource.prototype.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
