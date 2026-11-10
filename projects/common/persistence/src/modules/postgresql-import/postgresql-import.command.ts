import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { dumpedTables } from "../postgresql-utilities/postgresql-dump.utilities";
import {
  PostgresClientError,
  PostgresReferencedTablesError,
  PostgresTruncateError,
} from "../postgresql-utilities/postgresql-utilities.constants";
import { PostgresqlUtilitiesService } from "../postgresql-utilities/postgresql-utilities.service";
import {
  describePostgresContent,
  maskPostgresCredentials,
  parsePostgresUri,
  qualifyTableNames,
} from "../postgresql-utilities/postgresql-utilities.utilities";

import {
  dryRunMessages,
  missingContentsMessage,
  missingFileMessage,
  notTruncatedMessage,
  POSTGRESQL_IMPORT_OPTION_MESSAGES,
  PostgresqlImportCleanError,
  PostgresqlImportContentsError,
  PostgresqlImportOptionsError,
  PostgresqlImportRestoreError,
  referencedTablesMessage,
  rolledBackMessage,
  truncatedMessage,
} from "./postgresql-import.constants";

import type {
  PostgresContent,
  PostgresDumpEntry,
} from "../postgresql-utilities/postgresql-utilities.types";
import type {
  PostgresqlImportCommandOptions,
  PostgresqlImportPlan,
} from "./postgresql-import.types";

/**
 * Restores selected tables from a dump file into the database a URI names,
 * through `pg_restore`. Every option is validated and the dump's contents
 * checked before any connection opens; the restore runs as one
 * transaction and deletes nothing unless `--clean` was given, so a
 * conflict leaves the target as it was. The password reaches `pg_restore`
 * only through its environment.
 */
