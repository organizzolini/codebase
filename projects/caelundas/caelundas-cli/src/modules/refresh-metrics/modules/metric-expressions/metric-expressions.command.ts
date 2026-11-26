import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MetricExpressionsOptionError } from "./metric-expressions.constants";
import { MetricExpressionsService } from "./metric-expressions.service";

import type { MetricExpressionsCommandOptions } from "./metric-expressions.types";

/**
 * Draws the metrics' expression trees from the database: a Mermaid flowchart
 * per metric and a table of the expressions in infix form, in the marker block
 * of a Markdown file. With `--check` it writes nothing and fails when the file
 * differs.
 */
@Command({
  description:
    "Draw each metric's expression tree as a Mermaid flowchart in a Markdown file",
  name: "metric-expressions",
})
@Injectable()
export class MetricExpressionsCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly metricExpressionsService: MetricExpressionsService,
  ) {
    super();
    this.logger.setContext(MetricExpressionsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Parses the boolean `--check` flag. */
  @Option({
    description: "Fail when the Markdown differs from the database",
    flags: "--check",
  })
  parseCheck(): boolean {
    return true;
  }

  /** Parses `--output-markdown`, the path of the Markdown file. */
  @Option({
    description: "Path of the Markdown file whose marker block is written",
    flags: "--output-markdown <path>",
  })
  parseOutputMarkdown(value: string): string {
    return value;
  }

  /**
   * Writes or checks the marker block of the Markdown file.
   * @throws MetricExpressionsOptionError when `--output-markdown` is missing.
   */
  async run(
    _passedParameters: string[],
    options: MetricExpressionsCommandOptions,
  ): Promise<void> {
    if (options.outputMarkdown === undefined) {
      throw new MetricExpressionsOptionError(
        "--output-markdown is required: the path of the Markdown file",
      );
    }
    const check = options.check === true;

    await this.metricExpressionsService.sync({
      check,
      outputMarkdown: options.outputMarkdown,
    });
    this.logger.info(
      check
        ? "✅ Checked the metric expressions"
        : "🧮 Wrote the metric expressions",
      undefined,
      { outputMarkdown: options.outputMarkdown },
    );
  }
}
