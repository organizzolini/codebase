import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import ts from "typescript";

import {
  MIGRATIONS_FOLDER,
  TYPEORM_MIGRATION_FILE_PATTERN,
} from "./typeorm-migration-sql.constants";
import { normalizeSql } from "./typeorm-migration-sql.utilities";

import type {
  MigrationSqlPaths,
  MigrationSqlStatements,
  TypeormMigrationMode,
  TypeormMigrationParsedProjectTarget,
  TypeormMigrationProjectTarget,
  TypeormMigrationSelection,
  TypeormMigrationSqlCommandOptions,
} from "./typeorm-migration-sql.types";
import type { LoggerService } from "@codebase/observability";

/** Extracts TypeORM migration SQL files for synchronization checks. */
@Injectable()
export class TypeormMigrationSqlExtractorService {
  // 🏗 Dependency Injection
  constructor() {}
  // 🔐 Private Fields
  // 🔑 Public Fields
  // 🔏 Private Methods

  /**
   * Checks the committed SQL files against the expected output. Both sides
   * are normalized because the committed files are lint-fixed and formatted.
   */
  private async checkExtractedSql(options: {
    expectedDown: string;
    expectedUp: string;
    migrationSqlPaths: MigrationSqlPaths;
  }): Promise<{ downMatches: boolean; upMatches: boolean }> {
    const actualUp = await this.maybeFile(options.migrationSqlPaths.upPath);
    const actualDown = await this.maybeFile(options.migrationSqlPaths.downPath);
    return {
      downMatches:
        actualDown !== null &&
        normalizeSql(actualDown) === normalizeSql(options.expectedDown),
      upMatches:
        actualUp !== null &&
        normalizeSql(actualUp) === normalizeSql(options.expectedUp),
    };
  }

