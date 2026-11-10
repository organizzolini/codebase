import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { formatPublishablePackagesSuccessMessage } from "./publishable-packages.constants";
import { PublishablePackagesService } from "./publishable-packages.service";

import type { PublishablePackagesVerificationResult } from "./publishable-packages.types";

/**
 * CLI command that verifies publishable package tarballs and CLI binaries.
 */
@Command({
  description:
    "Verify that publishable package tarballs install, typecheck, and execute CLI binaries cleanly",
  name: "publishable-packages",
})
@Injectable()
export class PublishablePackagesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly publishablePackagesService: PublishablePackagesService,
  ) {
    super();
    this.logger.setContext(PublishablePackagesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Verifies the packed tarballs and exits 0 on success, 1 on failure. A thrown
   * error exits 1 too, since nest-commander would exit 0.
   */
  public async run(): Promise<void> {
    await Promise.resolve();

    let result: PublishablePackagesVerificationResult;
    try {
      result = this.publishablePackagesService.verifyPublishablePackages(
        process.cwd(),
      );
    } catch (error) {
      console.error(String(error));
      process.exit(1);
    }

    if (result.succeeded) {
      console.info(
        formatPublishablePackagesSuccessMessage(
          result.packageCount,
          result.binaryCount,
        ),
      );

      return;
    }

    for (const message of result.messages) {
      console.error(message);
    }

    process.exit(1);
  }
}
