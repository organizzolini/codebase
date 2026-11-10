import { onTestFinished, vi } from "vitest";

import type { CapturedOutput } from "./capture.types";

/**
 * Clears `process.exitCode` for the running test, so a command's code cannot
 * leak; returns a reader. The prior code is restored after the test.
 */
export function captureExitCode(): () => typeof process.exitCode {
  const original = process.exitCode;

  onTestFinished(() => {
    process.exitCode = original;
  });
  process.exitCode = undefined;

  return readExitCode;
}

/**
 * Captures stdout and stderr for the running test, keeping writes off the real
 * streams and restoring both afterwards. Call from a test or `beforeEach`.
 */
export function captureOutput(): CapturedOutput {
  const standardOutput: string[] = [];
  const standardError: string[] = [];
  const outputSpy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: string | Uint8Array) => {
      standardOutput.push(toText(chunk));
      return true;
    });
  const errorSpy = vi
    .spyOn(process.stderr, "write")
    .mockImplementation((chunk: string | Uint8Array) => {
      standardError.push(toText(chunk));
      return true;
    });

  onTestFinished(() => {
    outputSpy.mockRestore();
    errorSpy.mockRestore();
  });

  return {
    stderr: () => standardError.join(""),
    stdout: () => standardOutput.join(""),
  };
}

/** The exit code the process will end with, as the code under test left it. */
function readExitCode(): typeof process.exitCode {
  return process.exitCode;
}

/** The text a stream write carried, whether it was a string or bytes. */
function toText(chunk: string | Uint8Array): string {
  return typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
}
