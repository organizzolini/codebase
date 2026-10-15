import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const SOURCE_URI = `postgresql://fixture_username:${PASSWORD}@database.example.com:6543/fixture_development`;

/** Where successful exports write, so none lands in the working directory. */
const DIRECTORY = fs.mkdtempSync(path.join(os.tmpdir(), "export-schema-unit-"));

/** How many exports have run, which names each one's file. */
let runs = 0;

/** The `--table=` arguments pg_dump was started with. */
function dumpedTables(
  spawned: ReturnType<typeof mockProcesses>,
): readonly string[] {
  return spawned
    .flatMap(({ args }) => args)
    .filter((argument) => argument.startsWith("--table="));
}

/** Runs `export --data` of `tables`, plus `extra`, into a fresh file. */
async function runExport(
  tables: readonly string[],
  ...extra: readonly string[]
): ReturnType<typeof runCliCommandLine> {
  runs += 1;
  return runCliCommandLine({
    argv: [
      "export",
      "--source-uri",
      SOURCE_URI,
      ...tables.flatMap((table) => ["--table", table]),
      "--data",
      "--file",
      path.join(DIRECTORY, `${String(runs)}.dump`),
      ...extra,
    ],
  });
}

describe("export --schema", () => {
  afterAll(() => {
    fs.rmSync(DIRECTORY, { force: true, recursive: true });
  });

  it("fails fast on an unqualified --table without --schema, starting no process", async () => {
    const spawned = mockProcesses();

    const result = await runExport(["fixture.widgets", "parts"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "--table parts names no schema: qualify it as schema.table, or pass --schema <name> to resolve unqualified names in that schema",
    );
    expect(result.stderr).not.toContain(PASSWORD);
    expect(spawned).toStrictEqual([]);
  });

  it("resolves unqualified names in --schema", async () => {
    const spawned = mockProcesses();

    const result = await runExport(["widgets", "parts"], "--schema", "fixture");

    expect(result.exitCode).toBe(0);
    expect(dumpedTables(spawned)).toStrictEqual([
      "--table=fixture.widgets",
      "--table=fixture.parts",
    ]);
  });

  it("uses schema-qualified names as written, with or without --schema", async () => {
    const spawned = mockProcesses();

    const without = await runExport(["sample.widgets"]);
    const within = await runExport(
      ["sample.widgets", "parts"],
      "--schema",
      "fixture",
    );

    expect([without.exitCode, within.exitCode]).toStrictEqual([0, 0]);
    expect(dumpedTables(spawned)).toStrictEqual([
      "--table=sample.widgets",
      "--table=sample.widgets",
      "--table=fixture.parts",
    ]);
  });

  it("dumps a table given twice once, qualified or resolved in --schema", async () => {
    const spawned = mockProcesses();

    const result = await runExport(
      ["fixture.widgets", "widgets", "parts", "parts"],
      "--schema",
      "fixture",
    );

    expect(result.exitCode).toBe(0);
    expect(dumpedTables(spawned)).toStrictEqual([
      "--table=fixture.widgets",
      "--table=fixture.parts",
    ]);
  });

  it("documents --schema and --ddl in its help, and no --namespace", async () => {
    const result = await runCliCommandLine({ argv: ["export", "--help"] });

    expect(result.stdout).toContain("--schema <name>");
    expect(result.stdout).toContain("--ddl");
    expect(result.stdout).not.toContain("--namespace");
  });

  it("rejects the removed --namespace, starting no process", async () => {
    const spawned = mockProcesses();

    const result = await runExport(["widgets"], "--namespace", "fixture");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("unknown option '--namespace'");
    expect(spawned).toStrictEqual([]);
  });

  it("takes --schema as the schema's name, not as a flag", async () => {
    const spawned = mockProcesses();

    const result = await runExport(["widgets"], "--schema");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("argument missing");
    expect(spawned).toStrictEqual([]);
  });
});
