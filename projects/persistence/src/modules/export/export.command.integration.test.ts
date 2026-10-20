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
  startFixtureDatabase,
} from "../../../testing/fixture-persistence";
import { postgresProcessEnvironment } from "../postgresql-utilities/postgresql-utilities.utilities";
import { startPostgresContainer } from "../postgresql/postgresql-container.utilities";

import type { FixtureDatabase } from "../../../testing/fixture-persistence";
import type { PostgresUriConnection } from "../postgresql-utilities/postgresql-utilities.types";
import type { StartedPostgresContainer } from "../postgresql/postgresql-container.types";
import type { PostgresConnection } from "../postgresql/postgresql.types";

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
  let source: FixtureDatabase;
  let target: StartedPostgresContainer;
  let targetDataSource: DataSource;
  let directory: string;

  /**
   * Runs `export` with `argv` through the real command line, unqualified
   * `--table` names resolving in the `fixture` schema. Nothing points the
   * command line at a database of its own: export names its database by
   * URI and must never open any other.
   */
  async function runExport(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: ["export", "--schema", "fixture", ...argv],
    });
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
      .filter((line) => / TABLE (DATA )?fixture /u.test(line))
      .map((line) =>
        line.replace(/^.*? (TABLE (?:DATA )?fixture \w+).*$/u, "$1"),
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
      startFixtureDatabase(),
      startPostgresContainer({ migrations: [], project: "fixture" }),
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

    const [widget] = await source.query<{ id: string }>(
      "INSERT INTO widgets (display_name) VALUES ('sprocket'), ('lever') RETURNING id",
    );
    await source.query(
      "INSERT INTO parts (label, widget_id) VALUES ('spring', $1)",
      [widget?.id],
    );
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-export-"));
    vi.mocked(execFile).mockClear();
    await targetDataSource.query(
      "DROP SCHEMA fixture CASCADE; CREATE SCHEMA fixture",
    );
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await targetDataSource.destroy();
    await Promise.all([source.close(), target.stop()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "exports one table's DDL and data into a dump that restores",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "widgets.dump");

      const result = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "widgets",
        "--data",
        "--ddl",
        "--file",
        file,
      ]);

      expect(result.exitCode).toBe(0);
      await expect(contents(file)).resolves.toStrictEqual([
        "TABLE DATA fixture widgets",
        "TABLE fixture widgets",
      ]);

      await restoreIntoTarget(file);

      await expect(
        targetRows(
          "SELECT display_name FROM fixture.widgets ORDER BY display_name",
        ),
      ).resolves.toStrictEqual([
        { display_name: "lever" },
        { display_name: "sprocket" },
      ]);
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
        "widgets",
        "--table",
        "fixture.parts",
        "--data",
        "--ddl",
        "--file",
        file,
      ]);

      expect(result.exitCode).toBe(0);

      await restoreIntoTarget(file);

      await expect(
        targetRows(
          "SELECT widgets.display_name AS widget, parts.label AS part FROM fixture.parts JOIN fixture.widgets ON widgets.id = parts.widget_id",
        ),
      ).resolves.toStrictEqual([{ part: "spring", widget: "sprocket" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "exports DDL only and data only as separate dumps that restore in turn",
    async () => {
      expect.hasAssertions();

      const ddlFile = path.join(directory, "ddl.dump");
      const dataFile = path.join(directory, "data.dump");
      const common = ["--source-uri", source.uri, "--table", "widgets"];

      const ddlResult = await runExport([
        ...common,
        "--ddl",
        "--file",
        ddlFile,
      ]);
      const dataResult = await runExport([
        ...common,
        "--data",
        "--file",
        dataFile,
      ]);

      expect([ddlResult.exitCode, dataResult.exitCode]).toStrictEqual([0, 0]);
      await expect(contents(ddlFile)).resolves.toStrictEqual([
        "TABLE fixture widgets",
      ]);
      await expect(contents(dataFile)).resolves.toStrictEqual([
        "TABLE DATA fixture widgets",
      ]);

      await restoreIntoTarget(ddlFile);

      await expect(
        targetRows("SELECT count(*)::int AS count FROM fixture.widgets"),
      ).resolves.toStrictEqual([{ count: 0 }]);

      await restoreIntoTarget(dataFile);

      await expect(
        targetRows(
          "SELECT display_name FROM fixture.widgets ORDER BY display_name",
        ),
      ).resolves.toStrictEqual([
        { display_name: "lever" },
        { display_name: "sprocket" },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "keeps the password out of pg_dump's arguments and masks it in every log line",
    async () => {
      expect.hasAssertions();

      const { password } = source.connection;

      const result = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "widgets",
        "--data",
        "--file",
        path.join(directory, "widgets.dump"),
      ]);

      const [tool, args, options] =
        vi
          .mocked(execFile)
          .mock.calls.find(
            ([, toolArguments]) => toolArguments?.[0] !== "--version",
          ) ?? [];

      expect(result.exitCode).toBe(0);
      expect(tool).toBe("pg_dump");
      expect(JSON.stringify(args)).not.toContain(password);
      expect(options).toMatchObject({ env: { PGPASSWORD: password } });
      expect(result.logs.join("\n")).not.toContain(password);
      expect(result.logs.join("\n")).toContain(":****@");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "names a missing table, and surfaces pg_dump's other errors masked, exiting non-zero",
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
        "widgets",
        "--data",
        "--file",
        path.join(directory, "login.dump"),
      ]);

      expect(missingTable.exitCode).toBe(1);
      expect(missingTable.stderr).toContain(
        "No table fixture.no_such_table exists in",
      );
      expect(badLogin.exitCode).toBe(1);
      expect(badLogin.stderr).toContain("password authentication failed");
      expect(badLogin.stderr).not.toContain(wrongPassword);
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

      const failed = await runExport(["--table", "widgets", "--data"]);
      const succeeded = await runExport([
        "--source-uri",
        source.uri,
        "--table",
        "widgets",
        "--data",
        "--file",
        path.join(directory, "widgets.dump"),
      ]);

      expect(failed.exitCode).toBe(1);
      expect(failed.stderr).toContain("--source-uri is required");
      expect(succeeded.exitCode).toBe(0);
      expect(initialize).not.toHaveBeenCalled();
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  describe("with a --file that already exists", () => {
    const common = (): string[] => [
      "--source-uri",
      source.uri,
      "--table",
      "widgets",
      "--data",
      "--ddl",
    ];

    it(
      "refuses, leaving the file byte-for-byte unchanged and starting no process",
      async () => {
        expect.hasAssertions();

        const file = path.join(directory, "widgets.dump");
        const original = Buffer.from([0, 1, 2, 3, 255]);
        fs.writeFileSync(file, original);

        const result = await runExport([...common(), "--file", file]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain(file);
        expect(result.stderr).toContain("--overwrite");
        expect(vi.mocked(execFile)).not.toHaveBeenCalled();
        expect(fs.readFileSync(file).equals(original)).toBe(true);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "replaces it with a fresh dump under --overwrite",
      async () => {
        expect.hasAssertions();

        const file = path.join(directory, "widgets.dump");
        await runExport([...common(), "--file", file]);
        const before = await contents(file);
        await source.query(
          "INSERT INTO widgets (display_name) VALUES ('gear')",
        );
        onTestFinished(async () => {
          await source.query("DELETE FROM widgets WHERE display_name = 'gear'");
        });

        const refused = await runExport([...common(), "--file", file]);
        const replaced = await runExport([
          ...common(),
          "--overwrite",
          "--file",
          file,
        ]);
        await restoreIntoTarget(file);

        expect(before).toStrictEqual([
          "TABLE DATA fixture widgets",
          "TABLE fixture widgets",
        ]);
        expect(refused.exitCode).toBe(1);
        expect(replaced.exitCode).toBe(0);
        await expect(
          targetRows(
            "SELECT display_name FROM fixture.widgets ORDER BY display_name",
          ),
        ).resolves.toStrictEqual([
          { display_name: "gear" },
          { display_name: "lever" },
          { display_name: "sprocket" },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "does not leave a file behind when a new dump fails, so the re-run is not refused",
      async () => {
        expect.hasAssertions();

        const file = path.join(directory, "missing.dump");
        const argv = [
          "--source-uri",
          source.uri,
          "--table",
          "no_such_table",
          "--data",
          "--file",
          file,
        ];

        const failed = await runExport(argv);
        const rerun = await runExport(argv);

        expect(failed.exitCode).toBe(1);
        expect(rerun.stderr).not.toContain("--overwrite");
        expect(fs.existsSync(file)).toBe(false);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });
});
