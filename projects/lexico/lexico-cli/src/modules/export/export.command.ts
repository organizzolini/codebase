import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Command, CommandRunner, Option } from "nest-commander";

import { postgresEnvironmentKey } from "@codebase/database";
import { LoggerService } from "@codebase/logging";

import { PostgresClientService } from "../postgres-client/postgres-client.service";
import {
  maskPostgresCredentials,
  parsePostgresUri,
  qualifyTableName,
} from "../postgres-client/postgres-client.utilities";

import { EXPORT_OPTION_MESSAGES, ExportOptionsError } from "./export.constants";

import type { PostgresContent } from "../postgres-client/postgres-client.types";
import type { ExportCommandOptions, ExportPlan } from "./export.types";

/**
 * Dumps selected tables from the database a URI names into one
 * custom-format file, through `pg_dump`. Every option is validated before
 * the dump starts, and the password reaches `pg_dump` only through its
 * environment.
 */
@Command({
  description:
    "Export selected Lexico tables from a database to a custom-format dump file",
  name: "export",
})
@Injectable()
export class ExportCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly configurationService: ConfigService,
    private readonly postgresClient: PostgresClientService,
  ) {
    super();
    this.logger.setContext(ExportCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Names `content` for a log line: `data`, `schema`, or both. */
  private describeContent({ data, schema }: PostgresContent): string {
    if (data && schema) return "data and schema";
    return data ? "data" : "schema";
  }

  /**
   * Validates every option and resolves the tables, so nothing runs
   * against a half-specified command line.
   *
   * @throws ExportOptionsError naming the first option to fix, or
   * PostgresUriError when `--source-uri` cannot be used.
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
    const schemaName = this.configurationService.getOrThrow<string>(
      postgresEnvironmentKey("lexico", "schema"),
    );

    const connection = parsePostgresUri(sourceUri, "--source-uri");

    return {
      connection,
      content,
      file,
      source: maskPostgresCredentials(sourceUri, connection.password),
      tables: tables.map((table) => qualifyTableName(table, schemaName)),
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
   * The content `--data` and `--schema` select; at least one is required.
   *
   * @throws ExportOptionsError when neither was given.
   */
  private selectContent({
    data,
    schema,
  }: ExportCommandOptions): PostgresContent {
    const content = { data: data === true, schema: schema === true };
    if (!content.data && !content.schema) {
      throw new ExportOptionsError(EXPORT_OPTION_MESSAGES.content);
    }
    return content;
  }

  // 🌎 Public Methods

  /** Parses the boolean `--data` flag. */
  @Option({
    description: "Export the tables' rows; combine with --schema for both",
    flags: "--data",
  })
  parseData(): boolean {
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

  /** Parses the boolean `--schema` flag. */
  @Option({
    description: "Export the tables' definitions; combine with --data for both",
    flags: "--schema",
  })
  parseSchema(): boolean {
    return true;
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

  /** Collects each repeated `--table` into one list. */
  @Option({
    description:
      "Table to export; repeat for several. Unqualified names resolve in the Lexico schema",
    flags: "--table <name>",
  })
  parseTable(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Validates the options, then dumps the selected tables to the file. */
  async run(
    _passedParameters: string[],
    options: ExportCommandOptions,
  ): Promise<void> {
    const plan = this.plan(options);
    await this.postgresClient.ensureTool("pg_dump");
    const content = this.describeContent(plan.content);
    this.logger.log(
      `📦 Exporting ${content} of ${plan.tables.join(", ")} from ${plan.source} to ${plan.file}`,
    );

    await this.postgresClient.dump(plan);

    const count = plan.tables.length;
    this.logger.log(
      `✅ Exported ${String(count)} ${count === 1 ? "table" : "tables"} (${content}) to ${plan.file}`,
    );
  }
}
