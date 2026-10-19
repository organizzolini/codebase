import { randomUUID } from "node:crypto";
import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { PostgresClientError } from "../postgres-client/postgres-client.constants";
import { PostgresClientService } from "../postgres-client/postgres-client.service";
import {
  describePostgresContent,
  maskPostgresCredentials,
  parsePostgresUri,
  qualifyTableNames,
} from "../postgres-client/postgres-client.utilities";
import { missingDumpTables } from "../postgres-client/postgres-dump.utilities";
import { SqliteExportTablesError } from "../sqlite-export/sqlite-export.constants";
import { SqliteExportService } from "../sqlite-export/sqlite-export.service";

import {
  dryRunMessages,
  existingFileMessage,
  EXPORT_OPTION_MESSAGES,
  ExportOptionsError,
  ExportTableError,
  missingTablesMessage,
} from "./export.constants";

import type { PostgresContent } from "../postgres-client/postgres-client.types";
import type { ExportCommandOptions, ExportPlan } from "./export.types";

/**
 * Dumps selected tables from the database a URI names into one
 * custom-format file, through `pg_dump`, or with `--sqlite` into a SQLite
 * file, through `SqliteExportService`. Every option is validated before
 * the export starts, and the password reaches `pg_dump` only through its
 * environment.
 */
