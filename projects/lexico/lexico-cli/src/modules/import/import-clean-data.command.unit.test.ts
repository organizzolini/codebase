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
import { PostgresReferencedTablesError } from "../postgres-client/postgres-client.constants";
import { PostgresClientService } from "../postgres-client/postgres-client.service";

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

/** Nothing listens on port 1, so a connection is refused at once. */
const UNREACHABLE_URI = `postgresql://lexico_username:${PASSWORD}@127.0.0.1:1/lexico_development`;

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
class ImportCleanDataTestModule {}

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
    module: ImportCleanDataTestModule,
  };
}

/** The processes that restored, leaving out the version check and listing. */
function restoresOf(spawned: readonly SpawnedProcess[]): SpawnedProcess[] {
  return spawned.filter(
    ({ args }) => args[0] !== "--version" && args[0] !== "--list",
  );
}

describe("import --clean --data", () => {
  const setStandardInputTerminal = mockStandardInputTerminal();
  let directory: string;
  let file: string;

  /** `import --clean --data` of `lexico.words`, plus `extra`. */
  const run = async (
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        UNREACHABLE_URI,
        "--table",
        "words",
        "--data",
        "--clean",
        "--file",
        file,
        ...extra,
      ],
      module: importTestModule(),
    });

  /** Makes the truncate succeed, or fail with `error`, without a database. */
  const stubTruncate = (error?: Error): void => {
    const truncate = vi.spyOn(PostgresClientService.prototype, "truncate");
    if (error === undefined) truncate.mockResolvedValue();
    else truncate.mockRejectedValue(error);
  };

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-clean-data-"));
    file = path.join(directory, "lexico.dump");
    fs.writeFileSync(file, "a dump");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("asks before deleting the rows, naming the host and database", async () => {
    setStandardInputTerminal(true);
    promptsMock.mockReset().mockResolvedValue({ confirmed: true });
    stubTruncate();
    mockProcesses({ list: { stdout: LISTING } });

    const result = await run();

    const [question] = promptsMock.mock.calls[0] ?? [];

    expect(result.exitCode).toBe(0);
    expect(question?.message).toContain("every row");
    expect(question?.message).toContain("127.0.0.1");
    expect(question?.message).toContain("lexico_development");
    expect(question?.message).not.toContain(PASSWORD);
  });

  it("restores the rows without pg_restore's own --clean", async () => {
    stubTruncate();
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run("--yes");

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.args).toContain("--data-only");
    expect(restoresOf(spawned)[0]?.args).not.toContain("--clean");
  });

  it("refuses, listing the tables to add, when an unselected table references a selected one", async () => {
    stubTruncate(
      new PostgresReferencedTablesError(["lexico.lexemes", "archive.refs"]),
    );
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run("--yes");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "--table lexico.lexemes --table archive.refs",
    );
    expect(result.stderr).toContain("Nothing was truncated");
    expect(restoresOf(spawned)).toStrictEqual([]);
  });

  it("says the tables may be empty, and to re-run, when the restore fails after the truncate", async () => {
    stubTruncate();
    mockProcesses({
      error: processFailure(1),
      list: { stdout: LISTING },
      stderr: `pg_restore: error: could not connect to postgresql://lexico_username:${PASSWORD}@127.0.0.1:1\n`,
    });

    const result = await run("--yes");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("lexico.words");
    expect(result.stderr).toContain("may now be empty");
    expect(result.stderr).toContain("same file");
    expect(result.stderr).not.toContain("was left unchanged");
    expect(result.stderr).not.toContain(PASSWORD);
  });

  it("says nothing was truncated, without the password, when the target cannot be reached", async () => {
    vi.restoreAllMocks();
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run("--yes");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Nothing was truncated");
    expect(result.stderr).not.toContain(PASSWORD);
    expect(restoresOf(spawned)).toStrictEqual([]);
  });

  it("drops through pg_restore rather than connecting itself when --schema is given too", async () => {
    vi.restoreAllMocks();
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run("--schema", "--yes");

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.args).toContain("--clean");
  });
});
