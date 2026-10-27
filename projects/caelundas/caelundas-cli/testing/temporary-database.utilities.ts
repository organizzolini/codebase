import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { vi } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import { DATABASE_ENTITIES } from "../src/modules/database/database.constants";
import { Migration1793045891250 } from "../src/modules/database/migrations/1793045891250-migration";

import type { TemporaryDatabase } from "./temporary-database.types";

/**
 * Creates a caelundas database file in a temporary directory, with its
 * tables, and points `CAELUNDAS_SQLITE_DATABASE` at it, so every application
 * context the suite boots afterwards, and the returned `DataSource`, share
 * that one file. Several connections to a file take turns writing, which the
 * suites' sequential runs allow.
 *
 * `close` closes the connection, deletes the directory, and restores the
 * environment.
 */
export async function createTemporaryDatabase(): Promise<TemporaryDatabase> {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "caelundas-"));
  const file = path.join(directory, "database.sqlite");
  vi.stubEnv("CAELUNDAS_SQLITE_DATABASE", file);
  const dataSource = createSqliteDataSource(
    {
      entities: DATABASE_ENTITIES,
      migrations: [Migration1793045891250],
      project: "caelundas",
    },
    { CAELUNDAS_SQLITE_DATABASE: file },
  );
  await dataSource.initialize();
  await dataSource.runMigrations();

  return {
    close: async (): Promise<void> => {
      await dataSource.destroy();
      fs.rmSync(directory, { force: true, recursive: true });
      vi.unstubAllEnvs();
    },
    dataSource,
  };
}
