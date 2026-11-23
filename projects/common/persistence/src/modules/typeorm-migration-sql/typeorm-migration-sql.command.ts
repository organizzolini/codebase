import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";

import type {
  TypeormMigrationMode,
  TypeormMigrationSelection,
  TypeormMigrationSqlCommandOptions,
} from "./typeorm-migration-sql.types";

/**
 * Checks or writes the SQL extracted from TypeORM migrations, one `-up.sql` and
 * `-down.sql` pair per migration.
 */
@Command({
  aliases: ["extract-typeorm-migration-sql"],
  description: "Run the typeorm-migration-sql command",
  name: "typeorm-migration-sql",
})
@Injectable()
export class TypeormMigrationSqlCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly extractorService: TypeormMigrationSqlExtractorService,
  ) {
    super();
    this.logger.setContext(TypeormMigrationSqlCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Resolves the `check` or `write` argument, exiting with status 1 on any other value. */
  private resolveMode(passedParameters: string[]): TypeormMigrationMode {
    const [modeValue = "check"] = passedParameters;
    if (modeValue === "check" || modeValue === "write") return modeValue;

    this.logger.error("🚦 Rejected an unusable mode", undefined, {
      mode: modeValue,
      reason: "Invalid mode",
      usage:
        "💡 Usage: nx run persistence:typeorm-migration-sql:check (or persistence:typeorm-migration-sql:write)",
    });
    return process.exit(1);
  }

  // 🌎 Public Methods

  /** Parses `--directory`, the migrations directory to process. */
  @Option({
    description:
      "Migrations directory to process, e.g. projects/lexico/lexico-db/migrations",
    flags: "--directory <path>",
  })
  parseDirectory(value: string): string {
    return value;
  }

  /** Parses `--migration`, one migration file to process. */
  @Option({
    description:
      "One migration file name or path to process instead of --selection",
    flags: "--migration <file>",
  })
  parseMigration(value: string): string {
    return value;
  }

  /** Parses `--project`, the workspace project name to process. */
  @Option({
    description:
      "Workspace project name whose migration target options should be processed",
    flags: "--project <name>",
  })
  parseProject(value: string): string {
    return value;
  }

  /** Parses `--project-root`, used with --module to resolve migrations. */
  @Option({
    description:
      "Project root whose migrations are at <project-root>/migrations",
    flags: "--project-root <path>",
  })
  parseProjectRoot(value: string): string {
    return value;
  }

  /** Parses `--selection`, all migrations or only the latest one. */
  @Option({
    description:
      "Which migrations to process when --migration is not given: latest (default) or all",
    flags: "--selection <latest|all>",
  })
  parseSelection(value: string): TypeormMigrationSelection {
    return value === "all" ? "all" : "latest";
  }

  /** Runs the typeorm-migration-sql sync command in check or write mode. */
  async run(
    passedParameters: string[],
    options: TypeormMigrationSqlCommandOptions = {},
  ): Promise<void> {
    const mode = this.resolveMode(passedParameters);

    if (!(await this.synchronize(mode, options))) {
      process.exit(1);
    }
  }

  /** Checks or writes extracted migration SQL and reports success without exiting. */
  async synchronize(
    mode: TypeormMigrationMode,
    options: TypeormMigrationSqlCommandOptions = {},
  ): Promise<boolean> {
    return this.extractorService.synchronize({
      logger: this.logger,
      mode,
      options,
    });
  }
}
