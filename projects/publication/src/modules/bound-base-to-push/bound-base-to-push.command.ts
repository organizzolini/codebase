import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { BoundBaseToPushService } from "./bound-base-to-push.service";

/**
 * CLI command that moves a push's `NX_BASE` to the push's previous tip, so
 * one red run on main cannot widen the next.
 *
 * Reads `BEFORE`, `NX_BASE`, `NX_HEAD`, and `GITHUB_ENV`, the file a moved
 * base is written to. Exits 1 when `NX_BASE` or `NX_HEAD` is unset, or a moved
 * base has nowhere to go, and 0 otherwise, a kept base included.
 */
@Command({
  description: "Move a push's NX_BASE to the push's own previous tip",
  name: "bound-base-to-push",
})
@Injectable()
export class BoundBaseToPushCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundBaseToPushService: BoundBaseToPushService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(BoundBaseToPushCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Bounds the base, prints what it decided, and sets the exit code. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const report = this.boundBaseToPushService.bound();

    for (const line of report.lines) {
      if (line.startsWith("❌")) {
        console.error(line);
      } else {
        console.info(line);
      }
    }
    if (report.exitCode !== 0) {
      process.exitCode = report.exitCode;
    }
  }
}
