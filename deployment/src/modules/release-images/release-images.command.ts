import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { describeError } from "../process-runner/process-runner.utilities";

import { ReleaseImagesService } from "./release-images.service";

/**
 * CLI command that builds and pushes the changed Caelundas images and writes
 * their tags into the Helm values files, as semantic-release's `prepareCmd`.
 *
 * Takes the release version and the last release's git tag, empty before the
 * first. Reads `DRY_RUN`: with `1` it prints each build and push, runs none,
 * and still writes the files. Exits 1 on any failure.
 */
@Command({
  arguments: "<version> [last-tag]",
  description:
    "Build and push the changed Caelundas images and write their tags into the Helm values",
  name: "release-images",
})
@Injectable()
export class ReleaseImagesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly releaseImagesService: ReleaseImagesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ReleaseImagesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Releases the images, and exits with the outcome. */
  public async run(passedParameters: string[]): Promise<void> {
    try {
      const [version = "", lastTag = ""] = passedParameters;

      await this.releaseImagesService.run(version, lastTag);
    } catch (error: unknown) {
      console.error(describeError(error));
      process.exitCode = 1;
    }
  }
}
