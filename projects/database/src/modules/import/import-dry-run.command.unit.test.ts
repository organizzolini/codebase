import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";

/** Nothing listens on port 1, so a connection would be refused at once. */
const TARGET_URI = `postgresql://fixture_username:${PASSWORD}@127.0.0.1:1/fixture_development`;

const DEFINITION = "221; 1259 16386 TABLE fixture widgets fixture_username";
const ROWS = "3490; 0 16386 TABLE DATA fixture widgets fixture_username";

/** `pg_restore --list --verbose` of a dump holding `entries`. */
const listing = (...entries: readonly string[]): string =>
  [
    "; Selected TOC Entries:",
    "3496; 0 0 ENCODING - ENCODING ",
    ...entries,
    "",
  ].join("\n");

describe("import --dry-run", () => {
  let directory: string;
  let file: string;

  /** A dry run importing `fixture.widgets`, plus `extra`. */
  const run = async (
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        TARGET_URI,
        "--table",
        "fixture.widgets",
        "--file",
        file,
        "--dry-run",
        ...extra,
      ],
    });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-dry-run-unit-"));
    file = path.join(directory, "fixture.dump");
    fs.writeFileSync(file, "a dump");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("prints the plan and runs nothing but the version check and listing", async () => {
    const initialize = vi.spyOn(DataSource.prototype, "initialize");
    const spawned = mockProcesses({
      list: { stdout: listing(DEFINITION, ROWS) },
    });

    const result = await run("--data");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output).toContain('database "fixture_development" on 127.0.0.1');
    expect(output).toContain(file);
    expect(output).toContain(
      "Found data and DDL of fixture.widgets in the dump",
    );
    expect(output).not.toContain("--clean");
    expect(`${output}${result.stderr}`).not.toContain(PASSWORD);
    expect(spawned.map(({ args }) => args[0])).toStrictEqual([
      "--version",
      "--list",
    ]);
    expect(initialize).not.toHaveBeenCalled();
  });

  it.each([
    ["data", [ROWS], "--data"],
    ["DDL", [DEFINITION], "--ddl"],
  ])("names a dump that holds only %s", async (holds, entries, option) => {
    mockProcesses({ list: { stdout: listing(...entries) } });

    const result = await run(option);

    expect(result.exitCode).toBe(0);
    expect(result.logs.join("\n")).toContain(
      `Found ${holds} of fixture.widgets in the dump`,
    );
  });

  it.each([
    [
      ["--data"],
      "Planning to truncate fixture.widgets for --clean with --data, deleting every row it holds, then restore the dump's rows",
    ],
    [
      ["--ddl"],
      "Planning to drop and recreate fixture.widgets for --clean with --ddl, deleting every row it holds, then restore them from the dump",
    ],
    [
      ["--data", "--ddl"],
      "Planning to drop and recreate fixture.widgets for --clean with --ddl, deleting every row it holds, then restore them from the dump",
    ],
  ])("with --clean %j says %s", async (options, says) => {
    const spawned = mockProcesses({
      list: { stdout: listing(DEFINITION, ROWS) },
    });

    const result = await run(...options, "--clean");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output).toContain(says);
    expect(spawned.map(({ args }) => args[0])).toStrictEqual([
      "--version",
      "--list",
    ]);
  });

  it("does not truncate with --clean --data --ddl", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });

    const result = await run("--data", "--ddl", "--clean");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output).toContain(
      "Planning to drop and recreate fixture.widgets for --clean with --ddl",
    );
    expect(output).not.toContain("truncate");
  });

  it("names a table given twice once, qualified or resolved in --schema", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });

    const result = await run(
      "--schema",
      "fixture",
      "--table",
      "widgets",
      "--data",
      "--clean",
    );

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output.match(/of fixture\.widgets in the dump/gu)).toHaveLength(1);
    expect(output).toContain(
      "Planning to truncate fixture.widgets for --clean with --data",
    );
    expect(output).not.toContain("fixture.widgets, fixture.widgets");
  });

  it("rejects --yes as an unknown option", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });

    const result = await run("--data", "--clean", "--yes");

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--yes");
  });

  it("fails a selection missing from the dump, as a real import does", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION) } });

    const result = await run("--data");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      `${file} holds no rows for fixture.widgets`,
    );
    expect(result.logs.join("\n")).not.toContain("Planning");
  });
});
