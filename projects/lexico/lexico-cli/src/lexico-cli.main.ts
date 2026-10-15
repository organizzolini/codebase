import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/logging";

import { rootModule } from "./main.utilities";

/**
 * Bootstraps the NestJS CommandFactory, on the root module the command line
 * calls for, with buffered logs routed through a pino `LoggerService`.
 *
 * nest-commander's default `serviceErrorHandler` only writes a failed command's
 * error to standard error, so the process would still exit 0. This one logs it
 * and sets a non-zero exit code instead.
 */
async function main(): Promise<void> {
  const logger = new LoggerService();
  logger.setContext("CommandFactory");

  await CommandFactory.run(rootModule(process.argv.slice(2)), {
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
