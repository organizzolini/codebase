import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerModule, LoggerService } from "@codebase/logging";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses, processFailure } from "../../../testing/mocks";
import { environmentSchema } from "../../constants";
import { PostgresClientService } from "../postgres-client/postgres-client.service";

import { ImportCommand } from "./import.command";
import { ImportModule } from "./import.module";

import type { SpawnedProcess } from "../../../testing/mocks";
import type { DynamicModule } from "@nestjs/common";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const TARGET_URI = `postgresql://lexico_username:${PASSWORD}@database.example.com:6543/lexico_development`;
const MASKED_TARGET_URI =
  "postgresql://lexico_username:****@database.example.com:6543/lexico_development";

/** `pg_restore --list --verbose` of a dump of `lexico.words` and `archive.lexemes`. */
const LISTING = [
  "; Selected TOC Entries:",
  "3496; 0 0 ENCODING - ENCODING ",
  "221; 1259 16386 TABLE lexico words lexico_username",
  "222; 1259 16396 TABLE archive lexemes lexico_username",
  "3490; 0 16386 TABLE DATA lexico words lexico_username",
  ";\tdepends on: 221",
  "3334; 2606 16393 CONSTRAINT lexico words words_pkey lexico_username",
  ";\tdepends on: 221",
  "",
].join("\n");

/** Holds whichever configuration `importTestModule` was last built with. */
@Module({})
class ImportTestModule {}

/**
 * The import command on its own: the real runner and option parsing, with
 * no database connection opened at start-up. Built per run because
 * `ConfigModule` validates the environment as it is built.
 */
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
    module: ImportTestModule,
  };
}

/** The processes that restored, leaving out the version check and listing. */
function restoresOf(spawned: readonly SpawnedProcess[]): SpawnedProcess[] {
  return spawned.filter(
    ({ args }) => args[0] !== "--version" && args[0] !== "--list",
  );
}

/** Runs `import` with `argv` and `env` through the real nest-commander runner. */
async function runImport(
  argv: readonly string[],
  env: Readonly<Record<string, string>> = {},
): ReturnType<typeof runCliCommandLine> {
  vi.stubEnv("LEXICO_POSTGRES_SCHEMA", undefined);
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);

  try {
    return await runCliCommandLine({
      argv: ["import", ...argv],
      module: importTestModule(),
    });
  } finally {
    vi.unstubAllEnvs();
  }
}

