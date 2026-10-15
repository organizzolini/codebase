import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  postgresUri,
} from "../../../testing/fixture-database";
import { mockStandardInputTerminal } from "../../../testing/mocks";
import { startPostgresContainer } from "../database/postgres-container.utilities";

import type { StartedPostgresContainer } from "../database/postgres-container.types";

describe("import --clean --data", () => {
  const setStandardInputTerminal = mockStandardInputTerminal();
  let source: StartedPostgresContainer;
  let target: StartedPostgresContainer;
  let sourceDataSource: DataSource;
  let targetDataSource: DataSource;
  let directory: string;
  let dump: string;

  /** Rows of `sql` run against the target. */
  async function rows(sql: string): Promise<unknown[]> {
    const result: unknown[] = await targetDataSource.query(sql);
    return result;
  }

  /** `import --clean --data --yes` of `tables` from the dump. */
  async function runClean(
    tables: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        postgresUri(target.connection),
        ...tables.flatMap((table) => ["--table", table]),
        "--data",
        "--clean",
        "--yes",
        "--file",
        dump,
      ],
    });
  }

  beforeAll(async () => {
    [source, target] = await Promise.all([
      startPostgresContainer({ migrations: [], project: "fixture" }),
      startPostgresContainer({ migrations: [], project: "fixture" }),
    ]);
    const connect = (container: StartedPostgresContainer): DataSource =>
      new DataSource({
        database: container.connection.database,
        host: container.connection.host,
        password: container.connection.password,
        port: container.connection.port,
        type: "postgres",
        username: container.connection.username,
      });
    sourceDataSource = connect(source);
    targetDataSource = connect(target);
    await Promise.all([
      sourceDataSource.initialize(),
      targetDataSource.initialize(),
    ]);

    await sourceDataSource.query(
      "CREATE SCHEMA archive; CREATE TABLE archive.notes (id integer PRIMARY KEY, body text NOT NULL); INSERT INTO archive.notes VALUES (1, 'first'), (2, 'second'); CREATE TABLE archive.refs (id integer PRIMARY KEY, note_id integer REFERENCES archive.notes (id)); INSERT INTO archive.refs VALUES (10, 2)",
    );
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-clean-data-"));
    dump = path.join(directory, "archive.dump");
    const exported = await runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        postgresUri(source.connection),
        "--table",
        "archive.notes",
        "--table",
        "archive.refs",
        "--data",
        "--file",
        dump,
      ],
    });
    if (exported.exitCode !== 0) throw new Error(exported.stderr);
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    setStandardInputTerminal(false);
    // The target holds other rows in the same shape, and a table not dumped.
    await targetDataSource.query(
      "DROP SCHEMA IF EXISTS archive CASCADE; CREATE SCHEMA archive; CREATE TABLE archive.notes (id integer PRIMARY KEY, body text NOT NULL); INSERT INTO archive.notes VALUES (1, 'old'), (3, 'stale'); CREATE TABLE archive.refs (id integer PRIMARY KEY, note_id integer REFERENCES archive.notes (id)); INSERT INTO archive.refs VALUES (20, 1); CREATE TABLE archive.other (id integer PRIMARY KEY, kept text); INSERT INTO archive.other VALUES (1, 'mine')",
    );
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    fs.rmSync(directory, { force: true, recursive: true });
    await Promise.all([sourceDataSource.destroy(), targetDataSource.destroy()]);
    await Promise.all([source.stop(), target.stop()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "empties the selected tables and refills them from the dump, leaving an unselected table alone",
    async () => {
      expect.hasAssertions();

      const result = await runClean(["archive.notes", "archive.refs"]);

      expect(result.exitCode).toBe(0);
      await expect(
        rows("SELECT id, body FROM archive.notes ORDER BY id"),
      ).resolves.toStrictEqual([
        { body: "first", id: 1 },
        { body: "second", id: 2 },
      ]);
      await expect(
        rows("SELECT id, note_id FROM archive.refs"),
      ).resolves.toStrictEqual([{ id: 10, note_id: 2 }]);
      await expect(
        rows("SELECT kept FROM archive.other"),
      ).resolves.toStrictEqual([{ kept: "mine" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "refuses, naming the unselected table to add, and truncates nothing",
    async () => {
      expect.hasAssertions();

      const result = await runClean(["archive.notes"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("--table archive.refs");
      expect(result.stderr).toContain("Nothing was truncated");
      expect(result.stderr).not.toContain(target.connection.password);
      await expect(
        rows("SELECT id FROM archive.notes ORDER BY id"),
      ).resolves.toStrictEqual([{ id: 1 }, { id: 3 }]);
      await expect(rows("SELECT id FROM archive.refs")).resolves.toStrictEqual([
        { id: 20 },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "says the tables may be empty when the restore fails after the truncate",
    async () => {
      expect.hasAssertions();

      // The dump's rows break a rule only the target has.
      await targetDataSource.query(
        "ALTER TABLE archive.notes ADD CONSTRAINT notes_not_first CHECK (body <> 'first')",
      );

      const result = await runClean(["archive.notes", "archive.refs"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("may now be empty");
      expect(result.stderr).toContain("same file");
      expect(result.stderr).not.toContain(target.connection.password);
      await expect(
        rows("SELECT count(*)::int AS count FROM archive.notes"),
      ).resolves.toStrictEqual([{ count: 0 }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
