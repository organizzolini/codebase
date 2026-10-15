import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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

// 🎯 The real execFile, wrapped so a test can see whether any client tool
// was started at all.
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<{ execFile: typeof execFile }>();
  return { ...actual, execFile: vi.fn<typeof execFile>(actual.execFile) };
});

describe("--namespace across export and import", () => {
  let source: FixtureDatabase;
  let target: FixtureDatabase;
  let directory: string;

  /** Runs the command line with `argv`. */
  async function run(
    ...argv: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({ argv });
  }

  /** Exports `tables`' rows from the source to `file`, plus `extra`. */
  async function runExport(
    file: string,
    tables: readonly string[],
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return run(
      "export",
      "--source-uri",
      source.uri,
      ...tables.flatMap((table) => ["--table", table]),
      "--data",
      "--file",
      file,
      ...extra,
    );
  }

  /** Imports `tables`' rows from `file` into the target, plus `extra`. */
  async function runImport(
    file: string,
    tables: readonly string[],
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return run(
      "import",
      "--target-uri",
      target.uri,
      ...tables.flatMap((table) => ["--table", table]),
      "--data",
      "--file",
      file,
      ...extra,
    );
  }

  /** The target's widget names, sorted. */
  async function targetWidgets(): Promise<unknown[]> {
    return target.query(
      "SELECT display_name FROM widgets ORDER BY display_name",
    );
  }

  beforeAll(async () => {
    [source, target] = await Promise.all([
      startFixtureDatabase(),
      startFixtureDatabase(),
    ]);
    const [widget] = await source.query<{ id: string }>(
      "INSERT INTO widgets (display_name) VALUES ('sprocket'), ('lever') RETURNING id",
    );
    await source.query(
      "INSERT INTO parts (label, widget_id) VALUES ('spring', $1)",
      [widget?.id],
    );
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-namespace-"));
    vi.mocked(execFile).mockClear();
    await target.query("TRUNCATE widgets, parts");
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await Promise.all([source.close(), target.close()]);
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "refuses an unqualified --table without --namespace before any client tool starts",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "widgets.dump");
      fs.writeFileSync(file, "not a dump");

      const exported = await runExport(path.join(directory, "new.dump"), [
        "widgets",
      ]);
      const imported = await runImport(file, ["widgets"]);

      for (const result of [exported, imported]) {
        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain(
          "--table widgets names no schema: qualify it as schema.table, or pass --namespace <schema>",
        );
      }

      expect(vi.mocked(execFile)).not.toHaveBeenCalled();
      expect(fs.existsSync(path.join(directory, "new.dump"))).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "round-trips tables named in --namespace, de-duplicated after resolving",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "widgets.dump");

      const exported = await runExport(
        file,
        ["widgets", "parts"],
        "--namespace",
        "fixture",
      );
      const imported = await runImport(
        file,
        ["widgets", "fixture.widgets", "parts"],
        "--namespace",
        "fixture",
      );

      expect([exported.exitCode, imported.exitCode]).toStrictEqual([0, 0]);
      expect(imported.logs).toContainEqual(
        expect.stringContaining("Imported 2 tables (data)"),
      );
      await expect(targetWidgets()).resolves.toStrictEqual([
        { display_name: "lever" },
        { display_name: "sprocket" },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "uses schema-qualified names as written under another --namespace",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "widgets.dump");

      const exported = await runExport(
        file,
        ["fixture.widgets"],
        "--namespace",
        "sample",
      );
      const imported = await runImport(
        file,
        ["fixture.widgets"],
        "--namespace",
        "sample",
      );

      expect([exported.exitCode, imported.exitCode]).toStrictEqual([0, 0]);
      await expect(targetWidgets()).resolves.toStrictEqual([
        { display_name: "lever" },
        { display_name: "sprocket" },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "empties the tables --namespace resolved before a --clean --data import",
    async () => {
      expect.hasAssertions();

      const file = path.join(directory, "widgets.dump");
      await target.query("INSERT INTO widgets (display_name) VALUES ('gear')");

      const exported = await runExport(
        file,
        ["widgets", "parts"],
        "--namespace",
        "fixture",
      );
      const imported = await runImport(
        file,
        ["widgets", "parts"],
        "--namespace",
        "fixture",
        "--clean",
        "--yes",
      );

      expect([exported.exitCode, imported.exitCode]).toStrictEqual([0, 0]);
      await expect(targetWidgets()).resolves.toStrictEqual([
        { display_name: "lever" },
        { display_name: "sprocket" },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
