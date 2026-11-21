import { execa } from "execa";

import {
  DEFAULT_COMMAND_TIMEOUT_MS,
  INHERITED_ENVIRONMENT_KEYS,
} from "./command.constants";

import type { Command } from "./command.types";

/**
 * Describes one child process: chain `inDirectory`, `withEnvironment` and
 * `withTimeout`, then `run` it. It never throws on a failing command.
 */
export function createCommand(
  command: string,
  args: readonly string[] = [],
  settings: {
    readonly directory?: string;
    readonly environment?: Readonly<Record<string, string>>;
    readonly timeout?: number;
  } = {},
): Command {
  const {
    directory = process.cwd(),
    environment = {},
    timeout = DEFAULT_COMMAND_TIMEOUT_MS,
  } = settings;

  return {
    inDirectory: (next) =>
      createCommand(command, args, { ...settings, directory: next }),
    run: async () => {
      const result = await execa(command, [...args], {
        cwd: directory,
        env: sanitizeEnvironment(process.env, environment),
        extendEnv: false,
        localDir: directory,
        preferLocal: true,
        reject: false,
        timeout,
      });

      return {
        exitCode: result.exitCode,
        stderr: result.stderr,
        stdout: result.stdout,
        timedOut: result.timedOut,
      };
    },
    withEnvironment: (variables) =>
      createCommand(command, args, {
        ...settings,
        environment: { ...environment, ...variables },
      }),
    withTimeout: (milliseconds) =>
      createCommand(command, args, { ...settings, timeout: milliseconds }),
  };
}

/**
 * Builds a child-process environment from the inherited keys alone, so
 * `NX_*`, `npm_config_*` and tokens never leak in; overrides win.
 */
export function sanitizeEnvironment(
  source: Readonly<Record<string, string | undefined>> = process.env,
  overrides: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const inherited = INHERITED_ENVIRONMENT_KEYS.flatMap((key) => {
    const value = source[key];

    return value === undefined ? [] : [[key, value] as const];
  });

  return { ...Object.fromEntries(inherited), ...overrides };
}
