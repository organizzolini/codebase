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

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  postgresUri,
  startFixtureDatabase,
} from "../../../testing/fixture-database";
import { startPostgresContainer } from "../database/postgres-container.utilities";

import type { FixtureDatabase } from "../../../testing/fixture-database";
import type { StartedPostgresContainer } from "../database/postgres-container.types";

// 🎯 The real execFile, wrapped so a test can read the arguments and
// environment every client tool was started with.
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<{ execFile: typeof execFile }>();
  return { ...actual, execFile: vi.fn<typeof execFile>(actual.execFile) };
});

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_TARGET_URI =
  "postgresql://fixture_username:hunter2-secret@127.0.0.1:1/fixture_testing";

/** The dumps `export` writes once for every test, keyed by what they hold. */
const DUMPS = {
  archive: ["--table", "archive.notes", "--data", "--schema"],
  both: [
    "--table",
    "widgets",
    "--table",
    "fixture.parts",
    "--data",
    "--schema",
  ],
  data: ["--table", "widgets", "--table", "fixture.parts", "--data"],
  schema: ["--table", "widgets", "--table", "fixture.parts", "--schema"],
} as const;

describe("import", () => {
  let source: FixtureDatabase;
  let target: FixtureDatabase;
  let empty: StartedPostgresContainer;
  let emptyDataSource: DataSource;
  let emptyUri: string;
  let directory: string;

  /** Where `export` wrote the dump named `name`. */
  const dump = (name: keyof typeof DUMPS): string =>
    path.join(directory, `${name}.dump`);

  /**
   * Runs `import` with `argv` through the real command line, unqualified
   * `--table` names resolving in the `fixture` schema.
   */
  async function runImport(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: ["import", "--namespace", "fixture", ...argv],
    });
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
      startFixtureDatabase(),
      startFixtureDatabase(),
      startPostgresContainer({ migrations: [], project: "fixture" }),
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

    const [sprocket] = await source.query<{ id: string }>(
      "INSERT INTO widgets (display_name) VALUES ('sprocket'), ('lever') RETURNING id",
    );
    await source.query(
      "INSERT INTO parts (label, widget_id) VALUES ('spring', $1)",
      [sprocket?.id],
    );
    await source.query(
      "CREATE SCHEMA archive; CREATE TABLE archive.notes (id serial PRIMARY KEY, body text NOT NULL UNIQUE); INSERT INTO archive.notes (body) VALUES ('first'), ('second')",
    );

    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-import-"));
    for (const [name, argv] of Object.entries(DUMPS)) {
      const result = await runCliCommandLine({
        argv: [
          "export",
          "--source-uri",
          source.uri,
          "--namespace",
          "fixture",
          ...argv,
          "--file",
          path.join(directory, `${name}.dump`),
        ],
      });
      if (result.exitCode !== 0) throw new Error(result.stderr);
    }
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    vi.mocked(execFile).mockClear();
    await target.query("TRUNCATE widgets, parts CASCADE");
    await emptyDataSource.query(
      "DROP SCHEMA fixture CASCADE; CREATE SCHEMA fixture; DROP SCHEMA IF EXISTS archive CASCADE; CREATE SCHEMA archive",
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
          "widgets",
          "--data",
          "--file",
          dump("data"),
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.logs).toContainEqual(
          expect.stringContaining("Imported 1 table (data)"),
        );
        await expect(
          target.query(
            "SELECT display_name FROM widgets ORDER BY display_name",
          ),
        ).resolves.toStrictEqual([
          { display_name: "lever" },
          { display_name: "sprocket" },
        ]);
        await expect(counts("parts")).resolves.toStrictEqual({ parts: 0 });
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
          "widgets",
          "--table",
          "fixture.parts",
          "--data",
          "--file",
          dump("data"),
        ]);

        expect(result.exitCode).toBe(0);
        await expect(
          target.query(
            "SELECT widgets.display_name AS widget, parts.label AS part FROM parts JOIN widgets ON widgets.id = parts.widget_id",
          ),
        ).resolves.toStrictEqual([{ part: "spring", widget: "sprocket" }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "aborts on a conflicting row, leaving every table as it was",
      async () => {
        expect.hasAssertions();

        // Widgets restore first and would succeed alone; the part conflicts.
        await target.query("INSERT INTO parts (label) VALUES ('spring')");

        const result = await runImport([
          "--target-uri",
          target.uri,
          "--table",
          "widgets",
          "--table",
          "parts",
          "--data",
          "--file",
          dump("data"),
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("duplicate key value");
        expect(result.stderr).toContain("Nothing was imported");
        await expect(counts("widgets", "parts")).resolves.toStrictEqual({
          parts: 1,
          widgets: 0,
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
          "widgets",
          "--table",
          "fixture.parts",
          "--schema",
          "--file",
          dump("schema"),
        ]);

        expect(result.exitCode).toBe(0);
        await expect(
          emptyRows(
            "SELECT (SELECT count(*)::int FROM fixture.widgets) AS widgets, (SELECT count(*)::int FROM fixture.parts) AS parts",
          ),
        ).resolves.toStrictEqual([{ parts: 0, widgets: 0 }]);
        await expect(
          emptyRows(
            "SELECT contype AS type, count(*)::int AS count FROM pg_constraint WHERE conrelid IN ('fixture.widgets'::regclass, 'fixture.parts'::regclass) AND contype IN ('f', 'p', 'u') GROUP BY contype ORDER BY contype",
          ),
        ).resolves.toStrictEqual([
          { count: 1, type: "f" },
          { count: 2, type: "p" },
          { count: 1, type: "u" },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "aborts over a table that already exists, leaving it as it was",
      async () => {
        expect.hasAssertions();

        await target.query(
          "INSERT INTO widgets (display_name) VALUES ('gear')",
        );

        const result = await runImport([
          "--target-uri",
          target.uri,
          "--table",
          "widgets",
          "--schema",
          "--file",
          dump("schema"),
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("already exists");
        expect(result.stderr).toContain("Nothing was imported");
        await expect(
          target.query("SELECT display_name FROM widgets"),
        ).resolves.toStrictEqual([{ display_name: "gear" }]);
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
          "INSERT INTO archive.notes (body) VALUES ('third')",
        );

        expect(result.exitCode).toBe(0);
        await expect(
          emptyRows("SELECT id, body FROM archive.notes ORDER BY id"),
        ).resolves.toStrictEqual([
          { body: "first", id: 1 },
          { body: "second", id: 2 },
          { body: "third", id: 3 },
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
          "widgets",
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
            "SELECT to_regclass('fixture.parts') AS parts, (SELECT count(*)::int FROM fixture.widgets) AS widgets",
          ),
        ).resolves.toStrictEqual([{ parts: null, widgets: 2 }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("fails fast, before connecting, when the dump lacks what was asked for", () => {
    it.each([
      ["rows", "--data", "schema", "holds no rows for fixture.widgets"],
      [
        "definitions",
        "--schema",
        "data",
        "holds no table definitions for fixture.widgets",
      ],
    ] as const)(
      "naming the tables without %s",
      async (_case, content, name, message) => {
        expect.hasAssertions();

        const result = await runImport([
          "--target-uri",
          UNREACHABLE_TARGET_URI,
          "--table",
          "widgets",
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
        "widgets",
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
        "widgets",
        "--data",
        "--file",
        dump("data"),
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("password authentication failed");
      expect(result.stderr).not.toContain(wrongPassword);
      await expect(counts("widgets")).resolves.toStrictEqual({ widgets: 0 });
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

      const failed = await runImport(["--table", "widgets", "--data"]);
      const succeeded = await runImport([
        "--target-uri",
        target.uri,
        "--table",
        "widgets",
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
