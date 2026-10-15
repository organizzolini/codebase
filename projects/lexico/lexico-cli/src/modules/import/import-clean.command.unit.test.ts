import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  mockProcesses,
  mockStandardInputTerminal,
  processFailure,
} from "../../../testing/mocks";
import { environmentSchema } from "../../constants";

import { ImportModule } from "./import.module";

import type { SpawnedProcess } from "../../../testing/mocks";
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
const TARGET_URI = `postgresql://lexico_username:${PASSWORD}@database.example.com:6543/lexico_development`;

/** `pg_restore --list --verbose` of a dump of `lexico.words`. */
const LISTING = [
  "; Selected TOC Entries:",
  "3496; 0 0 ENCODING - ENCODING ",
  "221; 1259 16386 TABLE lexico words lexico_username",
  "3490; 0 16386 TABLE DATA lexico words lexico_username",
  ";\tdepends on: 221",
  "",
].join("\n");

/** Holds whichever configuration `importTestModule` was last built with. */
@Module({})
class ImportCleanTestModule {}

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
    module: ImportCleanTestModule,
  };
}

/** The processes that restored, leaving out the version check and listing. */
function restoresOf(spawned: readonly SpawnedProcess[]): SpawnedProcess[] {
  return spawned.filter(
    ({ args }) => args[0] !== "--version" && args[0] !== "--list",
  );
}

describe("import --clean", () => {
  const setStandardInputTerminal = mockStandardInputTerminal();
  let directory: string;
  let file: string;

  /** A command line that imports `lexico.words`' schema, plus `extra`. */
  const argv = (...extra: readonly string[]): string[] => [
    "import",
    "--target-uri",
    TARGET_URI,
    "--table",
    "words",
    "--schema",
    "--file",
    file,
    ...extra,
  ];

  const run = async (
    commandLine: readonly string[],
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({ argv: commandLine, module: importTestModule() });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-clean-unit-"));
    file = path.join(directory, "lexico.dump");
    fs.writeFileSync(file, "a dump");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("rejects --clean without --schema, before any process starts", async () => {
    const spawned = mockProcesses();

    const result = await run([
      "import",
      "--target-uri",
      TARGET_URI,
      "--table",
      "words",
      "--data",
      "--file",
      file,
      "--clean",
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--clean requires --schema");
    expect(spawned).toStrictEqual([]);
    expect(promptsMock).not.toHaveBeenCalled();
  });

  it("asks on a terminal, naming the host and database but not the password", async () => {
    setStandardInputTerminal(true);
    promptsMock.mockReset().mockResolvedValue({ confirmed: true });
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv("--clean"));

    const [question] = promptsMock.mock.calls[0] ?? [];

    expect(result.exitCode).toBe(0);
    expect(question?.message).toContain("database.example.com");
    expect(question?.message).toContain("lexico_development");
    expect(question?.message).toContain("lexico.words");
    expect(question?.message).not.toContain(PASSWORD);
    expect(restoresOf(spawned)[0]?.args).toStrictEqual(
      expect.arrayContaining(["--clean", "--if-exists", "--schema-only"]),
    );
  });

  it.each([
    ["declines", { confirmed: false }],
    ["aborts with Ctrl-C", {}],
  ])(
    "exits non-zero and restores nothing when the user %s",
    async (_case, answer) => {
      setStandardInputTerminal(true);
      promptsMock.mockReset().mockResolvedValue(answer);
      const spawned = mockProcesses({ list: { stdout: LISTING } });

      const result = await run(argv("--clean"));

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Import cancelled");
      expect(restoresOf(spawned)).toStrictEqual([]);
    },
  );

  it("skips the prompt with --yes, even without a terminal", async () => {
    setStandardInputTerminal(false);
    promptsMock.mockReset();
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv("--clean", "--yes"));

    expect(result.exitCode).toBe(0);
    expect(promptsMock).not.toHaveBeenCalled();
    expect(restoresOf(spawned)[0]?.args).toContain("--clean");
  });

  it("fails without --yes when standard input is not a terminal", async () => {
    setStandardInputTerminal(false);
    promptsMock.mockReset();
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv("--clean"));

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--yes");
    expect(result.stderr).not.toContain(PASSWORD);
    expect(promptsMock).not.toHaveBeenCalled();
    expect(restoresOf(spawned)).toStrictEqual([]);
  });

  it("adds no clean flags without --clean, and never prompts", async () => {
    setStandardInputTerminal(true);
    promptsMock.mockReset();
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv());

    expect(result.exitCode).toBe(0);
    expect(promptsMock).not.toHaveBeenCalled();
    expect(restoresOf(spawned)[0]?.args).not.toContain("--clean");
  });

  it("says a failed clean restore rolled back", async () => {
    mockProcesses({
      error: processFailure(1),
      list: { stdout: LISTING },
      stderr: "pg_restore: error: cannot drop table words\n",
    });

    const result = await run(argv("--clean", "--yes"));

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("was left unchanged");
  });
});
