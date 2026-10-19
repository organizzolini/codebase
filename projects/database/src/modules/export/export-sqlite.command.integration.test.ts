import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../testing/fixture-database";

import type { FixtureDatabase } from "../../../testing/fixture-database";

// 🎯 The real execFile, wrapped so each test can see whether any client
// tool was started.
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<{ execFile: typeof execFile }>();
  return { ...actual, execFile: vi.fn<typeof execFile>(actual.execFile) };
});

describe("export --sqlite", () => {
  let source: FixtureDatabase;
  let directory: string;
  let file: string;

  /**
   * Runs `export --sqlite` of `tables` into `file`, unqualified names
   * resolving in the `fixture` schema. `PATH` is emptied, so a run that
   * reached for `pg_dump` could not start it.
   */
  async function runExport(
    tables: readonly string[],
    ...extra: string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "export",
        "--sqlite",
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
      env: { PATH: "" },
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-sqlite-"));
    file = path.join(directory, "fixture.sqlite");
    vi.mocked(execFile).mockClear();
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  describe("routing", () => {
    it(
      "writes a SQLite file without starting pg_dump or any client tool",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["widgets"]);

        expect(result.exitCode).toBe(0);
        expect(vi.mocked(execFile)).not.toHaveBeenCalled();

        const database = new DatabaseSync(file, { readOnly: true });

        expect({
          ...database.prepare("SELECT 1 AS opened").get(),
        }).toStrictEqual({
          opened: 1,
        });

        database.close();
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "refuses an existing --file without --overwrite, and leaves it as it was",
      async () => {
        expect.hasAssertions();

        fs.writeFileSync(file, "previous");

        const result = await runExport(["widgets"]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain(
          "already exists and was left unchanged",
        );
        expect(fs.readFileSync(file, "utf8")).toBe("previous");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "replaces an existing --file with --overwrite",
      async () => {
        expect.hasAssertions();

        fs.writeFileSync(file, "previous");

        const result = await runExport(["widgets"], "--overwrite");

        expect(result.exitCode).toBe(0);
        expect(fs.readFileSync(file, "utf8")).not.toBe("previous");
        expect(fs.readdirSync(directory)).toStrictEqual(["fixture.sqlite"]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "names a missing table as the default export does, and writes nothing",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["widgets", "no_such_table"]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain(
          "No table fixture.no_such_table exists in postgresql://",
        );
        expect(result.stderr).toContain("check the --table name");
        expect(result.stderr).not.toContain(new URL(source.uri).password);
        expect(fs.readdirSync(directory)).toStrictEqual([]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "keeps --source-uri and --table meaning: schema-qualified names resolve as written",
      async () => {
        expect.hasAssertions();

        const result = await runCliCommandLine({
          argv: [
            "export",
            "--sqlite",
            "--source-uri",
            source.uri,
            "--table",
            "fixture.widgets",
            "--data",
            "--file",
            file,
          ],
          env: { PATH: "" },
        });

        expect(result.exitCode).toBe(0);
        expect(fs.existsSync(file)).toBe(true);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });
});
