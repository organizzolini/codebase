import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Command, CommandRunner, Option } from "nest-commander";

import { postgresEnvironmentKey } from "@codebase/database";
import { LoggerService } from "@codebase/logging";

import { PostgresClientError } from "../postgres-client/postgres-client.constants";
import { PostgresClientService } from "../postgres-client/postgres-client.service";
import {
  describePostgresContent,
  maskPostgresCredentials,
  parsePostgresUri,
  qualifyTableName,
} from "../postgres-client/postgres-client.utilities";
import { dumpedTables } from "../postgres-client/postgres-dump.utilities";

import {
  IMPORT_OPTION_MESSAGES,
  ImportContentsError,
  ImportOptionsError,
  ImportRestoreError,
  missingContentsMessage,
  missingFileMessage,
  rolledBackMessage,
} from "./import.constants";

import type {
  PostgresContent,
  PostgresDumpEntry,
} from "../postgres-client/postgres-client.types";
import type { ImportCommandOptions, ImportPlan } from "./import.types";

/**
 * Restores selected tables from a dump file into the database a URI names,
 * through `pg_restore`. Every option is validated and the dump's contents
 * checked before any connection opens; the restore runs as one
 * transaction and never deletes anything, so a conflict leaves the target
 * as it was. The password reaches `pg_restore` only through its
 * environment.
 */
@Command({
  description:
    "Import selected Lexico tables from a dump file into a database, without deleting anything",
  name: "import",
})
@Injectable()
export class ImportCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly configurationService: ConfigService,
    private readonly postgresClient: PostgresClientService,
  ) {
    super();
    this.logger.setContext(ImportCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Checks that the dump holds the rows `--data` and the definitions
   * `--schema` ask for, for every selected table.
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
    const schema = content.schema ? missing("table") : [];

    if (data.length > 0 || schema.length > 0) {
      throw new ImportContentsError(
        missingContentsMessage(file, { data, schema }),
      );
    }
  }

  /**
   * Validates every option, resolves the tables, and checks the file
   * exists, so nothing runs against a half-specified command line.
   *
   * @throws ImportOptionsError naming the first option to fix, or
   * PostgresUriError when `--target-uri` cannot be used.
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
    const schemaName = this.configurationService.getOrThrow<string>(
      postgresEnvironmentKey("lexico", "schema"),
    );

    const connection = parsePostgresUri(targetUri, "--target-uri");

    // A directory-format dump is a directory, which pg_restore reads too.
    if (!fs.existsSync(file)) {
      throw new ImportOptionsError(missingFileMessage(file));
    }

    return {
      connection,
      content,
      file,
      tables: tables.map((table) => qualifyTableName(table, schemaName)),
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
   * guarantees.
   *
   * @throws ImportRestoreError when pg_restore fails.
   */
  private async restore(
    plan: ImportPlan,
    contents: readonly PostgresDumpEntry[],
  ): Promise<void> {
    try {
      await this.postgresClient.restore({ ...plan, contents });
    } catch (error) {
      if (!(error instanceof PostgresClientError)) throw error;
      throw new ImportRestoreError(
        rolledBackMessage(error.message, plan.target),
      );
    }
  }

  /**
   * The content `--data` and `--schema` select; at least one is required.
   *
   * @throws ImportOptionsError when neither was given.
   */
  private selectContent({
    data,
    schema,
  }: ImportCommandOptions): PostgresContent {
    const content = { data: data === true, schema: schema === true };
    if (!content.data && !content.schema) {
      throw new ImportOptionsError(IMPORT_OPTION_MESSAGES.content);
    }
    return content;
  }

  // 🌎 Public Methods

  /** Parses the boolean `--data` flag. */
  @Option({
    description: "Import the tables' rows; combine with --schema for both",
    flags: "--data",
  })
  parseData(): boolean {
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

  /** Parses the boolean `--schema` flag. */
  @Option({
    description:
      "Import the tables' definitions, which must not exist yet; combine with --data for both",
    flags: "--schema",
  })
  parseSchema(): boolean {
    return true;
  }

  /** Collects each repeated `--table` into one list. */
  @Option({
    description:
      "Table to import; repeat for several. Unqualified names resolve in the Lexico schema",
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
   * Validates the options, checks pg_restore and the dump's contents, then
   * restores the selected tables in one transaction. Nothing connects to
   * the target until the dump is known to hold what was asked for.
   */
  async run(
    _passedParameters: string[],
    options: ImportCommandOptions,
  ): Promise<void> {
    const plan = this.plan(options);
    await this.postgresClient.ensureTool("pg_restore");
    const contents = await this.postgresClient.list(plan.file);
    this.ensureContents(plan, contents);

    const content = describePostgresContent(plan.content);
    this.logger.log(
      `📥 Importing ${content} of ${plan.tables.join(", ")} from ${plan.file} into ${plan.target}`,
    );
    await this.restore(plan, contents);

    const count = plan.tables.length;
    this.logger.log(
      `✅ Imported ${String(count)} ${count === 1 ? "table" : "tables"} (${content}) from ${plan.file} into ${plan.target}`,
    );
  }
}
