import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";

import type { LoggerService } from "@codebase/logging";

describe(TypeormMigrationSqlExtractorService, () => {
  let service: TypeormMigrationSqlExtractorService;
  let logger: LoggerService;

  let originalCwd = "";
  let tempDirectories: string[] = [];

  async function createTempDirectory(prefix: string): Promise<string> {
    const directory = await mkdtemp(path.join(tmpdir(), prefix));
    tempDirectories.push(directory);
    return directory;
  }

  async function writeMigrationFile(options: {
    directory: string;
    downSql: string[];
    fileName: string;
    upSql: string[];
  }): Promise<void> {
    const migrationFilePath = path.join(options.directory, options.fileName);
    await writeFile(
      migrationFilePath,
      [
        `export class Migration${options.fileName.replaceAll(/\D/gu, "")} {`,
        "  public async up(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        ...options.upSql.map((sql) => `    await queryRunner.query("${sql}");`),
        "  }",
        "  public async down(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        ...options.downSql.map(
          (sql) => `    await queryRunner.query("${sql}");`,
        ),
        "  }",
        "}",
      ].join("\n"),
      "utf8",
    );
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [TypeormMigrationSqlExtractorService],
    }).compile();

    service = await module.resolve(TypeormMigrationSqlExtractorService);
  });

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDirectories = [];
    logger = createMock<LoggerService>();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await Promise.all(
      tempDirectories.map(async (directory) =>
        rm(directory, { force: true, recursive: true }),
      ),
    );
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("writes extracted sql files for an explicitly selected migration", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE alpha"],
      fileName: "1791255787877-migration.ts",
      upSql: ["CREATE TABLE alpha (id int)"],
    });

    const result = await service.synchronize({
      logger,
      mode: "write",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    const upSql = await readFile(
      path.join(migrationsDirectory, "1791255787877-migration-up.sql"),
      "utf8",
    );
    const downSql = await readFile(
      path.join(migrationsDirectory, "1791255787877-migration-down.sql"),
      "utf8",
    );

    expect(result).toBe(true);
    expect(upSql).toBe("CREATE TABLE alpha (id int);\n");
    expect(downSql).toBe("DROP TABLE alpha;\n");
  });

  it("reports false in check mode when extracted sql files are out of sync", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE alpha"],
      fileName: "1791255787877-migration.ts",
      upSql: ["CREATE TABLE alpha (id int)"],
    });
    await writeFile(
      path.join(migrationsDirectory, "1791255787877-migration-up.sql"),
      "stale sql;\n",
      "utf8",
    );
    await writeFile(
      path.join(migrationsDirectory, "1791255787877-migration-down.sql"),
      "stale sql;\n",
      "utf8",
    );

    const result = await service.synchronize({
      logger,
      mode: "check",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    expect(result).toBe(false);
    expect(logger.info).toHaveBeenCalledWith(
      "🧾 Detected out-of-sync migration SQL files",
      undefined,
      expect.any(Object),
    );
  });

  it("returns true in check mode when extracted sql files are already in sync", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE alpha"],
      fileName: "1791255787877-migration.ts",
      upSql: ["CREATE TABLE alpha (id int)"],
    });

    await service.synchronize({
      logger,
      mode: "write",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    const result = await service.synchronize({
      logger,
      mode: "check",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    expect(result).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      "🧾 Verified TypeORM migration SQL extraction",
    );
  });

  it("processes every migration when selection is all", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE alpha"],
      fileName: "1791255787877-migration.ts",
      upSql: ["CREATE TABLE alpha (id int)"],
    });
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE beta"],
      fileName: "1791255787878-migration.ts",
      upSql: ["CREATE TABLE beta (id int)"],
    });

    const result = await service.synchronize({
      logger,
      mode: "write",
      options: {
        directory: migrationsDirectory,
        selection: "all",
      },
    });

    const latestUp = await readFile(
      path.join(migrationsDirectory, "1791255787878-migration-up.sql"),
      "utf8",
    );
    const firstUp = await readFile(
      path.join(migrationsDirectory, "1791255787877-migration-up.sql"),
      "utf8",
    );

    expect(result).toBe(true);
    expect(firstUp).toContain("CREATE TABLE alpha");
    expect(latestUp).toContain("CREATE TABLE beta");
  });

  it("processes only the latest migration when selection is omitted", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE alpha"],
      fileName: "1791255787877-migration.ts",
      upSql: ["CREATE TABLE alpha (id int)"],
    });
    await writeMigrationFile({
      directory: migrationsDirectory,
      downSql: ["DROP TABLE beta"],
      fileName: "1791255787878-migration.ts",
      upSql: ["CREATE TABLE beta (id int)"],
    });

    const result = await service.synchronize({
      logger,
      mode: "write",
      options: { directory: migrationsDirectory },
    });

    const firstMigrationUpPath = path.join(
      migrationsDirectory,
      "1791255787877-migration-up.sql",
    );
    const latestMigrationUpPath = path.join(
      migrationsDirectory,
      "1791255787878-migration-up.sql",
    );

    expect(result).toBe(true);
    await expect(readFile(firstMigrationUpPath, "utf8")).rejects.toThrow(
      "ENOENT",
    );
    await expect(readFile(latestMigrationUpPath, "utf8")).resolves.toContain(
      "CREATE TABLE beta",
    );
  });

  it("warns and skips unsupported template-expression queries", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeFile(
      path.join(migrationsDirectory, "1791255787877-migration.ts"),
      [
        "const table = 'alpha';",
        "export class Migration1791255787877 {",
        "  public async up(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        "    await queryRunner.query(`CREATE TABLE ${table} (id int)`);",
        "  }",
        "  public async down(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        '    await queryRunner.query("DROP TABLE alpha");',
        "  }",
        "}",
      ].join("\n"),
      "utf8",
    );

    const result = await service.synchronize({
      logger,
      mode: "write",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    const upSql = await readFile(
      path.join(migrationsDirectory, "1791255787877-migration-up.sql"),
      "utf8",
    );

    expect(result).toBe(true);
    expect(upSql).toBe("");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Skipping query template literal with expressions",
      ),
    );
  });

  it("returns false and logs an error when project-root is passed without module", async () => {
    const result = await service.synchronize({
      logger,
      mode: "check",
      options: { projectRoot: "projects/lexico/lexico-entities" },
    });

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      "💥 Failed synchronizing extracted TypeORM migration SQL",
      expect.stringContaining("Pass --directory <path>"),
    );
  });

  it("returns false when migration directory has no migration files", async () => {
    const emptyDirectory = await createTempDirectory("typeorm-sql-empty-");

    const result = await service.synchronize({
      logger,
      mode: "check",
      options: { directory: emptyDirectory },
    });

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      "💥 Failed synchronizing extracted TypeORM migration SQL",
      expect.stringContaining("No migration files found"),
    );
  });

  it("returns false when migration path points to a directory", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    const migrationDirectoryPath = path.join(
      migrationsDirectory,
      "1791255787877-migration.ts",
    );
    await mkdir(migrationDirectoryPath, { recursive: true });

    const result = await service.synchronize({
      logger,
      mode: "check",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      "💥 Failed synchronizing extracted TypeORM migration SQL",
      expect.stringContaining("is not a migration file"),
    );
  });

  it("extracts statements even when class includes non-method members", async () => {
    const migrationsDirectory = await createTempDirectory(
      "typeorm-sql-extractor-",
    );
    await writeFile(
      path.join(migrationsDirectory, "1791255787877-migration.ts"),
      [
        "export class Migration1791255787877 {",
        "  private readonly metadata = 'skip';",
        "  public helper(): void {}",
        "  public async up(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        "    await queryRunner.query(`CREATE TABLE alpha (id int)`);",
        "  }",
        "  public async down(queryRunner: { query: (sql: string) => Promise<void> }): Promise<void> {",
        "    await queryRunner.query('DROP TABLE alpha');",
        "  }",
        "}",
      ].join("\n"),
      "utf8",
    );

    const result = await service.synchronize({
      logger,
      mode: "write",
      options: {
        directory: migrationsDirectory,
        migration: "1791255787877-migration.ts",
      },
    });

    const upSql = await readFile(
      path.join(migrationsDirectory, "1791255787877-migration-up.sql"),
      "utf8",
    );

    expect(result).toBe(true);
    expect(upSql).toBe("CREATE TABLE alpha (id int);\n");
  });

  it("discovers migration targets from project.json when project name is passed", async () => {
    const workspaceRoot = await createTempDirectory("typeorm-sql-workspace-");
    const projectRoot = path.join(workspaceRoot, "projects", "alpha");
    const modulePath = "src/modules/database";
    const migrationsDirectory = path.join(
      projectRoot,
      modulePath,
      "migrations",
    );
    await mkdir(migrationsDirectory, { recursive: true });
    await writeFile(
      path.join(projectRoot, "project.json"),
      JSON.stringify(
        {
          name: "alpha",
          targets: { migration: { options: { module: modulePath } } },
        },
        null,
        2,
      ),
      "utf8",
    );
    process.chdir(workspaceRoot);

    const targets = await service.targets({ project: "alpha" });

    expect(targets).toHaveLength(1);
    expect(targets[0]?.projectName).toBe("alpha");
    expect(targets[0]?.migrationsDirectory.endsWith(migrationsDirectory)).toBe(
      true,
    );
  });

  it("throws when project filter does not match a migration-enabled project", async () => {
    const workspaceRoot = await createTempDirectory("typeorm-sql-workspace-");
    const projectRoot = path.join(workspaceRoot, "projects", "alpha");
    await mkdir(projectRoot, { recursive: true });
    await writeFile(
      path.join(projectRoot, "project.json"),
      JSON.stringify(
        {
          name: "alpha",
          targets: {
            migration: { options: { module: "src/modules/database" } },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    process.chdir(workspaceRoot);

    await expect(service.targets({ project: "missing" })).rejects.toThrow(
      'No project named "missing" exposes targets.migration.options.module.',
    );
  });

  it("stringifies non-error failures caught during synchronization", async () => {
    vi.spyOn(service, "targets").mockRejectedValueOnce("boom");

    const result = await service.synchronize({
      logger,
      mode: "check",
      options: {},
    });

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      "💥 Failed synchronizing extracted TypeORM migration SQL",
      "boom",
    );
  });
});
