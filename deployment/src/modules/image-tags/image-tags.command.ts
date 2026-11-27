import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { ImageTagsService } from "./image-tags.service";

/**
 * Writes the release version as the image tag in the Helm values, after
 * semantic-release's `prepareCmd` pushed the images.
 *
 * Takes the release version. `DRY_RUN=1` writes nothing. Exits 1 on any
 * failure.
 */
@Command({
  arguments: "<version>",
  description:
    "Write the release version as the image tag in the Helm values files",
  name: "image-tags",
})
@Injectable()
export class ImageTagsCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly imageTagsService: ImageTagsService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ImageTagsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Writes the tags, and exits with the outcome. */
  public async run(passedParameters: string[]): Promise<void> {
    const [version = ""] = passedParameters;

    await Promise.resolve();

    try {
      this.imageTagsService.run(version);
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
