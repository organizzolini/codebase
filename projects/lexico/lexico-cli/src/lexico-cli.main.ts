import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./lexico-cli.module";

/**
 * nest-commander's default handler exits 0 on a failed command, so this one logs the error and sets a non-zero exit code.
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
