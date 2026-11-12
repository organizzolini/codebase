import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./validation.module";

/**
 * Bootstraps the CLI. Diagnostics go to standard error, since standard output is
 * each command's result that its session hook reads whole.
 */
async function main(): Promise<void> {
  LoggerService.logToStandardError();

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
