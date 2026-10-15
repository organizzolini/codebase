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
  startLexicoDatabase,
} from "../../../testing/lexico-database";
import { postgresProcessEnvironment } from "../postgres-client/postgres-client.utilities";

import type { LexicoDatabase } from "../../../testing/lexico-database";
import type { PostgresUriConnection } from "../postgres-client/postgres-client.types";
import type { PostgresConnection } from "@codebase/database";
import type { StartedPostgresContainer } from "@codebase/database/testing";

// 🎯 The real execFile, wrapped so each test can read the arguments and
// environment every client tool was started with.
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<{ execFile: typeof execFile }>();
  return { ...actual, execFile: vi.fn<typeof execFile>(actual.execFile) };
});

/** The same connection in the shape the client tools are handed it. */
function uriConnection(connection: PostgresConnection): PostgresUriConnection {
  const { database, host, password, port, username } = connection;
  return { database, host, password, port, username };
}

describe("export", () => {
  let source: LexicoDatabase;
  let target: StartedPostgresContainer;
  let targetDataSource: DataSource;
  let directory: string;

  /**
   * Runs `export` with `argv` through the root module `main.ts` chooses
   * for it. Nothing points the CLI at its own Lexico database: export names
   * its database by URI and must never open that one.
   */
  async function runExport(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({ argv: ["export", ...argv] });
  }

  /** Runs `pg_restore` with `args` against the target, credentials in its environment. */
  async function restore(...args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        "pg_restore",
        args,
        { env: postgresProcessEnvironment(uriConnection(target.connection)) },
        (error, stdout, stderr) => {
          if (error === null) resolve(stdout);
          else reject(new Error(`pg_restore failed: ${stderr}`));
        },
      );
    });
  }

  /** The table-of-contents lines of a dump that name a table or its rows. */
  async function contents(file: string): Promise<string[]> {
    const listing = await restore("--list", file);
    return listing
      .split("\n")
      .filter((line) => / TABLE (DATA )?lexico /u.test(line))
      .map((line) =>
        line.replace(/^.*? (TABLE (?:DATA )?lexico \w+).*$/u, "$1"),
      )
      .toSorted();
  }

  /** Restores `file` into the target in one transaction. */
  async function restoreIntoTarget(file: string): Promise<void> {
    await restore(
      "--single-transaction",
      "--exit-on-error",
      "--no-owner",
      `--dbname=${target.connection.database}`,
      file,
    );
  }

  /** The target's rows, as `SELECT … ORDER BY` returns them. */
  async function targetRows(sql: string): Promise<unknown[]> {
    const rows: unknown[] = await targetDataSource.query(sql);
    return rows;
  }

  beforeAll(async () => {
    [source, target] = await Promise.all([
      startLexicoDatabase(),
      startPostgresContainer({ migrations: [], project: "lexico" }),
    ]);
    targetDataSource = new DataSource({
      database: target.connection.database,
      host: target.connection.host,
      password: target.connection.password,
      port: target.connection.port,
      type: "postgres",
      username: target.connection.username,
    });
    await targetDataSource.initialize();

    const [author] = await source.query<{ id: string }>(
      "INSERT INTO authors (name, slug) VALUES ('Vergil', 'vergil'), ('Ovid', 'ovid') RETURNING id",
    );
    await source.query(
      "INSERT INTO texts (slug, title, author_id) VALUES ('aeneid', 'Aeneid', $1)",
      [author?.id],
    );
  }, LEXICO_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "lexico-export-"));
    vi.mocked(execFile).mockClear();
    await targetDataSource.query(
      "DROP SCHEMA lexico CASCADE; CREATE SCHEMA lexico",
    );
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await targetDataSource.destroy();
    await Promise.all([source.close(), target.stop()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "exports one table's schema and data into a dump that restores",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "authors.dump");

      const result = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "authors",
        "--data",
        "--schema",
        "--file",
        file,
      ]);

      expect(result.exitCode).toBe(0);
      await expect(contents(file)).resolves.toStrictEqual([
        "TABLE DATA lexico authors",
        "TABLE lexico authors",
      ]);

      await restoreIntoTarget(file);

      await expect(
        targetRows("SELECT slug FROM lexico.authors ORDER BY slug"),
      ).resolves.toStrictEqual([{ slug: "ovid" }, { slug: "vergil" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "exports several tables, named unqualified and schema-qualified",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "literature.dump");

      const result = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "authors",
        "--table",
        "lexico.texts",
        "--data",
        "--schema",
        "--file",
        file,
      ]);

      expect(result.exitCode).toBe(0);

      await restoreIntoTarget(file);

      await expect(
        targetRows(
          "SELECT authors.slug AS author, texts.slug AS text FROM lexico.texts JOIN lexico.authors ON authors.id = texts.author_id",
        ),
      ).resolves.toStrictEqual([{ author: "vergil", text: "aeneid" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "exports schema only and data only as separate dumps that restore in turn",
    async () => {
      expect.hasAssertions();

      const schemaFile = path.join(directory, "schema.dump");
      const dataFile = path.join(directory, "data.dump");
      const common = ["--source-uri", source.uri, "--table", "authors"];

      const schemaResult = await runExport([
        ...common,
        "--schema",
        "--file",
        schemaFile,
      ]);
      const dataResult = await runExport([
        ...common,
        "--data",
        "--file",
        dataFile,
      ]);

      expect([schemaResult.exitCode, dataResult.exitCode]).toStrictEqual([
        0, 0,
      ]);
      await expect(contents(schemaFile)).resolves.toStrictEqual([
        "TABLE lexico authors",
      ]);
      await expect(contents(dataFile)).resolves.toStrictEqual([
        "TABLE DATA lexico authors",
      ]);

      await restoreIntoTarget(schemaFile);

      await expect(
        targetRows("SELECT count(*)::int AS count FROM lexico.authors"),
      ).resolves.toStrictEqual([{ count: 0 }]);

      await restoreIntoTarget(dataFile);

      await expect(
        targetRows("SELECT slug FROM lexico.authors ORDER BY slug"),
      ).resolves.toStrictEqual([{ slug: "ovid" }, { slug: "vergil" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it("keeps the password out of pg_dump's arguments and masks it in every log line", async () => {
    expect.hasAssertions();

    const { password } = source.connection;

    const result = await runExport([
      "--source-uri",
      source.uri,
      "--table",
      "authors",
      "--data",
      "--file",
      path.join(directory, "authors.dump"),
    ]);

    const [[tool, args, options] = []] = vi.mocked(execFile).mock.calls;

    expect(result.exitCode).toBe(0);
    expect(tool).toBe("pg_dump");
    expect(JSON.stringify(args)).not.toContain(password);
    expect(options).toMatchObject({ env: { PGPASSWORD: password } });
    expect(result.logs.join("\n")).not.toContain(password);
    expect(result.logs.join("\n")).toContain(":****@");
  });

  it(
    "surfaces pg_dump's own error, masked, and exits non-zero",
    async () => {
      expect.hasAssertions();

      const wrongPassword = "not-the-password";
      const uri = new URL(source.uri);
      uri.password = wrongPassword;

      const missingTable = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "no_such_table",
        "--data",
        "--file",
        path.join(directory, "missing.dump"),
      ]);
      const badLogin = await runExport([
        "--source-uri",
        uri.toString(),
        "--table",
        "authors",
        "--data",
        "--file",
        path.join(directory, "login.dump"),
      ]);

      expect(missingTable.exitCode).toBe(1);
      expect(missingTable.stderr).toContain(
        'no matching tables were found for pattern "lexico.no_such_table"',
      );
      expect(badLogin.exitCode).toBe(1);
      expect(badLogin.stderr).toContain("password authentication failed");
      expect(badLogin.stderr).not.toContain(wrongPassword);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it.each([
    [
      "no --source-uri",
      ["--table", "authors", "--data"],
      "--source-uri is required",
    ],
    ["no --table", ["--source-uri", "<uri>", "--data"], "--table is required"],
    [
      "neither --data nor --schema",
      ["--source-uri", "<uri>", "--table", "authors"],
      "--data or --schema is required",
    ],
  ])(
    "fails fast with %s, starting no process and writing no file",
    async (_case, argv, message) => {
      expect.hasAssertions();

      const file = path.join(directory, "never.dump");

      const result = await runExport([
        ...argv.map((value) => (value === "<uri>" ? source.uri : value)),
        "--file",
        file,
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(vi.mocked(execFile)).not.toHaveBeenCalled();
      expect(fs.existsSync(file)).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "never opens the CLI's own database connection, failing or succeeding",
    async () => {
      expect.hasAssertions();

      const initialize = vi.spyOn(DataSource.prototype, "initialize");
      onTestFinished(() => {
        initialize.mockRestore();
      });

      const failed = await runExport(["--table", "authors", "--data"]);
      const succeeded = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "authors",
        "--data",
        "--file",
        path.join(directory, "authors.dump"),
      ]);

      expect(failed.exitCode).toBe(1);
      expect(failed.stderr).toContain("--source-uri is required");
      expect(succeeded.exitCode).toBe(0);
      expect(initialize).not.toHaveBeenCalled();
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it("fails fast with no --file, starting no process", async () => {
    expect.hasAssertions();

    const result = await runExport([
      "--source-uri",
      source.uri,
      "--table",
      "authors",
      "--data",
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--file is required");
    expect(vi.mocked(execFile)).not.toHaveBeenCalled();
  });
});
