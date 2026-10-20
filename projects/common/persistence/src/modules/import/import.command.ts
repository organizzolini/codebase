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
  IMPORT_OPTION_MESSAGES,
  ImportCleanError,
  ImportContentsError,
  ImportOptionsError,
  ImportRestoreError,
  missingContentsMessage,
  missingFileMessage,
  notTruncatedMessage,
  referencedTablesMessage,
  rolledBackMessage,
  truncatedMessage,
} from "./import.constants";

import type {
  PostgresContent,
  PostgresDumpEntry,
} from "../postgresql-utilities/postgresql-utilities.types";
import type { ImportCommandOptions, ImportPlan } from "./import.types";

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
  name: "import",
})
@Injectable()
export class ImportCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly postgresClient: PostgresqlUtilitiesService,
  ) {
    super();
    this.logger.setContext(ImportCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Every check a real import and a `--dry-run` share, none of which
   * connects to the target: the options, the pg_restore version, and the
   * dump's table of contents. Resolves the plan and the listed contents.
   */
  private async check(options: ImportCommandOptions): Promise<{
    readonly contents: readonly PostgresDumpEntry[];
    readonly plan: ImportPlan;
  }> {
    const plan = this.plan(options);
    await this.postgresClient.ensureTool("pg_restore");
    const contents = await this.postgresClient.list(plan.file);
    this.ensureContents(plan, contents);
    return { contents, plan };
  }

  /**
   * Checks that the dump holds the rows `--data` and the definitions
   * `--ddl` ask for, for every selected table.
   *
   * @throws ImportContentsError naming each table that lacks them.
   */
  private ensureContents(
    { content, file, tables }: ImportPlan,
    contents: readonly PostgresDumpEntry[],
  ): void {
    const missing = (kind: "data" | "table"): string[] => {
      const dumped = dumpedTables(contents, kind);
      return tables.filter((table) => !dumped.has(table));
    };
    const data = content.data ? missing("data") : [];
    const ddl = content.ddl ? missing("table") : [];

    if (data.length > 0 || ddl.length > 0) {
      throw new ImportContentsError(
        missingContentsMessage(file, { data, ddl }),
      );
    }
  }

  /**
   * Logs what the import would do, the `--dry-run` plan: the target, what
   * the dump holds of each selected table, and what `--clean` would clear.
   */
  private logDryRun(
    plan: ImportPlan,
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
   * Validates every option, resolves the tables, and checks the file
   * exists, so nothing runs against a half-specified command line.
   *
   * @throws ImportOptionsError naming the first option to fix, or
   * PostgresUriError when `--target-uri` cannot be used, or
   * PostgresTableNameError when a `--table` names no schema and no
   * `--schema` was given.
   */
  private plan(options: ImportCommandOptions): ImportPlan {
    const targetUri = this.requireOption(
      options.targetUri,
      IMPORT_OPTION_MESSAGES.targetUri,
    );
    const tables = this.requireOption(
      options.table,
      IMPORT_OPTION_MESSAGES.table,
    );
    const content = this.selectContent(options);
    const file = this.requireOption(options.file, IMPORT_OPTION_MESSAGES.file);

    const connection = parsePostgresUri(targetUri, "--target-uri");

    // A directory-format dump is a directory, which pg_restore reads too.
    if (!fs.existsSync(file)) {
      throw new ImportOptionsError(missingFileMessage(file));
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
   * `value`, or an `ImportOptionsError` with `message` when the option was
   * not given. A repeatable option given no times arrives as `undefined`.
   *
   * @throws ImportOptionsError when `value` is `undefined`.
   */
  private requireOption<Value>(
    value: undefined | Value,
    message: string,
  ): Value {
    if (value === undefined) throw new ImportOptionsError(message);
    return value;
  }

  /**
   * Restores the plan's tables from the listed dump. A client-tool failure
   * says the target was left unchanged, which the single transaction
   * guarantees, unless `truncated`: then the tables may be empty, and the
   * import should be re-run.
   *
   * @throws ImportRestoreError when pg_restore fails.
   */
  private async restore(
    plan: ImportPlan,
    contents: readonly PostgresDumpEntry[],
    truncated: boolean,
  ): Promise<void> {
    try {
      await this.postgresClient.restore({ ...plan, contents });
    } catch (error) {
      if (!(error instanceof PostgresClientError)) throw error;
      throw new ImportRestoreError(
        truncated
          ? truncatedMessage(error.message, plan.target, plan.tables)
          : rolledBackMessage(error.message, plan.target),
      );
    }
  }

  /**
   * The content `--data` and `--ddl` select; at least one is required.
   *
   * @throws ImportOptionsError when neither was given.
   */
  private selectContent({ data, ddl }: ImportCommandOptions): PostgresContent {
    const content = { data: data === true, ddl: ddl === true };
    if (!content.data && !content.ddl) {
      throw new ImportOptionsError(IMPORT_OPTION_MESSAGES.content);
    }
    return content;
  }

  /**
   * Empties the plan's tables before a `--clean --data` restore. With
   * `--ddl`, `pg_restore` drops and recreates them instead, so nothing
   * is truncated. Resolves whether the tables were emptied.
   *
   * @throws ImportCleanError when an unselected table references a
   * selected one, or the truncate fails; nothing was truncated.
   */
  private async truncate({
    clean,
    connection,
    content,
    tables,
    target,
  }: ImportPlan): Promise<boolean> {
    if (!clean || content.ddl) return false;

    try {
      await this.postgresClient.truncate({ connection, tables });
    } catch (error) {
      if (error instanceof PostgresReferencedTablesError) {
        throw new ImportCleanError(
          referencedTablesMessage(error.referencing, target),
        );
      }
      if (error instanceof PostgresTruncateError) {
        throw new ImportCleanError(notTruncatedMessage(error.message, target));
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
    description: "Path of the dump file, as written by export, to restore",
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
   * Validates the options, checks pg_restore and the dump's contents,
   * applies any `--clean`, then restores the selected tables in one
   * transaction. Nothing connects to the target until the dump is known to
   * hold what was asked for; `--dry-run` stops there, printing the plan
   * instead of importing.
   */
  async run(
    _passedParameters: string[],
    options: ImportCommandOptions,
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
