import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/logging";

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";
import { TypeormMigrationSqlCommand } from "./typeorm-migration-sql.command";

describe(TypeormMigrationSqlCommand, () => {
  let command: TypeormMigrationSqlCommand;
  let extractorService: TypeormMigrationSqlExtractorService;
  let logger: LoggerService;
  let tempDirectories: string[] = [];

  async function makeTempDirectory(): Promise<string> {
    const directory = await mkdtemp(
      path.join(tmpdir(), "typeorm-migration-sql-command-"),
    );
    tempDirectories.push(directory);
    return directory;
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TypeormMigrationSqlCommand,
        SynchronizationService,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        TypeormMigrationSqlExtractorService,
      ],
    }).compile();

    command = await module.resolve(TypeormMigrationSqlCommand);
    extractorService = await module.resolve(
      TypeormMigrationSqlExtractorService,
    );
    logger = await module.resolve(LoggerService);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await Promise.all(
      tempDirectories.map(async (directory) =>
        rm(directory, { force: true, recursive: true }),
      ),
    );
    tempDirectories = [];
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("parses scalar command options unchanged", () => {
    expect(command.parseDirectory("dir")).toBe("dir");
    expect(command.parseMigration("migration.ts")).toBe("migration.ts");
    expect(command.parseModule("src/modules/database")).toBe(
      "src/modules/database",
    );
    expect(command.parseProject("lexico-entities")).toBe("lexico-entities");
    expect(command.parseProjectRoot("projects/lexico/lexico-entities")).toBe(
      "projects/lexico/lexico-entities",
    );
  });

  it("parses selection as all only when explicitly requested", () => {
    expect(command.parseSelection("all")).toBe("all");
    expect(command.parseSelection("latest")).toBe("latest");
    expect(command.parseSelection("unknown")).toBe("latest");
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        TypeormMigrationSqlCommand,
        SynchronizationService,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        TypeormMigrationSqlExtractorService,
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "TypeormMigrationSqlCommand",
    );
  });

  it("writes extracted up and down SQL files for a migration", async () => {
    const directory = await makeTempDirectory();
    const migrationFile = path.join(directory, "1791255787877-migration.ts");
    await writeFile(
      migrationFile,
      [
        "export class Migration1791255787877 {",
        "  public async up(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("CREATE TABLE alpha (id int)");',
        '    await queryRunner.query("ALTER TABLE alpha ADD COLUMN name text");',
        "  }",
        "  public async down(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("DROP TABLE alpha");',
        "  }",
        "}",
      ].join("\n"),
    );

    await command.run(["write"], {
      directory,
      migration: "1791255787877-migration.ts",
    });

    const upSql = await readFile(
      path.join(directory, "1791255787877-migration-up.sql"),
      "utf8",
    );
    const downSql = await readFile(
      path.join(directory, "1791255787877-migration-down.sql"),
      "utf8",
    );

    expect(upSql).toBe(
      "CREATE TABLE alpha (id int);\n\nALTER TABLE alpha ADD COLUMN name text;\n",
    );
    expect(downSql).toBe("DROP TABLE alpha;\n");
    expect(upSql).not.toContain("SET lock_timeout");
    expect(upSql).not.toContain("SET statement_timeout");
  });

  it("exits with code 1 when check mode finds out-of-sync SQL files", async () => {
    const directory = await makeTempDirectory();
    const migrationFile = path.join(directory, "1791255787877-migration.ts");
    await writeFile(
      migrationFile,
      [
        "export class Migration1791255787877 {",
        "  public async up(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("CREATE TABLE alpha (id int)");',
        "  }",
        "  public async down(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("DROP TABLE alpha");',
        "  }",
        "}",
      ].join("\n"),
    );
    await writeFile(
      path.join(directory, "1791255787877-migration-up.sql"),
      "stale sql;\n",
    );
    await writeFile(
      path.join(directory, "1791255787877-migration-down.sql"),
      "stale sql;\n",
    );

    await expectProcessExitOne(async () => {
      await command.run(["check"], {
        directory,
        migration: "1791255787877-migration.ts",
      });
    });

    expect(logger.info).toHaveBeenCalledWith(
      "🧾 Detected out-of-sync migration SQL files",
      undefined,
      expect.any(Object),
    );
  });

  it("delegates synchronize() to extractor service", async () => {
    vi.spyOn(extractorService, "synchronize").mockResolvedValueOnce(true);

    const result = await command.synchronize("check", {
      directory:
        "projects/lexico/lexico-entities/src/modules/database/migrations",
    });

    expect(result).toBe(true);
    expect(extractorService.synchronize).toHaveBeenCalledWith({
      logger,
      mode: "check",
      options: {
        directory:
          "projects/lexico/lexico-entities/src/modules/database/migrations",
      },
    });
  });
});
