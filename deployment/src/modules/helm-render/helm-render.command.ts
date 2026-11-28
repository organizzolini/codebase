import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { HelmRenderService } from "./helm-render.service";

import type { HelmRenderOptions } from "./helm-render.types";

/**
 * CLI command that templates every Helm release this repository ships into
 * one file each, for the `deployment` project's `helm-render` target.
 *
 * Exits 0 when every release rendered and 1 otherwise.
 */
@Command({
  description: "Render every Helm release this repository ships",
  name: "helm-render",
})
@Injectable()
export class HelmRenderCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly helmRenderService: HelmRenderService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(HelmRenderCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Parses `--directory`, the folder the rendered releases are written into. */
  @Option({
    description: "Folder to write each rendered release into",
    flags: "-d, --directory <directory>",
    required: true,
  })
  public parseDirectory(value: string): string {
    return value;
  }

  /** Renders the releases, and exits with the outcome. */
  public async run(
    _passedParameters: string[],
    options: HelmRenderOptions = {},
  ): Promise<void> {
    await Promise.resolve();

    try {
      if (options.directory === undefined) {
        throw new Error("--directory is required");
      }

      this.helmRenderService.render(options.directory);
      process.exitCode = 0;
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
