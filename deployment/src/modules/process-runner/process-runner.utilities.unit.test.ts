import { describe, expect, it } from "vitest";

import {
  describeError,
  requireSuccess,
  requireVariable,
} from "./process-runner.utilities";

describe("process runner utilities", () => {
  describe(requireSuccess, () => {
    it("returns what a successful process printed", () => {
      expect.hasAssertions();
      expect(
        requireSuccess({ status: 0, stderr: "", stdout: "out\n" }, "git log"),
      ).toBe("out\n");
    });

    it("names the command and its error output when it failed", () => {
      expect.hasAssertions();
      expect(() =>
        requireSuccess({ status: 2, stderr: " bad \n", stdout: "" }, "git log"),
      ).toThrow("❌ git log exited 2: bad");
    });

    it("names only the command when it printed no error", () => {
      expect.hasAssertions();
      expect(() =>
        requireSuccess({ status: 1, stderr: "", stdout: "" }, "git log"),
      ).toThrow(/^❌ git log exited 1$/v);
    });
  });

  describe(requireVariable, () => {
    it("returns a set variable", () => {
      expect.hasAssertions();
      expect(requireVariable("NAME", "value")).toBe("value");
    });

    it.each([undefined, ""])("fails on %j, naming the variable", (value) => {
      expect.hasAssertions();
      expect(() => requireVariable("NAME", value)).toThrow("❌ NAME is unset");
    });
  });

  describe(describeError, () => {
    it("reads an error's message", () => {
      expect.hasAssertions();
      expect(describeError(new Error("💥 broke"))).toBe("💥 broke");
    });

    it("prints anything else as text", () => {
      expect.hasAssertions();
      expect(describeError(42)).toBe("42");
    });
  });
});
