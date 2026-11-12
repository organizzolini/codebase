import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./persistence.module";

/**
 * Bootstraps the database command line with logs routed through a pino
 * `LoggerService`. Sets a non-zero exit code when a command fails.
 */
async function main(): Promise<void> {
  const logger = new LoggerService();
  logger.setContext("CommandFactory");

  await CommandFactory.run(MainModule, {
    bufferLogs: true,
    logger,
    serviceErrorHandler: (error) => {
      process.exitCode = 1;
      logger.error("💥 Failed running command", error.stack, {
        message: error.message,
      });
    },
  });
}

void main();
