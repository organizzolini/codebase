#!/usr/bin/env node
// The shebang makes the emitted `src/codometer-cli.main.js` runnable as the
// package `bin` under bare `node`. Decorator metadata is already in the output
// (`emitDecoratorMetadata`), and npm and pnpm set the executable bit at install.
import "reflect-metadata";
import { CommandFactory } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { MainModule } from "./codometer-cli.module";
import { withDefaultCommand } from "./codometer-cli.utilities";

/**
 * Bootstraps the CLI. Logs go to standard error, set before the first log, so
 * standard output carries only the result document.
 */
async function main(): Promise<void> {
  LoggerService.logToStandardError();

  const logger = new LoggerService();
  logger.setContext("CommandFactory");

  process.argv = [
    ...process.argv.slice(0, 2),
    ...withDefaultCommand(process.argv.slice(2)),
  ];

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
