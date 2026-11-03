import { afterEach, describe, expect, it, vi } from "vitest";

import { DATABASE_DEFAULT_FILE } from "./database.constants";

/** The data source's file, read from a fresh import under the environment given. */
async function databaseOf(variable?: string): Promise<unknown> {
  vi.resetModules();

  if (variable !== undefined) {
    vi.stubEnv("CAELUNDAS_SQLITE_DATABASE", variable);
  }

  const { caelundasDataSource } = await import("./data-source.constants");

  return caelundasDataSource.options.database;
}

describe("the caelundas command-line data source", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the project's own file when the variable is unset", async () => {
    vi.stubEnv("CAELUNDAS_SQLITE_DATABASE", undefined);

    await expect(databaseOf()).resolves.toBe(DATABASE_DEFAULT_FILE);
  });

  it("reads the file the variable names", async () => {
    await expect(databaseOf(":memory:")).resolves.toBe(":memory:");
  });
});
