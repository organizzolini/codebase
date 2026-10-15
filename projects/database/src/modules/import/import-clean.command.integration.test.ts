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

describe("import --clean --schema", () => {
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

  /** `import --clean` of `tables` from the dump, plus `extra` options. */
  async function runClean(
    tables: readonly string[],
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        postgresUri(target.connection),
        ...tables.flatMap((table) => ["--table", table]),
        "--schema",
        "--data",
        "--clean",
        "--file",
        dump,
        ...extra,
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
      "CREATE SCHEMA archive; CREATE TABLE archive.notes (id serial PRIMARY KEY, body text NOT NULL UNIQUE); INSERT INTO archive.notes (body) VALUES ('first'), ('second'); CREATE TABLE archive.other (id serial PRIMARY KEY); CREATE TABLE archive.refs (id serial PRIMARY KEY, note_id integer REFERENCES archive.notes (id))",
    );
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-clean-"));
    dump = path.join(directory, "notes.dump");
    const exported = await runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        postgresUri(source.connection),
        "--table",
        "archive.notes",
        "--data",
        "--schema",
        "--file",
        dump,
      ],
    });
    if (exported.exitCode !== 0) throw new Error(exported.stderr);
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    setStandardInputTerminal(false);
    // The target's notes differs from the dump's: another shape, other rows.
    await targetDataSource.query(
      "DROP SCHEMA IF EXISTS archive CASCADE; CREATE SCHEMA archive; CREATE TABLE archive.notes (id serial PRIMARY KEY, stale text); INSERT INTO archive.notes (stale) VALUES ('old'); CREATE TABLE archive.other (id serial PRIMARY KEY, kept text); INSERT INTO archive.other (kept) VALUES ('mine')",
    );
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    fs.rmSync(directory, { force: true, recursive: true });
    await Promise.all([sourceDataSource.destroy(), targetDataSource.destroy()]);
    await Promise.all([source.stop(), target.stop()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "replaces the selected table with the dump's, and leaves an unselected table alone",
    async () => {
      expect.hasAssertions();

      const result = await runClean(["archive.notes"], "--yes");

      expect(result.exitCode).toBe(0);
      await expect(
        rows("SELECT id, body FROM archive.notes ORDER BY id"),
      ).resolves.toStrictEqual([
        { body: "first", id: 1 },
        { body: "second", id: 2 },
      ]);
      await expect(
        rows("SELECT kept FROM archive.other"),
      ).resolves.toStrictEqual([{ kept: "mine" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "creates the selected table when the target lacks it",
    async () => {
      expect.hasAssertions();

      await targetDataSource.query("DROP TABLE archive.notes");

      const result = await runClean(["archive.notes"], "--yes");

      expect(result.exitCode).toBe(0);
      await expect(
        rows("SELECT count(*)::int AS count FROM archive.notes"),
      ).resolves.toStrictEqual([{ count: 2 }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails without --yes when there is no terminal, changing nothing",
    async () => {
      expect.hasAssertions();

      const result = await runClean(["archive.notes"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("--yes");
      await expect(
        rows("SELECT stale FROM archive.notes"),
      ).resolves.toStrictEqual([{ stale: "old" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "is rolled back whole when the drop is refused",
    async () => {
      expect.hasAssertions();

      // refs is not selected, so dropping notes without CASCADE must fail.
      await targetDataSource.query(
        "CREATE TABLE archive.refs (id serial PRIMARY KEY, note_id integer REFERENCES archive.notes (id))",
      );

      const result = await runClean(["archive.notes"], "--yes");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Nothing was imported");
      await expect(
        rows("SELECT stale FROM archive.notes"),
      ).resolves.toStrictEqual([{ stale: "old" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
