import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./documentation.module";

/** Runs the documentation command-line application. */
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
