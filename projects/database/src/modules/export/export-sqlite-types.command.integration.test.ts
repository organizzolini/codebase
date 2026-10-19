import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../testing/fixture-database";

import type { FixtureDatabase } from "../../../testing/fixture-database";

describe("export --sqlite column types", () => {
  let source: FixtureDatabase;
  let directory: string;
  let file: string;

  /** Runs `export --sqlite --data` of `table` from the `fixture` schema into `file`. */
  async function runExport(
    table: string,
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "export",
        "--sqlite",
        "--source-uri",
        source.uri,
        "--schema",
        "fixture",
        "--table",
        table,
        "--data",
        "--file",
        file,
      ],
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
    await source.query(
      `CREATE TABLE mapped_samples (
        id uuid PRIMARY KEY,
        happened_at timestamptz NOT NULL,
        amount numeric(12, 4),
        tags text[],
        active boolean NOT NULL
      )`,
    );
    await source.query(
      "CREATE TABLE unmapped_samples (id uuid PRIMARY KEY, span interval)",
    );
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-sqlite-type-"));
    file = path.join(directory, "fixture.sqlite");
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "exports a table whose column types all have a mapping",
    async () => {
      expect.hasAssertions();

      const result = await runExport("mapped_samples");

      expect(result.exitCode).toBe(0);
      expect(fs.existsSync(file)).toBe(true);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails naming the column of a type with no mapping, and writes nothing",
    async () => {
      expect.hasAssertions();

      const result = await runExport("unmapped_samples");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("fixture.unmapped_samples.span");
      expect(result.stderr).toContain("interval");
      expect(result.stderr).toContain("no SQLite mapping");
      expect(fs.readdirSync(directory)).toStrictEqual([]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
