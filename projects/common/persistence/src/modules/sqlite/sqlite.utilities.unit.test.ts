import { DefaultNamingStrategy } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  assertSqliteEnvironmentKeys,
  createSqliteDataSource,
  sqliteConnection,
  sqliteDataSourceOptions,
  sqliteEnvironment,
  sqliteEnvironmentKey,
  sqliteEnvironmentKeys,
  sqliteEnvironmentSchema,
} from "./sqlite.utilities";

// 🧪 Tests

describe("sqlite utilities", () => {
  describe(assertSqliteEnvironmentKeys, () => {
    it("accepts a shape with a key for every one of the project's variables", () => {
      expect(() => {
        assertSqliteEnvironmentKeys(
          sqliteEnvironmentSchema({ project: "fixture" }),
          "fixture",
        );
      }).not.toThrow();
    });

    it("names every variable a shape has no key for", () => {
      expect(() => {
        assertSqliteEnvironmentKeys({ OTHER: z.string() }, "fixture");
      }).toThrow(/FIXTURE_SQLITE_DATABASE/);
    });
  });

  describe(createSqliteDataSource, () => {
    it("builds the command-line data source from the project's prefixed variable alone", () => {
      const dataSource = createSqliteDataSource(
        {
          entities: [],
          migrations: ["src/modules/sample-database/migrations/*.ts"],
          project: "sample",
        },
        {
          SAMPLE_SQLITE_DATABASE: "output/sample.sqlite",
          SQLITE_DATABASE: "x",
        },
      );

      expect(dataSource.options).toMatchObject({
        database: "output/sample.sqlite",
        migrations: ["src/modules/sample-database/migrations/*.ts"],
        migrationsRun: false,
        synchronize: false,
        type: "better-sqlite3",
      });
    });
  });

  describe(sqliteConnection, () => {
    it("reads the database path from the project's prefixed variable", () => {
      expect(
        sqliteConnection({
          environment: {
            FIXTURE_SQLITE_DATABASE: "output/fixture.sqlite",
            SQLITE_DATABASE: "ignored.sqlite",
          },
          project: "fixture",
        }),
      ).toStrictEqual({ database: "output/fixture.sqlite" });
    });

    it("defaults the database from the project's name", () => {
      expect(
        sqliteConnection({ environment: {}, project: "fixture" }),
      ).toStrictEqual({ database: "fixture.sqlite" });
    });

    it("refuses an empty path", () => {
      expect(() =>
        sqliteConnection({
          environment: { FIXTURE_SQLITE_DATABASE: "" },
          project: "fixture",
        }),
      ).toThrow(/database/);
    });
  });

  describe(sqliteDataSourceOptions, () => {
    const settings = { entities: [], migrations: [] };

    it("opens the given file with the better-sqlite3 driver", () => {
      expect(
        sqliteDataSourceOptions({ database: ":memory:" }, settings),
      ).toMatchObject({ database: ":memory:", type: "better-sqlite3" });
    });

    it("never synchronizes and never runs migrations on start", () => {
      expect(
        sqliteDataSourceOptions({ database: ":memory:" }, settings),
      ).toMatchObject({ migrationsRun: false, synchronize: false });
    });

    it("names columns in snake case unless told otherwise", () => {
      expect(
        sqliteDataSourceOptions({ database: ":memory:" }, settings)
          .namingStrategy,
      ).toBeInstanceOf(SnakeNamingStrategy);
    });

    it("uses the naming strategy it is given", () => {
      const namingStrategy = new DefaultNamingStrategy();

      expect(
        sqliteDataSourceOptions(
          { database: ":memory:" },
          { ...settings, namingStrategy },
        ).namingStrategy,
      ).toBe(namingStrategy);
    });

    it("passes the entities and migrations through", () => {
      expect(
        sqliteDataSourceOptions(
          { database: ":memory:" },
          {
            entities: ["src/**/*.entity.ts"],
            migrations: ["src/migrations/*.ts"],
          },
        ),
      ).toMatchObject({
        entities: ["src/**/*.entity.ts"],
        migrations: ["src/migrations/*.ts"],
      });
    });
  });

  describe(sqliteEnvironment, () => {
    it("renders a connection as the project's prefixed variable", () => {
      expect(
        sqliteEnvironment({
          connection: { database: "output/fixture.sqlite" },
          project: "fixture",
        }),
      ).toStrictEqual({ FIXTURE_SQLITE_DATABASE: "output/fixture.sqlite" });
    });
  });

  describe(sqliteEnvironmentKey, () => {
    it("prefixes the variable with the upper-cased project", () => {
      expect(sqliteEnvironmentKey("caelundas", "database")).toBe(
        "CAELUNDAS_SQLITE_DATABASE",
      );
    });

    it("refuses a project name that could not prefix a variable", () => {
      expect(() => sqliteEnvironmentKey("Bad-Name", "database")).toThrow(
        /Bad-Name/,
      );
    });
  });

  describe(sqliteEnvironmentKeys, () => {
    it("lists the variables a project reads", () => {
      expect(sqliteEnvironmentKeys("fixture")).toStrictEqual([
        "FIXTURE_SQLITE_DATABASE",
      ]);
    });
  });

  describe(sqliteEnvironmentSchema, () => {
    it("defaults the variable from the project's name alone", () => {
      expect(
        z.object(sqliteEnvironmentSchema({ project: "fixture" })).parse({}),
      ).toStrictEqual({ FIXTURE_SQLITE_DATABASE: "fixture.sqlite" });
    });

    it("validates the variable it is given", () => {
      expect(
        z
          .object(sqliteEnvironmentSchema({ project: "fixture" }))
          .parse({ FIXTURE_SQLITE_DATABASE: "output/fixture.sqlite" }),
      ).toStrictEqual({ FIXTURE_SQLITE_DATABASE: "output/fixture.sqlite" });
    });
  });
});
