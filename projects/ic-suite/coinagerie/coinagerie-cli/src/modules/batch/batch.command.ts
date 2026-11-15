import path from "node:path";

import { ConfigurationPathRequiredError } from "@coinagerie/configuration";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { CheckService } from "../check/check.service";

import { BATCH_ARGUMENTS } from "./batch.constants";

import type { BatchCommandOptions, BatchVerdict } from "./batch.types";

/**
 * The `batch` command: check or rewrite many projects' glossaries in one
 * process, avoiding startup costs.
 *
 * Each directory is a project root, and `--project-configuration-path` names
 * the configuration inside each, which is never searched for. Standard output
 * is one JSON array of verdicts, in order; the exit code is 1 when any failed.
 */
@Command({
  arguments: BATCH_ARGUMENTS,
  description:
    "Check or write the glossaries of every named project directory, printing a JSON verdict for each",
  name: "batch",
})
@Injectable()
export class BatchCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly checkService: CheckService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(BatchCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads `--project-configuration-path`, each project's required configuration. */
  @Option({
    description:
      "Required. Path to each project's coinagerie configuration, relative to the project directory; never searched for",
    flags: "--project-configuration-path <path>",
  })
  public parseProjectConfigurationPath(value: string): string {
    return value;
  }

  /** Reads `--write`, which rewrites every glossary instead of judging it. */
  @Option({
    description:
      "Rewrite every glossary to hold exactly the code's words, keeping definitions",
    flags: "--write",
  })
  public parseWrite(): boolean {
    return true;
  }

  /** Judges or rewrites each named project, then prints every verdict. */
  async run(
    directories: string[],
    options: BatchCommandOptions = {},
  ): Promise<void> {
    if (options.projectConfigurationPath === undefined) {
      this.logger.error("🪙 Rejected the command line", undefined, {
        reason: new ConfigurationPathRequiredError(
          "--project-configuration-path",
        ).message,
      });
      process.exitCode = 1;
      return;
    }

    const verdicts: BatchVerdict[] = [];

    for (const directory of directories) {
      const verdict = await this.checkService.run({
        directory: path.resolve(directory),
        mode: options.write === true ? "write" : "check",
        projectConfigurationPath: options.projectConfigurationPath,
        workspaceRoot: process.cwd(),
      });

      verdicts.push({ directory, ...verdict });
    }

    process.stdout.write(`${JSON.stringify(verdicts)}\n`);
    process.exitCode = verdicts.every(({ ok }) => ok) ? 0 : 1;
  }
}
