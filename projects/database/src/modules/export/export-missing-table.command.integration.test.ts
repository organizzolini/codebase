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

describe("export of a table that does not exist", () => {
  let source: FixtureDatabase;
  let directory: string;
  let file: string;

  /**
   * Runs `export --data` of `tables` from the source into `file`, with
   * `extra` flags, unqualified names resolving in the `fixture` schema.
   */
  async function runExport(
    tables: readonly string[],
    ...extra: string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        source.uri,
        "--schema",
        "fixture",
        ...tables.flatMap((table) => ["--table", table]),
        "--data",
        "--file",
        file,
        ...extra,
      ],
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-missing-"));
    file = path.join(directory, "missing.dump");
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "fails naming the table and leaves no file behind",
    async () => {
      expect.hasAssertions();

      const result = await runExport(["no_such_table"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "No table fixture.no_such_table exists in postgresql://",
      );
      expect(new URL(source.uri).password).not.toBe("");
      expect(result.stderr).not.toContain(new URL(source.uri).password);
      expect(result.stderr).toContain("check the --table name");
      expect(result.stderr).not.toContain("pg_dump failed");
      expect(fs.readdirSync(directory)).toStrictEqual([]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "names the missing table even when others exist, and writes nothing",
    async () => {
      expect.hasAssertions();

      const result = await runExport(["widgets", "no_such_table"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No table fixture.no_such_table exists");
      expect(fs.readdirSync(directory)).toStrictEqual([]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "keeps a file --overwrite would have replaced exactly as it was, with no temporary file left",
    async () => {
      expect.hasAssertions();

      fs.writeFileSync(file, "previous dump");

      const result = await runExport(["no_such_table"], "--overwrite");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No table fixture.no_such_table exists");
      expect(fs.readFileSync(file, "utf8")).toBe("previous dump");
      expect(fs.readdirSync(directory)).toStrictEqual(["missing.dump"]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
