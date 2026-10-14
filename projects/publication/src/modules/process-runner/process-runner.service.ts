import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  ABNORMAL_EXIT_STATUS,
  MAXIMUM_CAPTURED_BYTES,
} from "./process-runner.constants";

import type { CapturedProcess } from "./process-runner.types";

/**
 * Runs child processes for the publication commands.
 *
 * The only place this project touches `node:child_process`, so every command's
 * test replaces one class and never a module.
 */
@Injectable()
export class ProcessRunnerService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs a command to completion and returns what it printed.
   *
   * @param executable - The program to run, looked up on `PATH`.
   * @param args - Its arguments, passed verbatim with no shell between.
   * @returns Both output streams and the exit code.
   */
  public capture(executable: string, args: readonly string[]): CapturedProcess {
    const result = spawnSync(executable, [...args], {
      encoding: "utf8",
      maxBuffer: MAXIMUM_CAPTURED_BYTES,
    });
    const failure = result.error === undefined ? "" : String(result.error);

    return {
      status: result.status ?? ABNORMAL_EXIT_STATUS,
      stderr: `${result.stderr}${failure}`,
      stdout: result.stdout,
    };
  }

  /**
   * Runs a command with this process's own output streams, so its output
   * appears as it would from the shell step that used to run it.
   *
   * @param executable - The program to run, looked up on `PATH`.
   * @param args - Its arguments, passed verbatim with no shell between.
   * @param input - Text to write to its standard input, when it reads any.
   * @returns The exit code.
   */
  public stream(
    executable: string,
    args: readonly string[],
    input?: string,
  ): number {
    const result = spawnSync(executable, [...args], {
      stdio: [input === undefined ? "inherit" : "pipe", "inherit", "inherit"],
      ...(input === undefined ? {} : { input }),
    });

    return result.status ?? ABNORMAL_EXIT_STATUS;
  }
}
