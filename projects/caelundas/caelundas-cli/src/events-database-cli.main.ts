import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { EventsDatabaseCliModule } from "./events-database-cli.module";

/** Bootstraps the events database application. */
async function main(): Promise<void> {
  const logger = new LoggerService();
  logger.setContext("CommandFactory");

  await CommandFactory.run(EventsDatabaseCliModule, {
    bufferLogs: true,
    logger,
    // nest-commander's default error handler leaves the process exiting 0 on a
    // thrown command error, so set a failing exit code for CI to see.
    serviceErrorHandler: (error: Error) => {
      logger.error(error.message, error.stack);
      process.exitCode = 1;
    },
  });
}

void main();
