import { createMock } from "@golevelup/ts-vitest";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerModule, LoggerService } from "@codebase/logging";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses, processFailure } from "../../../testing/mocks";
import { environmentSchema } from "../../lexico-cli.constants";
import { PostgresClientService } from "../postgres-client/postgres-client.service";

import { ExportCommand } from "./export.command";
import { ExportModule } from "./export.module";

import type { SpawnedProcess } from "../../../testing/mocks";
import type { DynamicModule } from "@nestjs/common";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const SOURCE_URI = `postgresql://lexico_username:${PASSWORD}@database.example.com:6543/lexico_development`;

/** Holds whichever configuration `exportTestModule` was last built with. */
@Module({})
class ExportTestModule {}

/** The processes that dumped, leaving out the version check before them. */
function dumpsOf(spawned: readonly SpawnedProcess[]): SpawnedProcess[] {
  return spawned.filter(({ args }) => args[0] !== "--version");
}

/**
 * The export command on its own: the real runner and option parsing, with
 * no database connection opened at start-up the way `MainModule`'s is. Built
 * per run because `ConfigModule` validates the environment as it is built.
 */
function exportTestModule(): DynamicModule {
  return {
    imports: [
      ConfigModule.forRoot({
        ignoreEnvFile: true,
        isGlobal: true,
        validate: (config: Record<string, unknown>) =>
          environmentSchema.parse(config),
      }),
      LoggerModule,
      ExportModule,
    ],
    module: ExportTestModule,
  };
}

/** Runs `export` with `argv` and `env` through the real nest-commander runner. */
async function runExport(
  argv: readonly string[],
  env: Readonly<Record<string, string>> = {},
): ReturnType<typeof runCliCommandLine> {
  vi.stubEnv("LEXICO_POSTGRES_SCHEMA", undefined);
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);

  try {
    return await runCliCommandLine({
      argv: ["export", ...argv],
      module: exportTestModule(),
    });
  } finally {
    vi.unstubAllEnvs();
  }
}