@Command({
  description:
    "Import selected tables from a dump file into a database, deleting nothing unless --clean is given",
  name: "postgresql-import",
})
@Injectable()
export class PostgresqlImportCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly postgresClient: PostgresqlUtilitiesService,
  ) {
    super();
    this.logger.setContext(PostgresqlImportCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs the checks that a real import and `--dry-run` share, none connecting
   * to the target.
   */
  private async check(options: PostgresqlImportCommandOptions): Promise<{
    readonly contents: readonly PostgresDumpEntry[];
    readonly plan: PostgresqlImportPlan;
  }> {
    const plan = this.plan(options);
    await this.postgresClient.ensureTool("pg_restore");
    const contents = await this.postgresClient.list(plan.file);
    this.ensureContents(plan, contents);
    return { contents, plan };
  }

  /**
   * Checks the dump holds the rows and definitions asked for, per selected table.
   * @throws PostgresqlImportContentsError naming each table lacking them.
   */
  private ensureContents(
    { content, file, tables }: PostgresqlImportPlan,
    contents: readonly PostgresDumpEntry[],
  ): void {
    const missing = (kind: "data" | "table"): string[] => {
      const dumped = dumpedTables(contents, kind);
      return tables.filter((table) => !dumped.has(table));
    };
    const data = content.data ? missing("data") : [];
    const ddl = content.ddl ? missing("table") : [];

    if (data.length > 0 || ddl.length > 0) {
      throw new PostgresqlImportContentsError(
        missingContentsMessage(file, { data, ddl }),
      );
    }
  }

  /**
   * Logs what the import would do, the `--dry-run` plan: the target, what
   * the dump holds of each selected table, and what `--clean` would clear.
   */
  private logDryRun(
    plan: PostgresqlImportPlan,
    contents: readonly PostgresDumpEntry[],
  ): void {
    const data = dumpedTables(contents, "data");
    const ddl = dumpedTables(contents, "table");
    const held = new Map(
      plan.tables.map((table) => [
        table,
        { data: data.has(table), ddl: ddl.has(table) },
      ]),
    );
    for (const line of dryRunMessages(plan, held)) this.logger.log(line);
  }

  /**
   * Validates every option, resolves the tables, and checks the file exists
   * before anything runs. @throws The first option that cannot be used.
   */
  private plan(options: PostgresqlImportCommandOptions): PostgresqlImportPlan {
    const targetUri = this.requireOption(
      options.targetUri,
      POSTGRESQL_IMPORT_OPTION_MESSAGES.targetUri,
    );
    const tables = this.requireOption(
      options.table,
      POSTGRESQL_IMPORT_OPTION_MESSAGES.table,
    );
    const content = this.selectContent(options);
    const file = this.requireOption(
      options.file,
      POSTGRESQL_IMPORT_OPTION_MESSAGES.file,
    );

    const connection = parsePostgresUri(targetUri, "--target-uri");

    // A directory-format dump is a directory, which pg_restore reads too.
    if (!fs.existsSync(file)) {
      throw new PostgresqlImportOptionsError(missingFileMessage(file));
    }

    return {
      clean: options.clean === true,
      connection,
      content,
      file,
      // One table named twice, once resolved in --schema, is restored once.
      tables: [...new Set(qualifyTableNames(tables, options.schema))],
      target: maskPostgresCredentials(targetUri, connection.password),
    };
  }

  /**
   * Returns `value`, or throws when the option was not given. A repeatable
   * option given no times arrives as `undefined`.
   */
  private requireOption<Value>(
    value: undefined | Value,
    message: string,
  ): Value {
    if (value === undefined) throw new PostgresqlImportOptionsError(message);
    return value;
  }

  /**
   * Restores the plan's tables. A failure leaves the target unchanged, or, once
   * `truncated`, the tables empty.
   * @throws PostgresqlImportRestoreError when pg_restore fails.
   */
  private async restore(
    plan: PostgresqlImportPlan,
    contents: readonly PostgresDumpEntry[],
    truncated: boolean,
  ): Promise<void> {
    try {
      await this.postgresClient.restore({ ...plan, contents });
    } catch (error) {
      if (!(error instanceof PostgresClientError)) throw error;
      throw new PostgresqlImportRestoreError(
        truncated
          ? truncatedMessage(error.message, plan.target, plan.tables)
          : rolledBackMessage(error.message, plan.target),
      );
    }
  }

  /**
   * The content `--data` and `--ddl` select; at least one is required.
   *
   * @throws PostgresqlImportOptionsError when neither was given.
   */
  private selectContent({
    data,
    ddl,
  }: PostgresqlImportCommandOptions): PostgresContent {
    const content = { data: data === true, ddl: ddl === true };
    if (!content.data && !content.ddl) {
      throw new PostgresqlImportOptionsError(
        POSTGRESQL_IMPORT_OPTION_MESSAGES.content,
      );
    }
    return content;
  }

  /**
   * Empties the plan's tables before a `--clean --data` restore, unless `--ddl`
   * drops and recreates them. Resolves whether emptied.
   * @throws PostgresqlImportCleanError, with nothing truncated.
   */
  private async truncate({
    clean,
    connection,
    content,
    tables,
    target,
  }: PostgresqlImportPlan): Promise<boolean> {
    if (!clean || content.ddl) return false;

    try {
      await this.postgresClient.truncate({ connection, tables });
    } catch (error) {
      if (error instanceof PostgresReferencedTablesError) {
        throw new PostgresqlImportCleanError(
          referencedTablesMessage(error.referencing, target),
        );
      }
      if (error instanceof PostgresTruncateError) {
        throw new PostgresqlImportCleanError(
          notTruncatedMessage(error.message, target),
        );
      }
      throw error;
    }
    return true;
  }

  // 🌎 Public Methods

  /** Parses the boolean `--clean` flag. */
  @Option({
    description:
      "Before importing, empty the selected tables (--data) or drop and recreate them (--ddl); --dry-run shows what it would clear",
    flags: "--clean",
  })
  parseClean(): boolean {
    return true;
  }

  /** Parses the boolean `--data` flag. */
  @Option({
    description: "Import the tables' rows; combine with --ddl for both",
    flags: "--data",
  })
  parseData(): boolean {
    return true;
  }

  /** Parses the boolean `--ddl` flag. */
  @Option({
    description:
      "Import the tables' definitions (DDL), which must not exist yet; combine with --data for both",
    flags: "--ddl",
  })
  parseDdl(): boolean {
    return true;
  }

  /** Parses the boolean `--dry-run` flag. */
  @Option({
    description:
      "Check the options and the dump, print what would be imported, and connect to nothing",
    flags: "--dry-run",
  })
  parseDryRun(): boolean {
    return true;
  }

  /** Parses `--file`, the dump to restore. */
  @Option({
    description:
      "Path of the dump file, as written by postgresql-export, to restore",
    flags: "--file <path>",
  })
  parseFile(value: string): string {
    return value;
  }

  /** Parses `--schema`, the schema unqualified `--table` names resolve in. */
  @Option({
    description:
      "Schema that unqualified --table names resolve in; without it, name every table as schema.table",
    flags: "--schema <name>",
  })
  parseSchema(value: string): string {
    return value;
  }

  /** Collects each repeated `--table` into one list. */
  @Option({
    description: "Table to import; repeat for several",
    flags: "--table <name>",
  })
  parseTable(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--target-uri`, the database to import into. */
  @Option({
    description:
      "Connection URI of the database to import into, e.g. postgresql://user:password@host:5432/database",
    flags: "--target-uri <uri>",
  })
  parseTargetUri(value: string): string {
    return value;
  }

  /**
   * Checks the dump, applies any `--clean`, then restores the tables in one
   * transaction. `--dry-run` stops before any import.
   */
  async run(
    _passedParameters: string[],
    options: PostgresqlImportCommandOptions,
  ): Promise<void> {
    const { contents, plan } = await this.check(options);
    if (options.dryRun === true) {
      this.logDryRun(plan, contents);
      return;
    }

    const content = describePostgresContent(plan.content);
    this.logger.log(
      `📥 Importing ${content} of ${plan.tables.join(", ")} from ${plan.file} into ${plan.target}`,
    );
    const truncated = await this.truncate(plan);
    await this.restore(plan, contents, truncated);

    const count = plan.tables.length;
    this.logger.log(
      `✅ Imported ${String(count)} ${count === 1 ? "table" : "tables"} (${content}) from ${plan.file} into ${plan.target}`,
    );
  }
}
