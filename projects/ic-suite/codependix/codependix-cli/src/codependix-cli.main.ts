#!/usr/bin/env node
// The shebang makes the emitted main.js runnable as this package's bin; TypeScript copies it through.
// Decorator metadata is in the output, so a bare node runs it with no loader. The executable bit
// is set by npm and pnpm at install time.
import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./codependix-cli.module";

/**
 * Bootstraps the CLI. Stdout belongs to the result, so every diagnostic goes to stderr, set before anything logs.
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
