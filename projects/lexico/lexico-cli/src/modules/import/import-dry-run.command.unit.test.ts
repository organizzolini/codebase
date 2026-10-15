import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  mockProcesses,
  mockStandardInputTerminal,
} from "../../../testing/mocks";
import { environmentSchema } from "../../constants";

import { ImportModule } from "./import.module";

import type { DynamicModule } from "@nestjs/common";

const { promptsMock } = vi.hoisted(() => ({
  promptsMock: vi.fn<(question: { message: string }) => Promise<unknown>>(),
}));

vi.mock("prompts", () => ({ default: promptsMock }));

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";

/** Nothing listens on port 1, so a connection would be refused at once. */
const TARGET_URI = `postgresql://lexico_username:${PASSWORD}@127.0.0.1:1/lexico_development`;

const DEFINITION = "221; 1259 16386 TABLE lexico words lexico_username";
const ROWS = "3490; 0 16386 TABLE DATA lexico words lexico_username";

/** `pg_restore --list --verbose` of a dump holding `entries`. */
const listing = (...entries: readonly string[]): string =>
  [
    "; Selected TOC Entries:",
    "3496; 0 0 ENCODING - ENCODING ",
    ...entries,
    "",
  ].join("\n");

/** Holds whichever configuration `importTestModule` was last built with. */
@Module({})
class ImportDryRunTestModule {}

/** The import command on its own, with no database connection at start-up. */
function importTestModule(): DynamicModule {
  return {
    imports: [
      ConfigModule.forRoot({
        ignoreEnvFile: true,
        isGlobal: true,
        validate: (config: Record<string, unknown>) =>
          environmentSchema.parse(config),
      }),
      LoggerModule,
      ImportModule,
    ],
    module: ImportDryRunTestModule,
  };
}

describe("import --dry-run", () => {
  const setStandardInputTerminal = mockStandardInputTerminal();
  let directory: string;
  let file: string;

  /** A dry run importing `lexico.words`, plus `extra`. */
  const run = async (
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        TARGET_URI,
        "--table",
        "words",
        "--file",
        file,
        "--dry-run",
        ...extra,
      ],
      module: importTestModule(),
    });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-dry-run-unit-"));
    file = path.join(directory, "lexico.dump");
    fs.writeFileSync(file, "a dump");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("prints the plan and runs nothing but the version check and listing", async () => {
    setStandardInputTerminal(true);
    promptsMock.mockReset();
    const initialize = vi.spyOn(DataSource.prototype, "initialize");
    const spawned = mockProcesses({
      list: { stdout: listing(DEFINITION, ROWS) },
    });

    const result = await run("--data");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output).toContain('database "lexico_development" on 127.0.0.1');
    expect(output).toContain(file);
    expect(output).toContain("lexico.words: the dump holds data and schema");
    expect(output).not.toContain("--clean");
    expect(`${output}${result.stderr}`).not.toContain(PASSWORD);
    expect(spawned.map(({ args }) => args[0])).toStrictEqual([
      "--version",
      "--list",
    ]);
    expect(initialize).not.toHaveBeenCalled();
    expect(promptsMock).not.toHaveBeenCalled();
  });

  it.each([
    ["data", [ROWS], "--data"],
    ["schema", [DEFINITION], "--schema"],
  ])("names a dump that holds only %s", async (holds, entries, option) => {
    mockProcesses({ list: { stdout: listing(...entries) } });

    const result = await run(option);

    expect(result.exitCode).toBe(0);
    expect(result.logs.join("\n")).toContain(
      `lexico.words: the dump holds ${holds}`,
    );
  });

  it.each([
    [["--data"], "would truncate lexico.words"],
    [["--schema"], "would drop and recreate lexico.words"],
    [["--data", "--schema"], "would drop and recreate lexico.words"],
  ])(
    "with --clean %j says it %s, without prompting or a terminal",
    async (options, says) => {
      setStandardInputTerminal(false);
      promptsMock.mockReset();
      const spawned = mockProcesses({
        list: { stdout: listing(DEFINITION, ROWS) },
      });

      const result = await run(...options, "--clean");

      const output = result.logs.join("\n");

      expect(result.exitCode).toBe(0);
      expect(output).toContain(`--clean ${says}`);
      expect(promptsMock).not.toHaveBeenCalled();
      expect(spawned.map(({ args }) => args[0])).toStrictEqual([
        "--version",
        "--list",
      ]);
    },
  );

  it("does not truncate with --clean --data --schema", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });

    const result = await run("--data", "--schema", "--clean");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output).toContain("--clean would drop and recreate lexico.words");
    expect(output).not.toContain("truncate");
  });

  it("names a table given twice once, qualified or not", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });

    const result = await run("--table", "lexico.words", "--data", "--clean");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output.match(/lexico\.words: the dump holds/gu)).toHaveLength(1);
    expect(output).toContain("--clean would truncate lexico.words");
    expect(output).not.toContain("lexico.words, lexico.words");
  });

  it("behaves the same with --yes", async () => {
    setStandardInputTerminal(false);
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });
    const without = await run("--data", "--clean");
    mockProcesses({ list: { stdout: listing(DEFINITION, ROWS) } });

    const result = await run("--data", "--clean", "--yes");

    expect(result.exitCode).toBe(0);
    expect(result.logs).toStrictEqual(without.logs);
  });

  it("fails a selection missing from the dump, as a real import does", async () => {
    mockProcesses({ list: { stdout: listing(DEFINITION) } });

    const result = await run("--data");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`${file} holds no rows for lexico.words`);
    expect(result.logs.join("\n")).not.toContain("Dry run");
  });
});