  /** Full paths of the directories directly inside one directory. */
  private async childDirectories(directoryPath: string): Promise<string[]> {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(directoryPath, entry.name));
  }

  /** One explicit target from `--directory` or `--project-root`. */
  private explicitTarget({
    directory,
    project,
    projectRoot,
  }: TypeormMigrationSqlCommandOptions):
    | TypeormMigrationProjectTarget
    | undefined {
    if (directory !== undefined) {
      return {
        migrationsDirectory: directory,
        projectName: project ?? "<directory>",
      };
    }

    if (projectRoot !== undefined) {
      return {
        migrationsDirectory: path.join(projectRoot, MIGRATIONS_FOLDER),
        projectName: project ?? path.basename(projectRoot),
      };
    }

    return undefined;
  }

  /** The latest migration entry from one sorted migration entry list. */
  private latestMigrationEntry(
    migrationEntries: string[],
    directory: string,
  ): string {
    const latest = migrationEntries.at(-1);
    if (latest === undefined) {
      throw new Error(`No migration files found in ${directory}.`);
    }
    return latest;
  }

  /** Existing file contents, or null when the file does not exist. */
  private async maybeFile(pathToFile: string): Promise<null | string> {
    return readFile(pathToFile, "utf8").catch(() => null);
  }

  /** Every migration source file path this command should process. */
  private async migrationFiles(options: {
    directory: string;
    migration?: string;
    selection: TypeormMigrationSelection;
  }): Promise<string[]> {
    if (options.migration !== undefined) {
      return this.singleMigrationFile(options.directory, options.migration);
    }

    const migrationEntries = await this.sortedMigrationEntries(
      options.directory,
    );
    if (options.selection === "all") {
      return migrationEntries.map((entry) =>
        path.join(options.directory, entry),
      );
    }

    return [
      path.join(
        options.directory,
        this.latestMigrationEntry(migrationEntries, options.directory),
      ),
    ];
  }

  /** Builds an optional migration argument without passing explicit undefined. */
  private migrationOption(migration: string | undefined): {
    migration?: string;
  } {
    return migration === undefined ? {} : { migration };
  }

  /** The SQL output file paths paired with one migration source file. */
  private migrationSqlPaths(
    directory: string,
    migrationPath: string,
  ): MigrationSqlPaths {
    const baseName = path.basename(migrationPath, ".ts");
    return {
      downPath: path.join(directory, `${baseName}-down.sql`),
      migrationPath,
      upPath: path.join(directory, `${baseName}-up.sql`),
    };
  }

  /** One migration target parsed from one project.json path. */
  private async parsedProjectTarget(
    projectJsonPath: string,
    projectFilter?: string,
  ): Promise<TypeormMigrationParsedProjectTarget | undefined> {
    const raw = await readFile(projectJsonPath, "utf8");
    const parsed = JSON.parse(raw) as {
      name?: string;
      targets?: { migration?: unknown };
    };
    const projectName = parsed.name;
    if (projectName === undefined || parsed.targets?.migration === undefined) {
      return undefined;
    }
    if (projectFilter !== undefined && projectName !== projectFilter) {
      return undefined;
    }
    return {
      projectName,
      projectRoot: path.dirname(projectJsonPath),
    };
  }

  /**
   * Every project.json one or two levels under the workspace projects/
   * directory. Kept flat so the call stack stays within the depth limit.
   */
  private async projectJsonPaths(): Promise<string[]> {
    const projectsRoot = path.join(process.cwd(), "projects");
    const found: string[] = [];
    for (const group of await this.childDirectories(projectsRoot)) {
      const candidates = [group, ...(await this.childDirectories(group))];
      for (const candidate of candidates) {
        const projectJson = path.join(candidate, "project.json");
        const stats = await stat(projectJson).catch(() => {});
        if (stats?.isFile()) found.push(projectJson);
      }
    }
    return found;
  }

  /** SQL text rendered from extracted statements. */
  private renderSql(statements: string[]): string {
    if (statements.length === 0) return "";
    return `${statements.join("\n\n")}\n`;
  }

  /** The migration file path when this run named one directly. */
  private async singleMigrationFile(
    directory: string,
    migration: string,
  ): Promise<string[]> {
    const migrationPath = path.isAbsolute(migration)
      ? migration
      : path.join(directory, migration);
    const migrationStats = await stat(migrationPath);
    if (!migrationStats.isFile()) {
      throw new Error(`${migrationPath} is not a migration file.`);
    }
    return [migrationPath];
  }

  /** Migration file names in one directory that match the TypeORM pattern. */
  private async sortedMigrationEntries(directory: string): Promise<string[]> {
    const entries = await readdir(directory);
    const migrationEntries = entries
      .filter((entry) => TYPEORM_MIGRATION_FILE_PATTERN.test(entry))
      .toSorted();
    if (migrationEntries.length === 0) {
      throw new Error(`No migration files found in ${directory}.`);
    }
    return migrationEntries;
  }

  /** One migration SQL statement text extracted from a query call node. */
  private sqlFromQueryCall(
    logger: LoggerService,
    node: ts.Node,
    sourceFile: ts.SourceFile,
  ): string | undefined {
    if (
      !ts.isCallExpression(node) ||
      !ts.isPropertyAccessExpression(node.expression) ||
      node.expression.name.text !== "query"
    ) {
      return undefined;
    }

    const firstArgument = node.arguments[0];
    if (firstArgument === undefined) return undefined;
    const sql = this.sqlLiteral(logger, firstArgument, sourceFile);
    if (sql === undefined) return undefined;
    const trimmed = sql.trim();
    if (trimmed === "") return undefined;
    return trimmed.endsWith(";") ? trimmed : `${trimmed};`;
  }

  /** SQL text from a query argument literal. */
  private sqlLiteral(
    logger: LoggerService,
    argument: ts.Expression,
    sourceFile: ts.SourceFile,
  ): string | undefined {
    if (ts.isStringLiteral(argument)) return argument.text;
    if (ts.isNoSubstitutionTemplateLiteral(argument)) return argument.text;
    if (!ts.isTemplateExpression(argument)) return undefined;

    const { line } = sourceFile.getLineAndCharacterOfPosition(
      argument.getStart(),
    );
    logger.warn(
      `⚠️ Skipping query template literal with expressions at ${sourceFile.fileName}:${String(line + 1)}`,
    );
    return undefined;
  }

  /** SQL statements extracted from a migration class declaration node. */
  private statementsFromClass(
    logger: LoggerService,
    node: ts.Node,
    sourceFile: ts.SourceFile,
  ): MigrationSqlStatements | undefined {
    if (!ts.isClassDeclaration(node)) return undefined;

    const statements: MigrationSqlStatements = { down: [], up: [] };
    for (const member of node.members) {
      if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) {
        continue;
      }
      if (member.name.text !== "up" && member.name.text !== "down") continue;
      const sqlStatements = this.statementsFromMethod(
        logger,
        member,
        sourceFile,
      );
      if (member.name.text === "up") statements.up = sqlStatements;
      else statements.down = sqlStatements;
    }
    return statements;
  }

  /** SQL statements extracted from one migration method body. */
  private statementsFromMethod(
    logger: LoggerService,
    method: ts.MethodDeclaration,
    sourceFile: ts.SourceFile,
  ): string[] {
    const statements: string[] = [];
    const visit = (node: ts.Node): void => {
      const sql = this.sqlFromQueryCall(logger, node, sourceFile);
      if (sql !== undefined) statements.push(sql);
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(method, visit);
    return statements;
  }

  /** SQL statements extracted from one migration source file. */
  private statementsFromMigrationFile(
    logger: LoggerService,
    migrationFilePath: string,
    source: string,
  ): MigrationSqlStatements {
    const sourceFile = ts.createSourceFile(
      migrationFilePath,
      source,
      ts.ScriptTarget.Latest,
      true,
    );
    const statements: MigrationSqlStatements = { down: [], up: [] };
    const visit = (node: ts.Node): void => {
      const classStatements = this.statementsFromClass(
        logger,
        node,
        sourceFile,
      );
      if (classStatements !== undefined) {
        statements.up = classStatements.up;
        statements.down = classStatements.down;
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sourceFile, visit);
    return statements;
  }

  /** Synchronizes one migration in write or check mode. */
  private async synchronizeMigration(options: {
    logger: LoggerService;
    migrationSqlPaths: MigrationSqlPaths;
    mode: TypeormMigrationMode;
    projectName: string;
  }): Promise<boolean> {
    const source = await readFile(
      options.migrationSqlPaths.migrationPath,
      "utf8",
    );
    const statements = this.statementsFromMigrationFile(
      options.logger,
      options.migrationSqlPaths.migrationPath,
      source,
    );
    const expectedUp = this.renderSql(statements.up);
    const expectedDown = this.renderSql(statements.down);

    if (options.mode === "write") {
      await this.writeExtractedSql({
        expectedDown,
        expectedUp,
        migrationSqlPaths: options.migrationSqlPaths,
      });
      options.logger.info("🧾 Wrote extracted SQL files", undefined, {
        downStatements: statements.down.length,
        migration: options.migrationSqlPaths.migrationPath,
        projectName: options.projectName,
        upStatements: statements.up.length,
      });
      return true;
    }

    const checks = await this.checkExtractedSql({
      expectedDown,
      expectedUp,
      migrationSqlPaths: options.migrationSqlPaths,
    });
    if (checks.downMatches && checks.upMatches) return true;

    options.logger.info(
      "🧾 Detected out-of-sync migration SQL files",
      undefined,
      {
        downExpectedBytes: expectedDown.length,
        downMatches: checks.downMatches,
        migration: options.migrationSqlPaths.migrationPath,
        projectName: options.projectName,
        upExpectedBytes: expectedUp.length,
        upMatches: checks.upMatches,
      },
    );
    return false;
  }

  /** Writes extracted SQL files for one migration. */
  private async writeExtractedSql(options: {
    expectedDown: string;
    expectedUp: string;
    migrationSqlPaths: MigrationSqlPaths;
  }): Promise<void> {
    await writeFile(options.migrationSqlPaths.upPath, options.expectedUp);
    await writeFile(options.migrationSqlPaths.downPath, options.expectedDown);
  }

  // 🌎 Public Methods

  /** Synchronizes extracted SQL in check or write mode. */
  async synchronize(options: {
    logger: LoggerService;
    mode: TypeormMigrationMode;
    options: TypeormMigrationSqlCommandOptions;
  }): Promise<boolean> {
    try {
      const selection = options.options.selection ?? "latest";
      const targets = await this.targets(options.options);
      let allInSync = true;

      for (const target of targets) {
        const migrationFiles = await this.migrationFiles({
          directory: target.migrationsDirectory,
          ...this.migrationOption(options.options.migration),
          selection,
        });
        options.logger.info(
          "🧾 Processing migration SQL extraction",
          undefined,
          {
            migrationCount: migrationFiles.length,
            migrationsDirectory: target.migrationsDirectory,
            mode: options.mode,
            projectName: target.projectName,
            selection,
          },
        );

        for (const migrationPath of migrationFiles) {
          const succeeded = await this.synchronizeMigration({
            logger: options.logger,
            migrationSqlPaths: this.migrationSqlPaths(
              target.migrationsDirectory,
              migrationPath,
            ),
            mode: options.mode,
            projectName: target.projectName,
          });
          allInSync = allInSync && succeeded;
        }
      }

      if (allInSync) {
        options.logger.info("🧾 Verified TypeORM migration SQL extraction");
      }
      return allInSync;
    } catch (error) {
      options.logger.error(
        "💥 Failed synchronizing extracted TypeORM migration SQL",
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
  /** Every configured migration target in the workspace or one explicit target. */
  async targets(
    options: TypeormMigrationSqlCommandOptions,
  ): Promise<TypeormMigrationProjectTarget[]> {
    const explicit = this.explicitTarget(options);
    if (explicit !== undefined) return [explicit];

    const projectJsonPaths = await this.projectJsonPaths();
    const parsedTargets = await Promise.all(
      projectJsonPaths.map(async (projectJsonPath) =>
        this.parsedProjectTarget(projectJsonPath, options.project),
      ),
    );
    const filteredTargets = parsedTargets.filter(
      (target): target is TypeormMigrationParsedProjectTarget =>
        target !== undefined,
    );

    if (options.project !== undefined && filteredTargets.length === 0) {
      throw new Error(
        `No project named "${options.project}" has a migration target.`,
      );
    }

    return filteredTargets.map((target) => ({
      migrationsDirectory: path.join(target.projectRoot, MIGRATIONS_FOLDER),
      projectName: target.projectName,
    }));
  }
}
