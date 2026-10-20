import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { SynchronizationService } from "../synchronization/synchronization.service";

import { TypeormMigrationSqlExtractorService } from "./typeorm-migration-sql-extractor.service";

import type {
  SynchronizableCommand,
  SynchronizationMode,
} from "../synchronization/synchronization.types";
import type {
  TypeormMigrationSelection,
  TypeormMigrationSqlCommandOptions,
} from "./typeorm-migration-sql.types";

/**
 * Synchronizes extracted SQL files from TypeORM migrations.
 */
@Command({
  aliases: ["extract-typeorm-migration-sql"],
  description: "Run the typeorm-migration-sql command",
  name: "typeorm-migration-sql",
})
@Injectable()
export class TypeormMigrationSqlCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly synchronizationModeService: SynchronizationService,
    private readonly extractorService: TypeormMigrationSqlExtractorService,
  ) {
    super();
    this.logger.setContext(TypeormMigrationSqlCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly synchronizationLabel = "typeorm-migration-sql";

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Parses `--directory`, the migrations directory to process. */
  @Option({
    description:
      "Migrations directory to process, e.g. projects/lexico/lexico-entities/src/modules/database/migrations",
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

  /** Parses `--module`, a project's migration module path. */
  @Option({
    description:
      "Migration module path relative to --project-root, e.g. src/modules/database",
    flags: "--module <path>",
  })
  parseModule(value: string): string {
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
      "Project root used with --module to resolve migrations as <project-root>/<module>/migrations",
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
    const mode =
      this.synchronizationModeService.resolveSynchronizationModeOrExit({
        invalidModeLabel: "Invalid mode",
        loggerService: this.logger,
        passedParameters,
        usageMessage:
          "💡 Usage: nx run synchronization:typeorm-migration-sql:check (or synchronization:typeorm-migration-sql:write)",
      });

    if (!(await this.synchronize(mode, options))) {
      process.exit(1);
    }
  }

  /** Synchronizes extracted migration SQL and reports success without exiting. */
  async synchronize(
    mode: SynchronizationMode,
    options: TypeormMigrationSqlCommandOptions = {},
  ): Promise<boolean> {
    return this.extractorService.synchronize({
      logger: this.logger,
      mode,
      options,
    });
  }
}
