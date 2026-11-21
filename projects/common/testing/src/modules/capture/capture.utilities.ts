import { expect, onTestFinished, vi } from "vitest";

import type { CapturedOutput } from "./capture.types";
import type { MockInstance } from "vitest";

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

/**
 * Asserts that the action exits the process with code 1, then restores
 * `process.exit`.
 */
export async function expectProcessExitOne(
  action: () => Promise<void> | void,
): Promise<void> {
  mockProcessExit();

  await expect(Promise.resolve().then(action)).rejects.toThrow(
    "process.exit:1",
  );
}

/**
 * Makes `process.exit` throw `Error("process.exit:<code>")`; the spy is
 * restored after the test.
 */
export function mockProcessExit(): MockInstance<typeof process.exit> {
  const exitSpy = vi
    .spyOn(process, "exit")
    .mockImplementation((code?: null | number | string): never => {
      throw new Error(`process.exit:${code ?? 0}`);
    });

  onTestFinished(() => {
    exitSpy.mockRestore();
  });

  return exitSpy;
}

/** The exit code the process will end with, as the code under test left it. */
function readExitCode(): typeof process.exitCode {
  return process.exitCode;
}

/** The text a stream write carried, whether it was a string or bytes. */
function toText(chunk: string | Uint8Array): string {
  return typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
}
