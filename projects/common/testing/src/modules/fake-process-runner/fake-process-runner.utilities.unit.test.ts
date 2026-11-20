import { describe, expect, it } from "vitest";

import {
  answerFor,
  failed,
  lookUp,
  succeeded,
} from "./fake-process-runner.utilities";

// 🧪 Tests

describe("fake process runner utilities", () => {
  it("builds finished processes", () => {
    expect(succeeded()).toStrictEqual({ status: 0, stderr: "", stdout: "" });
    expect(failed("bad")).toStrictEqual({
      status: 1,
      stderr: "bad",
      stdout: "",
    });
  });

  it("returns a single answer for every call", () => {
    expect(answerFor("one", 5)).toBe("one");
  });

  it("walks a sequence of answers, the last repeating", () => {
    expect(answerFor(["a", "b"], 0)).toBe("a");
    expect(answerFor(["a", "b"], 9)).toBe("b");
  });

  it("rejects an empty answer sequence", () => {
    expect(() => answerFor([], 0)).toThrow("is empty");
  });

  it("prefers an exact entry over a prefix", () => {
    expect(lookUp({ "git *": 1, "git log": 2 }, "git log")).toBe(2);
  });

  it("finds nothing for an unscripted line", () => {
    expect(lookUp({ "git *": 1 }, "pnpm install")).toBeUndefined();
  });
});
