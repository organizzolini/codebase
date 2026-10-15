import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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

/** Where successful exports write, so none lands in the working directory. */
const DIRECTORY = fs.mkdtempSync(path.join(os.tmpdir(), "export-unit-dump-"));
const DUMP = path.join(DIRECTORY, "lexico.dump");

/** The temporary file pg_dump writes beside `DUMP` before it is renamed. */
const PARTIAL_PATTERN = /^--file=.*lexico\.dump\.[\w-]+\.partial$/u;

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

  beforeEach(() => {
    fs.rmSync(DUMP, { force: true });
  });

  afterAll(() => {
    fs.rmSync(DIRECTORY, { force: true, recursive: true });
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
        ["--table", "words", "--data", "--file", DUMP],
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
          DUMP,
        ],
        "--source-uri must start with postgresql://",
      ],
      [
        "no --table",
        ["--source-uri", SOURCE_URI, "--data", "--file", DUMP],
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
      DUMP,
    ]);

    expect(result.exitCode).toBe(0);
    expect(dumpsOf(spawned)).toStrictEqual([
      expect.objectContaining({
        args: [
          "--format=custom",
          expect.stringMatching(PARTIAL_PATTERN),
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
      DUMP,
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
        DUMP,
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
      DUMP,
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

  describe("checks pg_dump's version before any database work", () => {
    const argv = [
      "--source-uri",
      SOURCE_URI,
      "--table",
      "words",
      "--data",
      "--file",
      DUMP,
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

  describe("refuses to overwrite an existing --file", () => {
    let directory: string;
    let file: string;

    const argv = (): string[] => [
      "--source-uri",
      SOURCE_URI,
      "--table",
      "words",
      "--data",
      "--file",
      file,
    ];

    beforeEach(() => {
      directory = fs.mkdtempSync(path.join(os.tmpdir(), "export-unit-"));
      file = path.join(directory, "lexico.dump");
    });

    afterEach(() => {
      fs.rmSync(directory, { force: true, recursive: true });
    });

    it("exits non-zero naming the file and --overwrite, starting no process and leaving the file unchanged", async () => {
      fs.writeFileSync(file, "precious");
      const spawned = mockProcesses();

      const result = await runExport(argv());

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(file);
      expect(result.stderr).toContain("--overwrite");
      expect(result.stderr).not.toContain(PASSWORD);
      expect(spawned).toStrictEqual([]);
      expect(fs.readFileSync(file, "utf8")).toBe("precious");
    });

    it("dumps over the existing file when --overwrite is passed", async () => {
      fs.writeFileSync(file, "precious");
      const spawned = mockProcesses();

      const result = await runExport([...argv(), "--overwrite"]);

      expect(result.exitCode).toBe(0);
      expect(dumpsOf(spawned)).toStrictEqual([
        expect.objectContaining({
          args: expect.arrayContaining([
            expect.stringContaining(`--file=${file}.`),
          ]) as unknown,
        }),
      ]);
    });

    it("dumps when the file does not exist yet, with or without --overwrite", async () => {
      mockProcesses();

      const plain = await runExport(argv());
      const forced = await runExport([...argv(), "--overwrite"]);

      expect([plain.exitCode, forced.exitCode]).toStrictEqual([0, 0]);
    });

    it("keeps the previous file's bytes and leaves no temporary file when a --overwrite dump fails", async () => {
      fs.writeFileSync(file, "precious");
      mockProcesses({ error: processFailure(1), stderr: "pg_dump: error\n" });

      const result = await runExport([...argv(), "--overwrite"]);

      expect(result.exitCode).toBe(1);
      expect(fs.readFileSync(file, "utf8")).toBe("precious");
      expect(fs.readdirSync(directory)).toStrictEqual(["lexico.dump"]);
    });

    it("replaces the previous file with the dump and leaves no temporary file on success", async () => {
      fs.writeFileSync(file, "precious");
      mockProcesses();

      const result = await runExport([...argv(), "--overwrite"]);

      expect(result.exitCode).toBe(0);
      expect(fs.readFileSync(file, "utf8")).toBe("dump");
      expect(fs.readdirSync(directory)).toStrictEqual(["lexico.dump"]);
    });

    it("surfaces an error that is not pg_dump's unchanged, leaving no temporary file", async () => {
      fs.mkdirSync(path.join(file, "occupied"), { recursive: true });
      mockProcesses();

      const result = await runExport([...argv(), "--overwrite"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).not.toContain("pg_dump failed");
      expect(fs.readdirSync(directory)).toStrictEqual(["lexico.dump"]);
    });
  });
});