describe(ImportCommand, () => {
  let command: ImportCommand;
  let directory: string;
  let file: string;

  /** A command line that imports `tables` with `content` from the dump file. */
  const argv = (
    content: readonly string[] = ["--data"],
    tables: readonly string[] = ["words"],
  ): string[] => [
    "--target-uri",
    TARGET_URI,
    ...tables.flatMap((table) => ["--table", table]),
    ...content,
    "--file",
    file,
  ];

  beforeAll(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-unit-"));
    file = path.join(directory, "lexico.dump");
    fs.writeFileSync(file, "a dump");

    const module = await Test.createTestingModule({
      providers: [
        ImportCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: PostgresClientService,
          useValue: createMock<PostgresClientService>(),
        },
      ],
    }).compile();

    command = await module.resolve(ImportCommand);
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        ImportCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: PostgresClientService,
          useValue: createMock<PostgresClientService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("ImportCommand");
  });

  describe("fails fast, before any process starts", () => {
    it.each([
      [
        "no --target-uri",
        ["--table", "words", "--data", "--file", "lexico.dump"],
        "--target-uri is required",
      ],
      [
        "an unusable --target-uri",
        [
          "--target-uri",
          `mysql://root:${PASSWORD}@localhost/lexico`,
          "--table",
          "words",
          "--data",
          "--file",
          "lexico.dump",
        ],
        "--target-uri must start with postgresql://",
      ],
      [
        "no --table",
        ["--target-uri", TARGET_URI, "--data", "--file", "lexico.dump"],
        "--table is required",
      ],
      [
        "neither --data nor --schema",
        ["--target-uri", TARGET_URI, "--table", "words", "--file", "x.dump"],
        "--data or --schema is required",
      ],
      [
        "no --file",
        ["--target-uri", TARGET_URI, "--table", "words", "--schema"],
        "--file is required",
      ],
      [
        "a --file that does not exist",
        [
          "--target-uri",
          TARGET_URI,
          "--table",
          "words",
          "--schema",
          "--file",
          "/nonexistent/lexico.dump",
        ],
        "/nonexistent/lexico.dump does not exist",
      ],
    ])("with %s", async (_case, commandLine, message) => {
      const spawned = mockProcesses();

      const result = await runImport(commandLine);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(result.stderr).not.toContain(PASSWORD);
      expect(spawned).toStrictEqual([]);
    });
  });

  it("checks pg_restore's version, lists the dump, then restores the selected tables", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await runImport(argv(["--data"], ["words"]));

    expect(result.exitCode).toBe(0);
    expect(spawned.map(({ args }) => args.slice(0, 2))).toStrictEqual([
      ["--version"],
      ["--list", "--verbose"],
      ["--dbname=lexico_development", "--no-password"],
    ]);
    expect(restoresOf(spawned)).toStrictEqual([
      expect.objectContaining({
        args: expect.arrayContaining([
          "--single-transaction",
          "--data-only",
          file,
        ]) as unknown,
        file: "pg_restore",
        useList: "3496;\n221;\n3490;\n3334;\n",
      }),
    ]);
  });

  it.each([
    [["--schema"], "--schema-only"],
    [["--data", "--schema"], undefined],
  ])("maps %o to the pg_restore content flag %s", async (content, flag) => {
    const spawned = mockProcesses({
      list: {
        stdout: `${LISTING}3491; 0 16396 TABLE DATA archive lexemes lexico_username\n`,
      },
    });

    const result = await runImport(argv(content, ["archive.lexemes"]));

    const args = restoresOf(spawned)[0]?.args ?? [];

    expect(result.exitCode).toBe(0);
    expect(args.filter((argument) => argument.endsWith("-only"))).toStrictEqual(
      flag === undefined ? [] : [flag],
    );
  });

  it("resolves unqualified names in LEXICO_POSTGRES_SCHEMA when it is set", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await runImport(argv(["--schema"], ["lexemes"]), {
      LEXICO_POSTGRES_SCHEMA: "archive",
    });

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.useList).toBe("3496;\n222;\n");
  });

  describe("fails when the dump lacks what was asked for, before connecting", () => {
    it.each([
      [
        "rows",
        ["--data"],
        ["words", "archive.lexemes"],
        "holds no rows for archive.lexemes",
      ],
      [
        "definitions",
        ["--schema"],
        ["words", "lexico.missing"],
        "holds no table definitions for lexico.missing",
      ],
      [
        "rows and definitions",
        ["--data", "--schema"],
        ["nothing", "archive.lexemes"],
        "holds no rows for lexico.nothing, archive.lexemes and no table definitions for lexico.nothing",
      ],
    ])(
      "naming the tables without %s",
      async (_case, content, tables, message) => {
        const spawned = mockProcesses({ list: { stdout: LISTING } });

        const result = await runImport(argv(content, tables));

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain(`${file} ${message}`);
        expect(restoresOf(spawned)).toStrictEqual([]);
      },
    );
  });

  it("surfaces pg_restore's own error for a file it cannot read, without restoring", async () => {
    const spawned = mockProcesses({
      list: {
        error: processFailure(1),
        stderr:
          "pg_restore: error: input file does not appear to be a valid archive\n",
      },
    });

    const result = await runImport(argv());

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "pg_restore failed with exit code 1: pg_restore: error: input file does not appear to be a valid archive",
    );
    expect(restoresOf(spawned)).toStrictEqual([]);
  });

  describe("checks pg_restore's version before reading the dump", () => {
    it.each([
      [
        "a missing binary",
        { error: processFailure("ENOENT", "spawn pg_restore ENOENT") },
        "pg_restore was not found on your PATH",
      ],
      [
        "a wrong major version",
        { stdout: "pg_restore (PostgreSQL) 16.4\n" },
        "pg_restore is major version 16, but 18 is required",
      ],
    ])("stops at %s", async (_case, version, message) => {
      const spawned = mockProcesses({ list: { stdout: LISTING }, version });

      const result = await runImport(argv());

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(result.stderr).toContain("scripts/local/software/database.sh");
      expect(spawned.map(({ args }) => args)).toStrictEqual([["--version"]]);
    });
  });

  it("keeps the password out of the arguments, masks it in every log line, and summarizes the import", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await runImport(argv(["--data"], ["words"]));

    expect(restoresOf(spawned)[0]?.args.join(" ")).not.toContain(PASSWORD);
    expect(restoresOf(spawned)[0]?.environment).toMatchObject({
      PGPASSWORD: PASSWORD,
    });
    expect(result.logs.join("\n")).not.toContain(PASSWORD);
    expect(result.logs).toContainEqual(
      expect.stringContaining(
        `Imported 1 table (data) from ${file} into ${MASKED_TARGET_URI}`,
      ),
    );
  });

  it("says a failed restore was rolled back, surfacing pg_restore's own error masked", async () => {
    mockProcesses({
      error: processFailure(1),
      list: { stdout: LISTING },
      stderr: `pg_restore: error: COPY failed for table "words": ERROR:  duplicate key value violates unique constraint "words_pkey" (${TARGET_URI})\n`,
    });

    const result = await runImport(argv());

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      'pg_restore failed with exit code 1: pg_restore: error: COPY failed for table "words"',
    );
    expect(result.stderr).toContain(
      `Nothing was imported: the restore ran as one transaction, so ${MASKED_TARGET_URI} was left unchanged.`,
    );
    expect(result.stderr).not.toContain(PASSWORD);
  });

  it("passes on a failure that is not pg_restore's own unchanged, claiming no rollback", async () => {
    const postgresClient = createMock<PostgresClientService>({
      list: vi
        .fn<PostgresClientService["list"]>()
        .mockResolvedValue([
          { dependencies: [], id: 221, kind: "data", table: "lexico.words" },
        ]),
      restore: vi
        .fn<PostgresClientService["restore"]>()
        .mockRejectedValue(new Error("ENOSPC: no space left on device")),
    });
    const module = await Test.createTestingModule({
      providers: [
        ImportCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            getOrThrow: vi.fn<() => string>().mockReturnValue("lexico"),
          }),
        },
        { provide: PostgresClientService, useValue: postgresClient },
      ],
    }).compile();
    const importCommand = await module.resolve(ImportCommand);

    const failure = importCommand.run([], {
      data: true,
      file,
      table: ["words"],
      targetUri: TARGET_URI,
    });

    await expect(failure).rejects.toThrow(
      new Error("ENOSPC: no space left on device"),
    );
  });
});
