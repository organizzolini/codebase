#!/usr/bin/env node
// The bare bin name keeps `node_modules/.bin/conformetry` apart from `node_modules/conformetry`.
//
// The shebang lets the built entry run under plain `node`, since decorator metadata is already emitted.
// npm and pnpm set the executable bit on `bin` targets at install time.
import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./conformetry-cli.module";

/**
 * Bootstraps the NestJS command application.
 */
async function main(): Promise<void> {
  const logger = new LoggerService();
  logger.setContext("CommandFactory");

  await CommandFactory.run(MainModule, {
    bufferLogs: true,
    errorHandler: (error) => {
      process.exitCode = 1;
      logger.error(error);
    },
    logger,
    serviceErrorHandler: (error: Error) => {
      logger.error(error.message, error.stack);
      process.exitCode = 1;
    },
  });
}

void main();