@Command({
  description:
    "Export selected tables from a database to a custom-format dump file",
  name: "export",
})
@Injectable()
export class ExportCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly postgresClient: PostgresClientService,
    private readonly sqliteExport: SqliteExportService,
  ) {
    super();
    this.logger.setContext(ExportCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * `error`, or an `ExportTableError` naming the tables when it is
   * `pg_dump` or the SQLite export reporting that `--table` matched
   * nothing in `source`.
   */
  private explain(error: unknown, source: string): unknown {
    if (error instanceof SqliteExportTablesError) {
      return new ExportTableError(missingTablesMessage(error.tables, source));
    }
    if (!(error instanceof PostgresClientError)) return error;
    const missing = missingDumpTables(error.detail);
    return missing.length === 0
      ? error
      : new ExportTableError(missingTablesMessage(missing, source));
  }

  /**
   * Logs what the export would do, the `--dry-run` plan: the source, the
   * tables, what is exported of them, and what happens to the file.
   */
  private logDryRun(plan: ExportPlan): void {
    for (const line of dryRunMessages(plan, fs.existsSync(plan.file))) {
      this.logger.log(line);
    }
  }

  /**
   * Validates every option and resolves the tables, so nothing runs
   * against a half-specified command line.
   *
   * @throws ExportOptionsError naming the first option to fix, or
   * PostgresUriError when `--source-uri` cannot be used, or
   * PostgresTableNameError when a `--table` names no schema and no
   * `--schema` was given.
   */
  private plan(options: ExportCommandOptions): ExportPlan {
    const sourceUri = this.requireOption(
      options.sourceUri,
      EXPORT_OPTION_MESSAGES.sourceUri,
    );
    const tables = this.requireOption(
      options.table,
      EXPORT_OPTION_MESSAGES.table,
    );
    const content = this.selectContent(options);
    const file = this.requireOption(options.file, EXPORT_OPTION_MESSAGES.file);

    const connection = parsePostgresUri(sourceUri, "--source-uri");

    if (options.overwrite !== true && fs.existsSync(file)) {
      throw new ExportOptionsError(existingFileMessage(file));
    }

    return {
      connection,
      content,
      file,
      source: maskPostgresCredentials(sourceUri, connection.password),
      sqlite: options.sqlite === true,
      // One table named twice, once resolved in --schema, is dumped once.
      tables: [...new Set(qualifyTableNames(tables, options.schema))],
    };
  }

  /**
   * `value`, or an `ExportOptionsError` with `message` when the option was
   * not given. A repeatable option given no times arrives as `undefined`.
   *
   * @throws ExportOptionsError when `value` is `undefined`.
   */
  private requireOption<Value>(
    value: undefined | Value,
    message: string,
  ): Value {
    if (value === undefined) throw new ExportOptionsError(message);
    return value;
  }

  /**
   * The content `--data` and `--ddl` select; at least one is required.
   *
   * @throws ExportOptionsError when neither was given.
   */
  private selectContent({ data, ddl }: ExportCommandOptions): PostgresContent {
    const content = { data: data === true, ddl: ddl === true };
    if (!content.data && !content.ddl) {
      throw new ExportOptionsError(EXPORT_OPTION_MESSAGES.content);
    }
    return content;
  }

  // 🌎 Public Methods

  /** Parses the boolean `--data` flag. */
  @Option({
    description: "Export the tables' rows; combine with --ddl for both",
    flags: "--data",
  })
  parseData(): boolean {
    return true;
  }

  /** Parses the boolean `--ddl` flag. */
  @Option({
    description:
      "Export the tables' definitions (DDL); combine with --data for both",
    flags: "--ddl",
  })
  parseDdl(): boolean {
    return true;
  }

  /** Parses the boolean `--dry-run` flag. */
  @Option({
    description:
      "Check the options, print what would be exported, and connect to no database and write no file",
    flags: "--dry-run",
  })
  parseDryRun(): boolean {
    return true;
  }

  /** Parses `--file`, the dump file to write. */
  @Option({
    description: "Path of the custom-format dump file to write",
    flags: "--file <path>",
  })
  parseFile(value: string): string {
    return value;
  }

  /** Parses the boolean `--overwrite` flag. */
  @Option({
    description: "Replace --file when it already exists",
    flags: "--overwrite",
  })
  parseOverwrite(): boolean {
    return true;
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

  /** Parses `--source-uri`, the database to export from. */
  @Option({
    description:
      "Connection URI of the database to export from, e.g. postgresql://user:password@host:5432/database",
    flags: "--source-uri <uri>",
  })
  parseSourceUri(value: string): string {
    return value;
  }

  /** Parses the boolean `--sqlite` flag. */
  @Option({
    description:
      "Write a SQLite file instead of a custom-format dump, through the Postgres driver, needing no Postgres client tools",
    flags: "--sqlite",
  })
  parseSqlite(): boolean {
    return true;
  }

  /** Collects each repeated `--table` into one list. */
  @Option({
    description: "Table to export; repeat for several",
    flags: "--table <name>",
  })
  parseTable(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /**
   * Validates the options, then dumps the selected tables to the file. An
   * existing file is refused without `--overwrite`, before any process
   * starts; a dump that fails leaves --file exactly as it was. `--dry-run`
   * stops once `pg_dump` is checked, printing the plan instead of dumping.
   * `--sqlite` checks and starts no Postgres client tool.
   */
  async run(
    _passedParameters: string[],
    options: ExportCommandOptions,
  ): Promise<void> {
    const plan = this.plan(options);
    if (!plan.sqlite) await this.postgresClient.ensureTool("pg_dump");
    if (options.dryRun === true) {
      this.logDryRun(plan);
      return;
    }
    const content = describePostgresContent(plan.content);
    this.logger.log(
      `📦 Exporting ${content} of ${plan.tables.join(", ")} from ${plan.source} to ${plan.file}`,
    );

    // pg_dump truncates its output before it resolves tables, so it writes
    // beside --file and the result replaces it only once the dump succeeded.
    const partial = `${plan.file}.${randomUUID()}.partial`;
    try {
      await (plan.sqlite
        ? this.sqliteExport.export({ ...plan, file: partial })
        : this.postgresClient.dump({ ...plan, file: partial }));
      fs.renameSync(partial, plan.file);
    } catch (error) {
      fs.rmSync(partial, { force: true });
      throw this.explain(error, plan.source);
    }

    const count = plan.tables.length;
    this.logger.log(
      `✅ Exported ${String(count)} ${count === 1 ? "table" : "tables"} (${content}) to ${plan.file}`,
    );
  }
}
