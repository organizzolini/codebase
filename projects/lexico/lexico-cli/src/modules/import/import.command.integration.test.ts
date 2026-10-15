import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";

import { startPostgresContainer } from "@codebase/database/testing";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  LEXICO_DATABASE_TIMEOUT_MILLISECONDS,
  postgresUri,
  startLexicoDatabase,
} from "../../../testing/lexico-database";

import type { LexicoDatabase } from "../../../testing/lexico-database";
import type { StartedPostgresContainer } from "@codebase/database/testing";

// 🎯 The real execFile, wrapped so a test can read the arguments and
// environment every client tool was started with.
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<{ execFile: typeof execFile }>();
  return { ...actual, execFile: vi.fn<typeof execFile>(actual.execFile) };
});

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_TARGET_URI =
  "postgresql://lexico_username:hunter2-secret@127.0.0.1:1/lexico_testing";

/** The dumps `export` writes once for every test, keyed by what they hold. */
const DUMPS = {
  archive: ["--table", "archive.notes", "--data", "--schema"],
  both: ["--table", "authors", "--table", "lexico.texts", "--data", "--schema"],
  data: ["--table", "authors", "--table", "lexico.texts", "--data"],
  schema: ["--table", "authors", "--table", "lexico.texts", "--schema"],
} as const;

