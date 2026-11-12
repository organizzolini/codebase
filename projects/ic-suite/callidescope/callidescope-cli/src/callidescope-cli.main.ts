#!/usr/bin/env node
// The shebang makes the built `src/callidescope-cli.main.js` runnable as `bin` under bare node.
// Decorator metadata is already emitted (configuration/tsconfig.json), so no loader is needed.
import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./callidescope-cli.module";

/**
 * Bootstraps the CLI. nest-commander's default handler leaves the exit code at zero,
 * so errors are routed to `serviceErrorHandler`.
 */
async function main(): Promise<void> {
  const logger = new LoggerService();
  logger.setContext("CommandFactory");

  await CommandFactory.run(MainModule, {
    bufferLogs: true,
    logger,
    serviceErrorHandler: (error: Error) => {
      logger.error(error.message, error.stack);
      process.exitCode = 1;
    },
  });
}

void main();
