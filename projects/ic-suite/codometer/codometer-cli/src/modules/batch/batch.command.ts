import path from "node:path";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MeasureCommand } from "../measure/measure.command";

import { BATCH_ARGUMENTS } from "./batch.constants";

import type { BatchVerdict } from "./batch.types";
import type { MeasureCommandOptions } from "@codometer/configuration";

/**
 * The `batch` command: measures many directories in one process and prints a JSON verdict for each.
 *
 * It takes the flags `measure` takes for a run: `--config`, read in each directory,
 * and the checks and outputs. It exits 1 when any directory failed.
 */
@Command({
  arguments: BATCH_ARGUMENTS,
  description:
    "Measure every named directory, printing a JSON verdict for each: whether it passed, and what failed it",
  name: "batch",
})
@Injectable()
export class BatchCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly measureCommand: MeasureCommand,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(BatchCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads `--check`, the set of checks that fail a directory. */
  @Option({
    description: `Fail on a comma-separated set drawn from "reports" and "limits"`,
    flags: "--check [check]",
  })
  public parseCheck(value: string): string {
    return value;
  }

  /** Reads `--config`, the configuration each directory reads, relative to it. */
  @Option({
    description:
      "Path to the codometer configuration file in each directory (required)",
    flags: "--config <path>",
  })
  public parseConfig(value: string): string {
    return value;
  }

  /** Reads `--only-inputs`, the inputs to measure. */
  @Option({
    description:
      "Names of the only configured inputs to measure; the others, and the limits written against them, are left out",
    flags: "--only-inputs [names...]",
  })
  public parseOnlyInputs(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Reads `--output-json`, where each directory writes its report. */
  @Option({
    description:
      "Write each directory's JSON report, at the given path or the configured one",
    flags: "--output-json [outputJson]",
  })
  public parseOutputJson(value: string | true): string | true {
    return value;
  }

  /** Reads `--output-markdown`, where each directory writes its badge block. */
  @Option({
    description:
      "Write each directory's markdown badge block, at the given path or the configured one",
    flags: "--output-markdown [outputMarkdown]",
  })
  public parseOutputMarkdown(value: string | true): string | true {
    return value;
  }

  /** Measures each named directory, then prints every verdict. */
  async run(
    directories: string[],
    options: MeasureCommandOptions = {},
  ): Promise<void> {
    const verdicts: BatchVerdict[] = [];

    for (const directory of directories.map((named) => path.resolve(named))) {
      const outcome = await this.measureCommand
        .measureDirectory(
          options.config === undefined
            ? options
            : { ...options, config: path.resolve(directory, options.config) },
          directory,
        )
        .catch((error: unknown) => ({
          failed: true,
          report: error instanceof Error ? error.message : String(error),
        }));

      verdicts.push({
        directory,
        ok: !outcome.failed,
        report: outcome.report,
      });
    }

    process.stdout.write(`${JSON.stringify(verdicts)}\n`);
    process.exitCode = verdicts.every(({ ok }) => ok) ? 0 : 1;
  }
}
