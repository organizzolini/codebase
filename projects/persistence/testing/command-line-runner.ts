import { CommandFactory, CommandRunnerService } from "nest-commander";
import { vi } from "vitest";

import { LoggerService } from "@codebase/logging";

import { MainModule } from "../src/persistence.module";

import type { DynamicModule, Type } from "@nestjs/common";

/**
 * What one run of the command line left behind.
 */
export interface CommandLineResult {
  /** 0 on success, the CommanderError's code, or 1 when a command threw. */
  readonly exitCode: number;

  /** Every line the application's `LoggerService` was asked to write. */
  readonly logs: readonly string[];

  /** Everything written to standard error, including a failure's message. */
  readonly stderr: string;

  /** Everything written to standard output, including `--help`. */
  readonly stdout: string;
}

/**
 * Options to run the command line.
 */
interface RunCliCommandLineOptions {
  /** The arguments after the program name, e.g. `["export", "--data"]`. */
  readonly argv: readonly string[];

  /**
   * Environment for the run, laid over `process.env` and restored after. A
   * `undefined` value removes the variable for the run.
   */
  readonly env?: Readonly<Record<string, string | undefined>>;

  /** The root module; `persistence.main.ts`'s own unless a test narrows it. */
  readonly module?: DynamicModule | Type<unknown>;
}

/**
 * The `LoggerService` levels that write a line. `log` is not among them: it
 * hands its message to `info`, so a `log` call is recorded as `info: …`.
 */
const LOGGER_LEVELS = ["debug", "error", "info", "verbose", "warn"] as const;

/**
 * Runs `argv` through the real nest-commander runner and module graph, as
 * `persistence.main.ts` does, and reports what happened rather than exiting the
 * process.
 *
 * Standard output, standard error, and the application's `LoggerService` are
 * captured for the run and restored after, so nothing reaches the console.
 * Every message still passes through the real `LoggerService`, whose logging
 * convention fails the run as it fails `persistence.main.ts`; the vitest
 * configuration's `LOG_LEVEL=silent` keeps the lines themselves quiet.
 * Output a spawned process writes to its own descriptors is not captured:
 * the command must surface it through its logger or its error.
 */
export async function runCliCommandLine({
  argv,
  env = {},
  module = MainModule,
}: RunCliCommandLineOptions): Promise<CommandLineResult> {
  let logs: readonly string[];
  const stdout: string[] = [];
  const stderr: string[] = [];
  const restoreEnvironment = replaceEnvironment(env);
  const loggerSpies = LOGGER_LEVELS.map((level) => ({
    level,
    spy: vi.spyOn(LoggerService.prototype, level),
  }));
  const spies = [
    ...loggerSpies.map(({ spy }) => spy),
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      stdout.push(String(chunk));
      return true;
    }),
    vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
      stderr.push(String(chunk));
      return true;
    }),
  ];
  let exitCode = 0;

  try {
    const application = await CommandFactory.createWithoutRunning(module, {
      errorHandler: (error) => {
        throw error;
      },
      logger: false,
      outputConfiguration: {
        writeErr: (text) => stderr.push(text),
        writeOut: (text) => stdout.push(text),
      },
      serviceErrorHandler: (error) => {
        // Commander's own exits (help, version) arrive here too, as errors
        // whose code is 0 and whose message is not a failure to report.
        exitCode = exitCodeOf(error);
        if (exitCode !== 0) stderr.push(`${error.message}\n`);
      },
    });

    try {
      await application
        .get(CommandRunnerService)
        .run(["node", "main", ...argv]);
    } finally {
      await application.close();
    }
  } catch (error) {
    exitCode = exitCodeOf(error);
    stderr.push(`${error instanceof Error ? error.message : String(error)}\n`);
  } finally {
    logs = loggedLines(loggerSpies);
    for (const spy of spies) spy.mockRestore();
    restoreEnvironment();
  }

  return {
    exitCode,
    logs,
    stderr: stderr.join(""),
    stdout: stdout.join(""),
  };
}

/** The exit code a thrown error stands for; commander's own carry one. */
function exitCodeOf(error: unknown): number {
  if (
    error instanceof Error &&
    "exitCode" in error &&
    typeof error.exitCode === "number"
  ) {
    return error.exitCode;
  }
  return 1;
}

/**
 * Every line the `LoggerService` levels spied on were asked to write, as
 * `level: message`, in the order the run wrote them.
 */
function loggedLines(
  loggerSpies: readonly {
    level: (typeof LOGGER_LEVELS)[number];
    spy: { mock: { calls: unknown[][]; invocationCallOrder: number[] } };
  }[],
): string[] {
  return loggerSpies
    .flatMap(({ level, spy }) =>
      spy.mock.calls.map((call, index) => ({
        line: `${level}: ${String(call[0])}`,
        order: spy.mock.invocationCallOrder[index] ?? 0,
      })),
    )
    .toSorted((left, right) => left.order - right.order)
    .map(({ line }) => line);
}

/**
 * Lays `environment` over `process.env` and returns what puts every variable
 * back as it was.
 */
function replaceEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): () => void {
  const previous = { ...process.env };

  for (const [key, value] of Object.entries(environment)) {
    if (value === undefined) Reflect.deleteProperty(process.env, key);
    else process.env[key] = value;
  }

  return (): void => {
    for (const key of Object.keys(process.env)) {
      if (!(key in previous)) Reflect.deleteProperty(process.env, key);
    }
    Object.assign(process.env, previous);
  };
}
