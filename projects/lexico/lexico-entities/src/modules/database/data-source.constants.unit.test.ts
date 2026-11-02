import { beforeEach, describe, expect, it, vi } from "vitest";

import { postgresEnvironmentKeys } from "@codebase/persistence";
import { overrideEnvironment } from "@codebase/testing";

import { LexicoNamingStrategy } from "./database.constants";

import type { DataSourceOptions } from "typeorm";

/**
 * Loads TypeORM, the postgres driver, and every entity once while the file is
 * collected, outside any test's timeout. Each test still re-evaluates the
 * module after `vi.resetModules()`, which costs milliseconds once warm; a
 * cold first import took 4–6s on the saturated CI runner.
 */
import "./data-source.constants";

type PostgresDataSourceOptions = Extract<
  DataSourceOptions,
  { type: "postgres" }
>;

/** Re-evaluates the data source module against the current environment. */
async function loadDataSourceOptions(): Promise<PostgresDataSourceOptions> {
  vi.resetModules();

  const { lexicoDataSource } = await import("./data-source.constants");
  const { options } = lexicoDataSource;

  if (options.type !== "postgres") {
    throw new Error("Expected postgres data source options.");
  }

  return options;
}

describe("lexico data source", () => {
  beforeEach(() => {
    // 🎯 The root `.env`, which Nx loads into every task, names the shared
    // container's admin login under the unprefixed variables.
    overrideEnvironment({
      POSTGRES_DB: "postgres",
      POSTGRES_HOST: "admin.internal",
      POSTGRES_PASSWORD: "postgres",
      POSTGRES_PORT: "6000",
      POSTGRES_USER: "postgres",
      ...Object.fromEntries(
        postgresEnvironmentKeys("lexico").map((key) => [key, undefined]),
      ),
    });
  });

  it("defaults to lexico_development.lexico as lexico_username, ignoring the root's variables", async () => {
    const options = await loadDataSourceOptions();

    expect(options).toMatchObject({
      database: "lexico_development",
      host: "localhost",
      password: "lexico_password",
      port: 5432,
      schema: "lexico",
      type: "postgres",
      username: "lexico_username",
    });
  });

  it("reads the LEXICO_POSTGRES_* variables", async () => {
    overrideEnvironment({
      LEXICO_POSTGRES_DATABASE: "lexico_testing",
      LEXICO_POSTGRES_HOST: "database.internal",
      LEXICO_POSTGRES_PASSWORD: "custom_password",
      LEXICO_POSTGRES_PORT: "6001",
      LEXICO_POSTGRES_SCHEMA: "lexico_custom",
      LEXICO_POSTGRES_USERNAME: "custom_user",
    });

    const options = await loadDataSourceOptions();

    expect(options).toMatchObject({
      database: "lexico_testing",
      host: "database.internal",
      password: "custom_password",
      port: 6001,
      schema: "lexico_custom",
      username: "custom_user",
    });
  });

  it("never synchronizes or runs migrations, and keeps lexico's naming strategy", async () => {
    const options = await loadDataSourceOptions();

    expect(options.synchronize).toBe(false);
    expect(options.migrationsRun).toBe(false);
    expect(options.migrations).toStrictEqual([
      "src/modules/database/migrations/*.ts",
    ]);
    expect(options.namingStrategy?.constructor.name).toBe(
      LexicoNamingStrategy.name,
    );
  });
});
