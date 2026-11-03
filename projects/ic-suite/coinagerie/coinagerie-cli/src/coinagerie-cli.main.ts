#!/usr/bin/env node
// The shebang makes the emitted main usable as this package's `bin`.
import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./coinagerie-cli.module";

/**
 * Boots the command-line host and runs the command named on the command line.
 *
 * Standard output belongs to the glossary a bare run prints, so every
 * diagnostic goes to standard error — chosen here, before anything logs,
 * because the logger is built on first use.
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
