import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { vi } from "vitest";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_DATABASE_PROJECT,
} from "@codebase/caelundas-entities";
import { createSqliteDataSource } from "@codebase/persistence";

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
      entities: CAELUNDAS_DATABASE_ENTITIES,
      migrations: CAELUNDAS_DATABASE_MIGRATIONS,
      project: CAELUNDAS_DATABASE_PROJECT,
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
