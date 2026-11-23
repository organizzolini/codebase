import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  POSTGRESQL_ERD_OPTION_MESSAGES,
  PostgresqlErdCheckError,
  PostgresqlErdOptionsError,
} from "./postgresql-erd.constants";
import {
  readPostgresqlErdModel,
  splicePostgresqlErdMarkdown,
} from "./postgresql-erd.utilities";

import type {
  PostgresqlErdCommandOptions,
  PostgresqlErdCommandPlan,
  PostgresqlErdOutputFile,
} from "./postgresql-erd.types";

/** Generates JSON and Mermaid ERD files from TypeORM entity files. */
@Command({
  description: "Generate an entity relationship diagram from entity files",
  name: "postgresql-erd",
})
@Injectable()
export class PostgresqlErdCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(PostgresqlErdCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists the configured outputs for success messages. */
  private outputPaths(plan: PostgresqlErdCommandPlan): string {
    return [plan.outputJson, plan.outputMarkdown]
      .filter((file): file is string => file !== undefined)
      .join(", ");
  }

  /** Validates every option before reading entities or output files. */
  private plan(options: PostgresqlErdCommandOptions): PostgresqlErdCommandPlan {
    const entities = options.entities;
    if (entities === undefined || entities.length === 0) {
      throw new PostgresqlErdOptionsError(
        POSTGRESQL_ERD_OPTION_MESSAGES.entities,
      );
    }

    if (
      options.outputJson === undefined &&
      options.outputMarkdown === undefined
    ) {
      throw new PostgresqlErdOptionsError(
        POSTGRESQL_ERD_OPTION_MESSAGES.output,
      );
    }

    return {
      check: options.check === true,
      entities,
      ...(options.outputJson === undefined
        ? {}
        : { outputJson: options.outputJson }),
      ...(options.outputMarkdown === undefined
        ? {}
        : { outputMarkdown: options.outputMarkdown }),
    };
  }

  /** Returns every missing or stale output path. */
  private staleFiles(files: PostgresqlErdOutputFile[]): string[] {
    return files
      .filter(
        ({ contents, path }) =>
          !fs.existsSync(path) || fs.readFileSync(path, "utf8") !== contents,
      )
      .map(({ path }) => path);
  }

  /** Writes output files after all contents have been prepared. */
  private writeFiles(files: PostgresqlErdOutputFile[]): void {
    for (const { contents, path } of files) {
      fs.writeFileSync(path, contents);
    }
  }

  // 🌎 Public Methods

  /** Parses the boolean `--check` flag. */
  @Option({
    description: "Fail when an output differs from the generated content",
    flags: "--check",
  })
  parseCheck(): boolean {
    return true;
  }

  /** Collects each repeated `--entities` glob into one list. */
  @Option({
    description: "Glob for TypeORM entity files; repeat for several",
    flags: "--entities <glob>",
  })
  parseEntities(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--output-json`, the path to the model JSON file. */
  @Option({
    description: "Path of the JSON entity model to write or check",
    flags: "--output-json <path>",
  })
  parseOutputJson(value: string): string {
    return value;
  }

  /** Parses `--output-markdown`, the path to the Markdown file. */
  @Option({
    description: "Path of the Markdown file to update or check",
    flags: "--output-markdown <path>",
  })
  parseOutputMarkdown(value: string): string {
    return value;
  }

  /**
   * Generates selected outputs, or checks them without writing.
   * @throws When options are invalid or checked outputs are stale.
   */
  async run(
    _passedParameters: string[],
    options: PostgresqlErdCommandOptions,
  ): Promise<void> {
    const plan = this.plan(options);
    const model = await readPostgresqlErdModel(plan.entities);
    const files: PostgresqlErdOutputFile[] = [];

    if (plan.outputJson !== undefined) {
      files.push({
        contents: `${JSON.stringify(model, null, 2)}\n`,
        path: plan.outputJson,
      });
    }

    if (plan.outputMarkdown !== undefined) {
      const current = fs.existsSync(plan.outputMarkdown)
        ? fs.readFileSync(plan.outputMarkdown, "utf8")
        : undefined;
      files.push({
        contents: splicePostgresqlErdMarkdown(current, model),
        path: plan.outputMarkdown,
      });
    }

    if (plan.check) {
      const staleFiles = this.staleFiles(files);
      if (staleFiles.length > 0) {
        throw new PostgresqlErdCheckError(
          `--check found stale output files: ${staleFiles.join(", ")}`,
        );
      }
      this.logger.log(`✅ Checked ${this.outputPaths(plan)}`);
      return;
    }

    this.writeFiles(files);
    this.logger.log(`✅ Generated ${this.outputPaths(plan)}`);
  }
}
