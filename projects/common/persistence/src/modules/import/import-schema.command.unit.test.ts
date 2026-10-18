import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";
import { PostgresClientService } from "../postgres-client/postgres-client.service";

import type { SpawnedProcess } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const TARGET_URI = `postgresql://fixture_username:${PASSWORD}@database.example.com:6543/fixture_development`;

/** `pg_restore --list --verbose` of a dump of `fixture.widgets` and `sample.parts`. */
const LISTING = [
  "; Selected TOC Entries:",
  "3496; 0 0 ENCODING - ENCODING ",
  "221; 1259 16386 TABLE fixture widgets fixture_username",
  "222; 1259 16396 TABLE sample parts fixture_username",
  "3490; 0 16386 TABLE DATA fixture widgets fixture_username",
  ";\tdepends on: 221",
  "3491; 0 16396 TABLE DATA sample parts fixture_username",
  ";\tdepends on: 222",
  "",
].join("\n");

/** The processes that restored, leaving out the version check and listing. */
function restoresOf(spawned: readonly SpawnedProcess[]): SpawnedProcess[] {
  return spawned.filter(
    ({ args }) => args[0] !== "--version" && args[0] !== "--list",
  );
}

describe("import --schema", () => {
  let directory: string;
  let file: string;

  /** Runs `import --data` of `tables` from the dump, plus `extra`. */
  const run = async (
    tables: readonly string[],
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        TARGET_URI,
        ...tables.flatMap((table) => ["--table", table]),
        "--data",
        "--file",
        file,
        ...extra,
      ],
    });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-schema-unit-"));
    file = path.join(directory, "fixture.dump");
    fs.writeFileSync(file, "a dump");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it.each([
    ["an import", []],
    ["a dry run", ["--dry-run"]],
    ["a --clean import", ["--clean"]],
  ])(
    "fails %s fast on an unqualified --table without --schema, starting no process",
    async (_case, extra) => {
      const spawned = mockProcesses({ list: { stdout: LISTING } });

      const result = await run(["widgets", "sample.parts"], ...extra);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "--table widgets names no schema: qualify it as schema.table, or pass --schema <name> to resolve unqualified names in that schema",
      );
      expect(result.stderr).not.toContain(PASSWORD);
      expect(spawned).toStrictEqual([]);
    },
  );

  it("resolves unqualified names in --schema and keeps qualified ones as written", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(
      ["widgets", "sample.parts"],
      "--schema",
      "fixture",
    );

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.useList).toBe(
      "3496;\n221;\n222;\n3490;\n3491;\n",
    );
    expect(result.logs).toContainEqual(
      expect.stringContaining("of fixture.widgets, sample.parts from"),
    );
  });

  it("restores a table named once unqualified and once qualified only once", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(
      ["widgets", "fixture.widgets"],
      "--schema",
      "fixture",
    );

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.useList).toBe("3496;\n221;\n3490;\n");
    expect(result.logs).toContainEqual(
      expect.stringContaining("Imported 1 table (data)"),
    );
  });

  it("truncates the tables --schema resolved before a --clean --data restore", async () => {
    mockProcesses({ list: { stdout: LISTING } });
    const truncate = vi
      .spyOn(PostgresClientService.prototype, "truncate")
      .mockResolvedValue();

    try {
      const result = await run(
        ["widgets", "sample.parts", "widgets"],
        "--schema",
        "fixture",
        "--clean",
      );

      expect(result.exitCode).toBe(0);
      expect(truncate).toHaveBeenCalledWith(
        expect.objectContaining({
          tables: ["fixture.widgets", "sample.parts"],
        }),
      );
    } finally {
      truncate.mockRestore();
    }
  });

  it("names the resolved tables in a dry run", async () => {
    mockProcesses({ list: { stdout: LISTING } });

    const result = await run(["widgets"], "--schema", "fixture", "--dry-run");

    expect(result.exitCode).toBe(0);
    expect(result.logs).toContainEqual(
      expect.stringContaining(
        "Found data and DDL of fixture.widgets in the dump",
      ),
    );
  });

  it("documents --schema and --ddl in its help, and no --namespace", async () => {
    const result = await runCliCommandLine({ argv: ["import", "--help"] });

    expect(result.stdout).toContain("--schema <name>");
    expect(result.stdout).toContain("--ddl");
    expect(result.stdout).not.toContain("--namespace");
  });

  it("rejects the removed --namespace, starting no process", async () => {
    const spawned = mockProcesses();

    const result = await run(["widgets"], "--namespace", "fixture");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("unknown option '--namespace'");
    expect(spawned).toStrictEqual([]);
  });

  it("takes --schema as the schema's name, not as a flag", async () => {
    const spawned = mockProcesses();

    const result = await run(["widgets"], "--schema");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("argument missing");
    expect(spawned).toStrictEqual([]);
  });
});
