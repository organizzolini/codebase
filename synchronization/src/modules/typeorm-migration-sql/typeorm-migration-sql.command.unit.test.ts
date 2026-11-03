import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";
import { TypeormMigrationSqlCommand } from "./typeorm-migration-sql.command";

const moduleOptions = {
  providers: [SynchronizationService, TypeormMigrationSqlExtractorService],
};

import type { BuiltTestingModule } from "@codebase/testing/nestjs";

describe(TypeormMigrationSqlCommand, () => {
  let command: TypeormMigrationSqlCommand;
  let extractorService: TypeormMigrationSqlExtractorService;
  let logger: BuiltTestingModule<unknown>["logger"];

  beforeAll(async () => {
    const built = await buildTestingModule(
      TypeormMigrationSqlCommand,
      moduleOptions,
    );

    command = built.instance;
    extractorService = await built.module.resolve(
      TypeormMigrationSqlExtractorService,
    );
    logger = built.logger;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      TypeormMigrationSqlCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(TypeormMigrationSqlCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(TypeormMigrationSqlCommand, moduleOptions);
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

  it("writes extracted up and down SQL files for a migration", async () => {
    const directory = createTemporaryDirectory("typeorm-migration-sql-command");
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
    const directory = createTemporaryDirectory("typeorm-migration-sql-command");
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
