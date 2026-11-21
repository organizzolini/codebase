import { describe, expect, it } from "vitest";

import {
  captureExitCode,
  captureOutput,
  expectProcessExitOne,
  mockProcessExit,
} from "./capture.utilities";

// 🧪 Tests

/** Writes nothing to a stream, resolving once the stream has really flushed it. */
async function flushed(stream: NodeJS.WriteStream): Promise<void> {
  await new Promise<void>((resolve) => {
    stream.write("", () => {
      resolve();
    });
  });
}

describe("capture", () => {
  describe(captureOutput, () => {
    it("collects what is written to standard output and standard error, apart", () => {
      const output = captureOutput();

      process.stdout.write("first ");
      process.stdout.write(Buffer.from("second"));
      process.stderr.write("problem\n");

      expect(output.stdout()).toBe("first second");
      expect(output.stderr()).toBe("problem\n");
    });

    it("starts empty and reports every write as accepted", () => {
      const output = captureOutput();

      expect(output.stdout()).toBe("");
      expect(output.stderr()).toBe("");
      expect(process.stdout.write("swallowed")).toBe(true);
    });

    it("hands both streams back once the test finishes, so writes reach them again", async () => {
      await expect(flushed(process.stdout)).resolves.toBeUndefined();
      await expect(flushed(process.stderr)).resolves.toBeUndefined();
    });
  });

  describe(captureExitCode, () => {
    const realExitCode = process.exitCode;

    it("clears the exit code for the test, then reads the one the code under test set", () => {
      process.exitCode = 3;

      const exitCode = captureExitCode();

      expect(exitCode()).toBeUndefined();

      process.exitCode = 2;

      expect(exitCode()).toBe(2);
    });

    it("restores the exit code from before the capture once the test finishes", () => {
      expect(process.exitCode).toBe(3);

      process.exitCode = realExitCode;
    });
  });

  describe(mockProcessExit, () => {
    it("makes process.exit throw an error carrying the code", () => {
      mockProcessExit();

      expect(() => process.exit(2)).toThrow("process.exit:2");
      expect(() => process.exit()).toThrow("process.exit:0");
    });

    it("returns the spy, so a test can assert the calls", () => {
      const exitSpy = mockProcessExit();

      expect(() => process.exit(1)).toThrow("process.exit:1");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe(expectProcessExitOne, () => {
    it("passes when the action exits with code 1", async () => {
      await expect(
        expectProcessExitOne(() => process.exit(1)),
      ).resolves.toBeUndefined();
    });

    it("rejects when the action does not exit with code 1", async () => {
      await expect(expectProcessExitOne(() => process.exit(2))).rejects.toThrow(
        "process.exit:2",
      );
    });
  });
});
