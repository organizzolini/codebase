import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";
import pino from "pino";

import {
  FIRST_WORD_PATTERN,
  IRREGULAR_PAST_VERBS,
  LEADING_EMOJI_PATTERN,
  STANDARD_ERROR_DESCRIPTOR,
  STANDARD_OUTPUT_DESCRIPTOR,
  UNVALIDATED_LOG_CONTEXTS,
} from "./logger.constants";

import type {
  LogData,
  LoggerServiceContract,
  ParsedLogMessage,
} from "./logger.types";

/**
 * Transient logger, so each injecting class gets its own instance. Each
 * consumer calls `setContext(ClassName.name)`. Backed by pino: JSON in
 * production, pretty-printed in development. Messages start with an emoji
 * naming the subject, then a verb in present progressive or past tense.
 * Varying values such as counts go in `data`, so messages stay groupable.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService
  extends ConsoleLogger
  implements LoggerServiceContract
{
  // 🏗 Dependency Injection

  constructor() {
    super();
  }

  // 🔐 Private Fields

  private static readonly isProduction =
    process.env["NODE_ENV"] === "production";

  /** Built on first use, so `logToStandardError` can still choose the destination after import. */
  private static rootLogger: pino.Logger | undefined;

  /** Whether lines go to standard error instead of standard output. */
  private static writesToStandardError = false;

  private child: pino.Logger = LoggerService.root;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Build the pino instance for production or local development output. */
  private static createRootLogger(): pino.Logger {
    const level = process.env["LOG_LEVEL"] ?? "info";

    if (LoggerService.isProduction) {
      return LoggerService.writesToStandardError
        ? pino({ level }, pino.destination(STANDARD_ERROR_DESCRIPTOR))
        : pino({ level });
    }

    return pino({
      level,
      transport: {
        options: {
          colorize: true,
          destination: LoggerService.writesToStandardError
            ? STANDARD_ERROR_DESCRIPTOR
            : STANDARD_OUTPUT_DESCRIPTOR,
          // The emoji is a field, not part of the message, so the console can
          // show it while telemetry stores unadorned prose. `ignore` then keeps
          // it from being printed a second time in the trailing object.
          ignore: "pid,hostname,emoji",
          messageFormat: "{emoji} {msg}",
          singleLine: true,
        },
        target: "pino-pretty",
      },
    });
  }

  /**
   * Sends later lines to standard error, for a command whose stdout is its
   * result. Call it first; later calls warn and change nothing.
   */
  static logToStandardError(): void {
    if (LoggerService.rootLogger !== undefined) {
      process.emitWarning(
        "LoggerService.logToStandardError() was called after the first log line, so log lines still go to standard output and anything piping that stream will read them as data. Call it as the first statement of the application's bootstrap.",
      );
      return;
    }

    LoggerService.writesToStandardError = true;
  }

  /**
   * Fails a malformed message in development only, since a throw in production
   * would turn logging into an outage.
   */
  private assertConventionalMessage(args: {
    context: string | undefined;
    parsed: ParsedLogMessage;
  }): void {
    if (
      LoggerService.isProduction ||
      this.shouldSkipConventionalMessageValidation(args.context)
    ) {
      return;
    }

    const violation = this.getConventionalMessageViolation(args.parsed);

    if (violation !== undefined) {
      throw new Error(violation);
    }
  }

  /** Assembles the object pino merges into the line. */
  private buildBindings(args: {
    context: string | undefined;
    data: LogData | undefined;
    parsed: ParsedLogMessage;
  }): Record<string, unknown> {
    this.assertConventionalMessage({
      context: args.context,
      parsed: args.parsed,
    });

    return {
      ...args.data,
      context: args.context,
      // Telemetry gets prose; only the console-bound transport reads this.
      ...(LoggerService.isProduction ? {} : { emoji: args.parsed.emoji }),
    };
  }

  /** Returns a human-readable explanation when the message format is invalid. */
  private getConventionalMessageViolation(
    parsed: ParsedLogMessage,
  ): string | undefined {
    const emoji = parsed.emoji;
    const text = parsed.text;

    if (emoji === undefined) {
      return `Log message must start with an emoji naming its subject, then a verb: "${text}"`;
    }

    const firstWord = FIRST_WORD_PATTERN.exec(text)?.[1];

    if (firstWord === undefined || !this.isConventionalVerb(firstWord)) {
      return `Log message must begin with a verb in present progressive or past tense, got "${firstWord ?? ""}": "${emoji} ${text}"`;
    }

    return undefined;
  }

  /**
   * Whether a word is a present-progressive or past-tense verb. Only irregular
   * pasts need listing; regular morphology covers the rest.
   */
  private isConventionalVerb(word: string): boolean {
    const lowercased = word.toLowerCase();

    return (
      lowercased.endsWith("ing") ||
      lowercased.endsWith("ed") ||
      IRREGULAR_PAST_VERBS.has(lowercased)
    );
  }

  /** Splits a leading emoji off a message, leaving prose behind. */
  private parseMessage(message: unknown): ParsedLogMessage {
    const text = String(message);
    const match = LEADING_EMOJI_PATTERN.exec(text);
    const emoji = match?.[1];

    return emoji === undefined
      ? { emoji: undefined, text }
      : { emoji, text: text.slice(match?.[0].length) };
  }

  /** Whether a context is intentionally exempt from the validation rule. */
  private shouldSkipConventionalMessageValidation(
    context: string | undefined,
  ): boolean {
    return context !== undefined && UNVALIDATED_LOG_CONTEXTS.has(context);
  }

  // 🌎 Public Methods

  /** The pino instance every logger's child is taken from. */
  private static get root(): pino.Logger {
    LoggerService.rootLogger ??= LoggerService.createRootLogger();

    return LoggerService.rootLogger;
  }

  /** Normalizes unknown errors into a stable message and timestamped log line. */
  buildErrorLogEntry(
    context: string,
    error: unknown,
  ): { errorMessage: string; logLine: string } {
    const errorMessage =
      error instanceof Error ? error.stack || error.message : String(error);

    return {
      errorMessage,
      logLine: `[${new Date().toISOString()}] ${context}: ${errorMessage}\n`,
    };
  }

  /** Builds a timestamped output log file path and ensures the output directory exists. */
  createTimestampedOutputLogFilePath(filePrefix: string): string {
    const outputDirectory = path.join(process.cwd(), "output");
    if (!existsSync(outputDirectory)) {
      mkdirSync(outputDirectory, { recursive: true });
    }

    return path.join(
      outputDirectory,
      `${filePrefix}-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.log`,
    );
  }

  /** Logs a debug message at the `debug` level. */
  override debug(message: unknown, context?: string, data?: LogData): void {
    const parsed = this.parseMessage(message);
    this.child.debug(
      this.buildBindings({ context: context ?? this.context, data, parsed }),
      parsed.text,
    );
  }

  /**
   * Logs at the `error` level. The second argument is a stack, the third a
   * context string or structured data.
   */
  override error(
    message: unknown,
    stackOrContext?: string,
    contextOrData?: LogData | string,
  ): void {
    const parsed = this.parseMessage(message);
    const data = typeof contextOrData === "object" ? contextOrData : undefined;
    const context =
      typeof contextOrData === "string" ? contextOrData : this.context;

    this.child.error(
      {
        ...this.buildBindings({ context, data, parsed }),
        stack: stackOrContext,
      },
      parsed.text,
    );
  }

  /** Logs an informational message at the `info` level. */
  info(message: unknown, context?: string, data?: LogData): void {
    const parsed = this.parseMessage(message);
    this.child.info(
      this.buildBindings({ context: context ?? this.context, data, parsed }),
      parsed.text,
    );
  }

  /**
   * Logs at the `info` level, as NestJS and `nest-commander` call it.
   * Application code should call `info` instead.
   */
  override log(message: unknown, context?: string, data?: LogData): void {
    this.info(message, context, data);
  }

  /** Sets the context label included in every subsequent log line. */
  override setContext(context: string): void {
    super.setContext(context);
    this.child = LoggerService.root.child({ context });
  }

  /** Logs a verbose message at the `trace` level. */
  override verbose(message: unknown, context?: string, data?: LogData): void {
    const parsed = this.parseMessage(message);
    this.child.trace(
      this.buildBindings({ context: context ?? this.context, data, parsed }),
      parsed.text,
    );
  }

  /** Logs a warning message at the `warn` level. */
  override warn(message: unknown, context?: string, data?: LogData): void {
    const parsed = this.parseMessage(message);
    this.child.warn(
      this.buildBindings({ context: context ?? this.context, data, parsed }),
      parsed.text,
    );
  }
}
