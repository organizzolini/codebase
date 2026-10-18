import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import { text } from "node:stream/consumers";

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
      // Typed as a string, but absent when the process never started.
      stderr: [result.stderr, failure].filter(Boolean).join(""),
      stdout: result.stdout,
    };
  }

  /**
   * Runs a command without blocking, so several can run at once, and returns
   * what it printed once it ends. Its standard input is closed at once.
   *
   * @param executable - The program to run, looked up on `PATH`.
   * @param args - Its arguments, passed verbatim with no shell between.
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
   * Runs a command to completion with its standard output written to a file,
   * byte for byte, which suits a download that is not text.
   *
   * @param executable - The program to run, looked up on `PATH`.
   * @param args - Its arguments, passed verbatim with no shell between.
   * @param file - The file its standard output replaces.
   * @returns The error stream and the exit code; `stdout` is always empty.
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
