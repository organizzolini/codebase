import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import { text } from "node:stream/consumers";

import { Injectable } from "@nestjs/common";

import {
  ABNORMAL_EXIT_STATUS,
  MAXIMUM_CAPTURED_BYTES,
} from "./process-runner.constants";

import type { CapturedProcess, Command } from "./process-runner.types";

/**
 * Runs child processes for the integration commands.
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
   * Runs a command to completion with no shell, returning what it printed.
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
      // Typed as a string, but absent when the process never started.
      stderr: [result.stderr, failure].filter(Boolean).join(""),
      stdout: result.stdout,
    };
  }

  /**
   * Runs a command without blocking, so several can run at once.
   * @returns Both output streams and the exit code.
   */
  public async captureAsync(
    executable: string,
    args: readonly string[],
  ): Promise<CapturedProcess> {
    const child = spawn(executable, [...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const printed = Promise.allSettled([
      text(child.stdout),
      text(child.stderr),
    ]);

    try {
      await once(child, "close");
    } catch (error: unknown) {
      await printed;

      return {
        status: ABNORMAL_EXIT_STATUS,
        stderr: String(error),
        stdout: "",
      };
    }

    const [stdout, stderr] = await printed;

    return {
      status: child.exitCode ?? ABNORMAL_EXIT_STATUS,
      stderr: stderr.status === "fulfilled" ? stderr.value : "",
      stdout: stdout.status === "fulfilled" ? stdout.value : "",
    };
  }

  /**
   * Runs commands in order, stopping at the first that fails.
   * @returns Their combined output, and the failing exit code or 0.
   */
  public captureSequence(commands: readonly Command[]): CapturedProcess {
    const finished: CapturedProcess = { status: 0, stderr: "", stdout: "" };

    for (const [executable, ...args] of commands) {
      const result = this.capture(executable, args);

      finished.stderr += result.stderr;
      finished.stdout += result.stdout;
      finished.status = result.status;

      if (result.status !== 0) {
        break;
      }
    }

    return finished;
  }

  /**
   * Runs a command to completion, writing stdout byte for byte to a file,
   * which suits binary downloads. Returns the exit code.
   */
  public captureToFile(
    executable: string,
    args: readonly string[],
    file: string,
  ): CapturedProcess {
    const descriptor = fs.openSync(file, "w");

    try {
      const result = spawnSync(executable, [...args], {
        encoding: "utf8",
        stdio: ["ignore", descriptor, "pipe"],
      });
      const failure = result.error === undefined ? "" : String(result.error);

      return {
        status: result.status ?? ABNORMAL_EXIT_STATUS,
        // Typed as a string, but absent when the process never started.
        stderr: [result.stderr, failure].filter(Boolean).join(""),
        stdout: "",
      };
    } finally {
      fs.closeSync(descriptor);
    }
  }

  /**
   * Runs a command with this process's own output streams, so its output
   * reads as the shell step's did. Returns the exit code.
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
