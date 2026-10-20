import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./validation.module";

/**
 * Bootstraps the validation CLI application.
 *
 * Standard output belongs to a command's result: `session-branch-name` and
 * `session-worktree-name` print the context their session hooks hand to an
 * agent, and a log line on the same stream would be read as part of it.
 * Every diagnostic therefore goes to standard error, chosen here before
 * anything logs.
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