describe("import", () => {
  let source: LexicoDatabase;
  let target: LexicoDatabase;
  let empty: StartedPostgresContainer;
  let emptyDataSource: DataSource;
  let emptyUri: string;
  let directory: string;

  /** Where `export` wrote the dump named `name`. */
  const dump = (name: keyof typeof DUMPS): string =>
    path.join(directory, `${name}.dump`);

  /** Runs `import` with `argv` through the root module `main.ts` chooses. */
  async function runImport(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({ argv: ["import", ...argv] });
  }

  /** Rows of `sql` run against the target built without migrations. */
  async function emptyRows(sql: string): Promise<unknown[]> {
    const rows: unknown[] = await emptyDataSource.query(sql);
    return rows;
  }

  /** How many rows each of `tables` holds in the migrated target. */
  async function counts(
    ...tables: readonly string[]
  ): Promise<Record<string, number>> {
    const entries = await Promise.all(
      tables.map(async (table) => {
        const [row] = await target.query<{ count: number }>(
          `SELECT count(*)::int AS count FROM ${table}`,
        );
        return [table, row?.count ?? -1] as const;
      }),
    );
    return Object.fromEntries(entries);
  }

  beforeAll(async () => {
    [source, target, empty] = await Promise.all([
      startLexicoDatabase(),
      startLexicoDatabase(),
      startPostgresContainer({ migrations: [], project: "lexico" }),
    ]);
    emptyUri = postgresUri(empty.connection);
    emptyDataSource = new DataSource({
      database: empty.connection.database,
      host: empty.connection.host,
      password: empty.connection.password,
      port: empty.connection.port,
      type: "postgres",
      username: empty.connection.username,
    });
    await emptyDataSource.initialize();

    const [vergil] = await source.query<{ id: string }>(
      "INSERT INTO authors (name, slug) VALUES ('Vergil', 'vergil'), ('Ovid', 'ovid') RETURNING id",
    );
    await source.query(
      "INSERT INTO texts (slug, title, author_id) VALUES ('aeneid', 'Aeneid', $1)",
      [vergil?.id],
    );
    await source.query(
      "CREATE SCHEMA archive; CREATE TABLE archive.notes (id serial PRIMARY KEY, body text NOT NULL UNIQUE); INSERT INTO archive.notes (body) VALUES ('arma'), ('virumque')",
    );

    directory = fs.mkdtempSync(path.join(os.tmpdir(), "lexico-import-"));
    for (const [name, argv] of Object.entries(DUMPS)) {
      const result = await runCliCommandLine({
        argv: [
          "export",
          "--source-uri",
          source.uri,
          ...argv,
          "--file",
          path.join(directory, `${name}.dump`),
        ],
      });
      if (result.exitCode !== 0) throw new Error(result.stderr);
    }
  }, LEXICO_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    vi.mocked(execFile).mockClear();
    await target.query("TRUNCATE authors, texts CASCADE");
    await emptyDataSource.query(
      "DROP SCHEMA lexico CASCADE; CREATE SCHEMA lexico; DROP SCHEMA IF EXISTS archive CASCADE; CREATE SCHEMA archive",
    );
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    fs.rmSync(directory, { force: true, recursive: true });
    await emptyDataSource.destroy();
    await Promise.all([source.close(), target.close(), empty.stop()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  describe("--data, into existing tables", () => {
    it(
      "imports one table's rows, and only that table's, from a dump of several",
      async () => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          target.uri,
          "--table",
          "authors",
          "--data",
          "--file",
          dump("data"),
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.logs).toContainEqual(
          expect.stringContaining("Imported 1 table (data)"),
        );
        await expect(
          target.query("SELECT slug FROM authors ORDER BY slug"),
        ).resolves.toStrictEqual([{ slug: "ovid" }, { slug: "vergil" }]);
        await expect(counts("texts")).resolves.toStrictEqual({ texts: 0 });
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "imports several tables' rows, named unqualified and schema-qualified",
      async () => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          target.uri,
          "--table",
          "authors",
          "--table",
          "lexico.texts",
          "--data",
          "--file",
          dump("data"),
        ]);

        expect(result.exitCode).toBe(0);
        await expect(
          target.query(
            "SELECT authors.slug AS author, texts.slug AS text FROM texts JOIN authors ON authors.id = texts.author_id",
          ),
        ).resolves.toStrictEqual([{ author: "vergil", text: "aeneid" }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "aborts on a conflicting row, leaving every table as it was",
      async () => {
        expect.hasAssertions();

        // Authors restore first and would succeed alone; the text conflicts.
        await target.query(
          "INSERT INTO texts (slug, title) VALUES ('aeneid', 'Already here')",
        );

        const result = await runImport([
          "--target-uri",
          target.uri,
          "--table",
          "authors",
          "--table",
          "texts",
          "--data",
          "--file",
          dump("data"),
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("duplicate key value");
        expect(result.stderr).toContain("Nothing was imported");
        await expect(counts("authors", "texts")).resolves.toStrictEqual({
          authors: 0,
          texts: 1,
        });
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("--schema, into a database without the tables", () => {
    it(
      "imports the definitions with their keys, indexes, and foreign keys, but no rows",
      async () => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          emptyUri,
          "--table",
          "authors",
          "--table",
          "lexico.texts",
          "--schema",
          "--file",
          dump("schema"),
        ]);

        expect(result.exitCode).toBe(0);
        await expect(
          emptyRows(
            "SELECT (SELECT count(*)::int FROM lexico.authors) AS authors, (SELECT count(*)::int FROM lexico.texts) AS texts",
          ),
        ).resolves.toStrictEqual([{ authors: 0, texts: 0 }]);
        await expect(
          emptyRows(
            "SELECT contype AS type, count(*)::int AS count FROM pg_constraint WHERE conrelid IN ('lexico.authors'::regclass, 'lexico.texts'::regclass) AND contype IN ('f', 'p', 'u') GROUP BY contype ORDER BY contype",
          ),
        ).resolves.toStrictEqual([
          { count: 2, type: "f" },
          { count: 2, type: "p" },
          { count: 2, type: "u" },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "aborts over a table that already exists, leaving it as it was",
      async () => {
        expect.hasAssertions();

        await target.query(
          "INSERT INTO authors (name, slug) VALUES ('Horace', 'horace')",
        );

        const result = await runImport([
          "--target-uri",
          target.uri,
          "--table",
          "authors",
          "--schema",
          "--file",
          dump("schema"),
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("already exists");
        expect(result.stderr).toContain("Nothing was imported");
        await expect(
          target.query("SELECT slug FROM authors"),
        ).resolves.toStrictEqual([{ slug: "horace" }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("--data --schema together", () => {
    it(
      "imports a table from a non-default schema, its sequence set past its rows",
      async () => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          emptyUri,
          "--table",
          "archive.notes",
          "--data",
          "--schema",
          "--file",
          dump("archive"),
        ]);
        await emptyDataSource.query(
          "INSERT INTO archive.notes (body) VALUES ('cano')",
        );

        expect(result.exitCode).toBe(0);
        await expect(
          emptyRows("SELECT id, body FROM archive.notes ORDER BY id"),
        ).resolves.toStrictEqual([
          { body: "arma", id: 1 },
          { body: "virumque", id: 2 },
          { body: "cano", id: 3 },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "imports only the selected table, leaving the dump's others out",
      async () => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          emptyUri,
          "--table",
          "authors",
          "--data",
          "--schema",
          "--file",
          dump("both"),
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.logs).toContainEqual(
          expect.stringContaining("Imported 1 table (data and schema)"),
        );
        await expect(
          emptyRows(
            "SELECT to_regclass('lexico.texts') AS texts, (SELECT count(*)::int FROM lexico.authors) AS authors",
          ),
        ).resolves.toStrictEqual([{ authors: 2, texts: null }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("fails fast, before connecting, when the dump lacks what was asked for", () => {
    it.each([
      ["rows", "--data", "schema", "holds no rows for lexico.authors"],
      [
        "definitions",
        "--schema",
        "data",
        "holds no table definitions for lexico.authors",
      ],
    ] as const)(
      "naming the tables without %s",
      async (_case, content, name, message) => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          UNREACHABLE_TARGET_URI,
          "--table",
          "authors",
          content,
          "--file",
          dump(name),
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain(`${dump(name)} ${message}`);
        expect(result.stderr).not.toContain("connect");
        expect(
          vi
            .mocked(execFile)
            .mock.calls.map(([, args]) => args?.[0])
            .filter((argument) => argument !== "--version"),
        ).toStrictEqual(["--list"]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  it(
    "keeps the password out of pg_restore's arguments and masks it in every log line",
    async () => {
      expect.hasAssertions();

      const { password } = target.connection;

      const result = await runImport([
        "--target-uri",
        target.uri,
        "--table",
        "authors",
        "--data",
        "--file",
        dump("data"),
      ]);

      const [tool, args, options] =
        vi
          .mocked(execFile)
          .mock.calls.find(([, toolArguments]) =>
            toolArguments?.includes("--single-transaction"),
          ) ?? [];

      expect(result.exitCode).toBe(0);
      expect(tool).toBe("pg_restore");
      expect(JSON.stringify(args)).not.toContain(password);
      expect(options).toMatchObject({ env: { PGPASSWORD: password } });
      expect(result.logs.join("\n")).not.toContain(password);
      expect(result.logs.join("\n")).toContain(":****@");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "surfaces pg_restore's own error, masked, and exits non-zero",
    async () => {
      expect.hasAssertions();

      const wrongPassword = "not-the-password";
      const uri = new URL(target.uri);
      uri.password = wrongPassword;

      const result = await runImport([
        "--target-uri",
        uri.toString(),
        "--table",
        "authors",
        "--data",
        "--file",
        dump("data"),
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("password authentication failed");
      expect(result.stderr).not.toContain(wrongPassword);
      await expect(counts("authors")).resolves.toStrictEqual({ authors: 0 });
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "never opens the CLI's own database connection",
    async () => {
      expect.hasAssertions();

      const initialize = vi.spyOn(DataSource.prototype, "initialize");
      onTestFinished(() => {
        initialize.mockRestore();
      });

      const failed = await runImport(["--table", "authors", "--data"]);
      const succeeded = await runImport([
        "--target-uri",
        target.uri,
        "--table",
        "authors",
        "--data",
        "--file",
        dump("data"),
      ]);

      expect(failed.exitCode).toBe(1);
      expect(failed.stderr).toContain("--target-uri is required");
      expect(succeeded.exitCode).toBe(0);
      expect(initialize).not.toHaveBeenCalled();
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
