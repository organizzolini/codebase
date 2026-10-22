import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { MILLISECONDS_PER_SECOND } from "./process-runner.constants";

import type { ProcessOptions, ProcessResult } from "./process-runner.types";

/**
 * Starts the child processes setup depends on, and answers whether a command
 * exists.
 *
 * Nothing else in this project touches `node:child_process`. That is what
 * lets a test stand a fake in for the whole machine: every step asks here, so
 * a recorded list of command lines is a full account of what setup would have
 * done.
 */
@Injectable()
export class ProcessRunnerService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ProcessRunnerService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Finds a command on `PATH` the way `command -v` does, or returns `undefined`. */
  public locate(command: string): string | undefined {
    for (const directory of (process.env["PATH"] ?? "").split(path.delimiter)) {
      const candidate = path.join(directory, command);

      try {
        fs.accessSync(candidate, fs.constants.X_OK);

        if (fs.statSync(candidate).isFile()) {
          return candidate;
        }
      } catch {
        // Not here; try the next directory.
      }
    }

    return undefined;
  }

  /** The operating system this runs on, which a test replaces to cover the other one. */
  public platform(): NodeJS.Platform {
    return process.platform;
  }

  /**
   * Runs a command to completion.
   *
   * Never throws. A command that is missing or killed reports a `null` status,
   * so the caller decides whether that is a failure.
   */
  public run(
    command: string,
    args: string[],
    options: ProcessOptions = {},
  ): ProcessResult {
    const capture = options.capture === true;
    const completion = spawnSync(command, args, {
      cwd: options.cwd ?? process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...options.environment },
      stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit",
    });

    if (completion.error !== undefined) {
      return { output: "", status: null, stdout: "" };
    }

    const stdout = capture ? completion.stdout : "";
    const stderr = capture ? completion.stderr : "";

    return { output: `${stdout}${stderr}`, status: completion.status, stdout };
  }

  /**
   * Runs a command and throws when it does not exit 0.
   *
   * This is what a script's `set -e` was: the first failing step ends setup,
   * and the error names the command line that failed.
   */
  public runOrThrow(
    command: string,
    args: string[],
    options: ProcessOptions = {},
  ): ProcessResult {
    const result = this.run(command, args, options);

    if (result.status !== 0) {
      throw new Error(
        `\`${[command, ...args].join(" ")}\` failed with status ${String(result.status)}`,
      );
    }

    return result;
  }

  /** Waits the given number of seconds. */
  public async sleep(seconds: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, seconds * MILLISECONDS_PER_SECOND);
    });
  }

  /** Starts a command that keeps running after this process, and does not wait for it. */
  public startDetached(command: string, args: string[]): void {
    const child = spawn(command, args, { detached: true, stdio: "ignore" });

    child.on("error", () => {});
    child.unref();
  }
}