describe(ExportCommand, () => {
  let command: ExportCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExportCommand,
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

    command = await module.resolve(ExportCommand);
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExportCommand,
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

    expect(logger.setContext).toHaveBeenCalledWith("ExportCommand");
  });

  describe("fails fast, before any process starts", () => {
    it.each([
      [
        "no --source-uri",
        ["--table", "words", "--data", "--file", "lexico.dump"],
        "--source-uri is required",
      ],
      [
        "an unusable --source-uri",
        [
          "--source-uri",
          `mysql://root:${PASSWORD}@localhost/lexico`,
          "--table",
          "words",
          "--data",
          "--file",
          "lexico.dump",
        ],
        "--source-uri must start with postgresql://",
      ],
      [
        "no --table",
        ["--source-uri", SOURCE_URI, "--data", "--file", "lexico.dump"],
        "--table is required",
      ],
      [
        "neither --data nor --schema",
        ["--source-uri", SOURCE_URI, "--table", "words", "--file", "x.dump"],
        "--data or --schema is required",
      ],
      [
        "no --file",
        ["--source-uri", SOURCE_URI, "--table", "words", "--schema"],
        "--file is required",
      ],
    ])("with %s", async (_case, argv, message) => {
      const spawned = mockProcesses();

      const result = await runExport(argv);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(result.stderr).not.toContain(PASSWORD);
      expect(spawned).toStrictEqual([]);
    });
  });

  it("dumps the selected tables, resolving unqualified names in the Lexico schema", async () => {
    const spawned = mockProcesses();

    const result = await runExport([
      "--source-uri",
      SOURCE_URI,
      "--table",
      "words",
      "--table",
      "archive.lexemes",
      "--data",
      "--file",
      "lexico.dump",
    ]);

    expect(result.exitCode).toBe(0);
    expect(dumpsOf(spawned)).toStrictEqual([
      expect.objectContaining({
        args: [
          "--format=custom",
          "--file=lexico.dump",
          "--no-password",
          "--strict-names",
          "--data-only",
          "--table=lexico.words",
          "--table=archive.lexemes",
        ],
        file: "pg_dump",
      }),
    ]);
  });

  it.each([
    [["--schema"], ["--schema-only"]],
    [["--data", "--schema"], []],
  ])("maps %o to the pg_dump flags %o", async (contentFlags, dumpFlags) => {
    const spawned = mockProcesses();

    await runExport([
      "--source-uri",
      SOURCE_URI,
      "--table",
      "words",
      ...contentFlags,
      "--file",
      "lexico.dump",
    ]);

    expect(dumpsOf(spawned)[0]?.args.slice(4, -1)).toStrictEqual(dumpFlags);
  });

  it("resolves unqualified names in LEXICO_POSTGRES_SCHEMA when it is set", async () => {
    const spawned = mockProcesses();

    await runExport(
      [
        "--source-uri",
        SOURCE_URI,
        "--table",
        "words",
        "--schema",
        "--file",
        "lexico.dump",
      ],
      { LEXICO_POSTGRES_SCHEMA: "archive" },
    );

    expect(dumpsOf(spawned)[0]?.args).toContain("--table=archive.words");
  });

  it("keeps the password out of the arguments and masks it in every log line", async () => {
    const spawned = mockProcesses();

    const result = await runExport([
      "--source-uri",
      SOURCE_URI,
      "--table",
      "words",
      "--data",
      "--schema",
      "--file",
      "lexico.dump",
    ]);

    expect(dumpsOf(spawned)[0]?.args.join(" ")).not.toContain(PASSWORD);
    expect(dumpsOf(spawned)[0]?.environment).toMatchObject({
      PGPASSWORD: PASSWORD,
    });
    expect(result.logs.join("\n")).not.toContain(PASSWORD);
    expect(result.logs).toContainEqual(
      expect.stringContaining(
        "postgresql://lexico_username:****@database.example.com:6543/lexico_development",
      ),
    );
    expect(result.logs).toContainEqual(
      expect.stringContaining("Exported 1 table (data and schema)"),
    );
  });

  it("surfaces pg_dump's own error, masked, with a non-zero exit code", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: `pg_dump: error: no matching tables were found for pattern "lexico.nope" on ${SOURCE_URI}\n`,
    });

    const result = await runExport([
      "--source-uri",
      SOURCE_URI,
      "--table",
      "nope",
      "--data",
      "--file",
      "lexico.dump",
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      'pg_dump failed with exit code 1: pg_dump: error: no matching tables were found for pattern "lexico.nope"',
    );
    expect(result.stderr).not.toContain(PASSWORD);
  });

  describe("checks pg_dump's version before any database work", () => {
    const argv = [
      "--source-uri",
      SOURCE_URI,
      "--table",
      "words",
      "--data",
      "--file",
      "lexico.dump",
    ];

    it("asks pg_dump for its version first, then dumps", async () => {
      const spawned = mockProcesses();

      await runExport(argv);

      expect(spawned.map(({ args }) => args[0])).toStrictEqual([
        "--version",
        "--format=custom",
      ]);
    });

    it.each([
      [
        "a missing binary",
        { error: processFailure("ENOENT", "spawn pg_dump ENOENT") },
        "pg_dump was not found on your PATH",
      ],
      [
        "a wrong major version",
        { stdout: "pg_dump (PostgreSQL) 16.4\n" },
        "pg_dump is major version 16, but 18 is required",
      ],
    ])("stops at %s without dumping", async (_case, version, message) => {
      const spawned = mockProcesses({ version });

      const result = await runExport(argv);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(result.stderr).toContain("scripts/local/software/database.sh");
      expect(spawned.map(({ args }) => args)).toStrictEqual([["--version"]]);
    });
  });
});
