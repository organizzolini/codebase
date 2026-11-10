import { Module } from "@nestjs/common";
import { CommandFactory, CommandRunnerService } from "nest-commander";
import { vi } from "vitest";

import type { Provider } from "@nestjs/common";

/**
 * Options for resetting shared vitest state in command tests.
 */
interface ResetCommandTestHarnessOptions {
  unstubGlobals?: boolean;
  useRealTimers?: boolean;
}

/**
 * Options to run a command line through a real nest-commander runner.
 */
interface RunCommandLineOptions {
  argv: string[];
  providers: Provider[];
}

/**
 * Empty host module whose providers `runCommandLine` supplies per call.
 */
@Module({})
class CommandLineTestModule {}

/**
 * Applies the common mock reset sequence used by command unit tests.
 */
export function resetCommandTestHarness({
  unstubGlobals = true,
  useRealTimers = false,
}: ResetCommandTestHarnessOptions = {}): void {
  vi.restoreAllMocks();
  vi.clearAllMocks();

  if (unstubGlobals) {
    vi.unstubAllGlobals();
  }

  if (useRealTimers) {
    vi.useRealTimers();
  }
}

/**
 * Runs `argv` through a real nest-commander runner holding only `providers`, so flags parse as the CLI parses them.
 *
 * @throws Whatever the command threw.
 */
export async function runCommandLine({
  argv,
  providers,
}: RunCommandLineOptions): Promise<void> {
  const failures: Error[] = [];
  const application = await CommandFactory.createWithoutRunning(
    { module: CommandLineTestModule, providers },
    {
      logger: false,
      serviceErrorHandler: (error) => {
        failures.push(error);
      },
    },
  );

  try {
    await application.get(CommandRunnerService).run(["node", "main", ...argv]);
  } finally {
    await application.close();
  }

  const [failure] = failures;
  if (failure) throw failure;
}
