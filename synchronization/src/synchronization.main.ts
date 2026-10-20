import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./synchronization.module";

/**
 * Bootstraps the synchronization CLI application.
 *
 * Standard output belongs to a command's result: `installed-skills check`
 * prints the context the skills session hook hands to an agent, and a log
 * line on the same stream would be read as part of it. Every diagnostic
 * therefore goes to standard error, chosen here before anything logs.
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
