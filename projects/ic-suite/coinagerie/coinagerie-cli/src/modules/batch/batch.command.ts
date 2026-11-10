import path from "node:path";

import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { CheckService } from "../check/check.service";

import { BATCH_ARGUMENTS } from "./batch.constants";

import type { BatchCommandOptions, BatchVerdict } from "./batch.types";

/**
 * The `batch` command: judge, or rewrite, the glossaries of many projects in
 * one process, which avoids paying process startup for each project.
 *
 * Each directory is a project root with its own configuration. Standard output
 * carries one JSON array of verdicts, in the order given; the exit code is 1
 * when any failed.
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
    const verdicts: BatchVerdict[] = [];

    for (const directory of directories) {
      const verdict = await this.checkService.run({
        directory: path.resolve(directory),
        mode: options.write === true ? "write" : "check",
        workspaceRoot: process.cwd(),
      });

      verdicts.push({ directory, ...verdict });
    }

    process.stdout.write(`${JSON.stringify(verdicts)}\n`);
    process.exitCode = verdicts.every(({ ok }) => ok) ? 0 : 1;
  }
}
