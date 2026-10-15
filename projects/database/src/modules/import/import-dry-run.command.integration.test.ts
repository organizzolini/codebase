import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  postgresUri,
} from "../../../testing/fixture-database";
import { startPostgresContainer } from "../database/postgres-container.utilities";

import type { StartedPostgresContainer } from "../database/postgres-container.types";

const PASSWORD = "hunter2-secret";

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_TARGET_URI = `postgresql://fixture_username:${PASSWORD}@127.0.0.1:1/fixture_development`;

describe("import --dry-run", () => {
  let source: StartedPostgresContainer;
  let target: StartedPostgresContainer;
  let targetDataSource: DataSource;
  let directory: string;
  let dump: string;

  /** Rows of `sql` run against the target. */
  async function rows(sql: string): Promise<unknown[]> {
    const result: unknown[] = await targetDataSource.query(sql);
    return result;
  }

  /** `import --dry-run` of `archive.notes` into `targetUri`, plus `extra`. */
  async function runDryRun(
    targetUri: string,
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        targetUri,
        "--table",
        "archive.notes",
        "--file",
        dump,
        "--dry-run",
        ...extra,
      ],
    });
  }

  beforeAll(async () => {
    [source, target] = await Promise.all([
      startPostgresContainer({ migrations: [], project: "fixture" }),
      startPostgresContainer({ migrations: [], project: "fixture" }),
    ]);
    const sourceDataSource = new DataSource({
      database: source.connection.database,
      host: source.connection.host,
      password: source.connection.password,
      port: source.connection.port,
      type: "postgres",
      username: source.connection.username,
    });
    targetDataSource = new DataSource({
      database: target.connection.database,
      host: target.connection.host,
      password: target.connection.password,
      port: target.connection.port,
      type: "postgres",
      username: target.connection.username,
    });
    await Promise.all([
      sourceDataSource.initialize(),
      targetDataSource.initialize(),
    ]);

    await sourceDataSource.query(
      "CREATE SCHEMA archive; CREATE TABLE archive.notes (id serial PRIMARY KEY, body text NOT NULL); INSERT INTO archive.notes (body) VALUES ('first'), ('second')",
    );
    await targetDataSource.query(
      "CREATE SCHEMA archive; CREATE TABLE archive.notes (id serial PRIMARY KEY, body text NOT NULL); INSERT INTO archive.notes (body) VALUES ('old')",
    );
    await sourceDataSource.destroy();

    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-dry-run-"));
    dump = path.join(directory, "notes.dump");
    const exported = await runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        postgresUri(source.connection),
        "--table",
        "archive.notes",
        "--data",
        "--file",
        dump,
      ],
    });
    if (exported.exitCode !== 0) throw new Error(exported.stderr);
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    fs.rmSync(directory, { force: true, recursive: true });
    await targetDataSource.destroy();
    await Promise.all([source.stop(), target.stop()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "prints the plan and leaves the target unchanged, even with --clean",
    async () => {
      expect.hasAssertions();

      const result = await runDryRun(
        postgresUri(target.connection),
        "--data",
        "--clean",
      );

      const output = result.logs.join("\n");

      expect(result.exitCode).toBe(0);
      expect(output).toContain("archive.notes: the dump holds data");
      expect(output).toContain("--clean would truncate archive.notes");
      expect(output).not.toContain(target.connection.password);
      await expect(
        rows("SELECT body FROM archive.notes ORDER BY id"),
      ).resolves.toStrictEqual([{ body: "old" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "prints the plan for an unreachable target, connecting to nothing",
    async () => {
      const result = await runDryRun(UNREACHABLE_TARGET_URI, "--data");

      const output = result.logs.join("\n");

      expect(result.exitCode).toBe(0);
      expect(output).toContain('database "fixture_development" on 127.0.0.1');
      expect(output).toContain(dump);
      expect(`${output}${result.stderr}`).not.toContain(PASSWORD);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails a selection missing from the dump",
    async () => {
      const result = await runDryRun(UNREACHABLE_TARGET_URI, "--schema");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        `${dump} holds no table definitions for archive.notes`,
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
