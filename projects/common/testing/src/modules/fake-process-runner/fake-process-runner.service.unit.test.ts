import { describe, expect, it } from "vitest";

import { FakeProcessRunner } from "./fake-process-runner.service";
import { failed, succeeded } from "./fake-process-runner.utilities";

// 🧪 Tests

describe(FakeProcessRunner, () => {
  it("answers a captured call from the script and records it", () => {
    const runner = new FakeProcessRunner({ "git status": succeeded("ok") });

    expect(runner.capture("git", ["status"])).toStrictEqual(succeeded("ok"));
    expect(runner.captured).toStrictEqual([
      { args: ["status"], executable: "git" },
    ]);
    expect(runner.lines).toStrictEqual(["git status"]);
  });

  it("throws on a command line the script omits", () => {
    const runner = new FakeProcessRunner({});

    expect(() => runner.capture("git", ["log"])).toThrow(
      "Unscripted command line: git log",
    );
  });

  it("prefers the longest `*` prefix when no exact line matches", () => {
    const runner = new FakeProcessRunner({
      "git *": succeeded("short"),
      "git log *": succeeded("long"),
    });

    expect(runner.capture("git", ["log", "-1"]).stdout).toBe("long");
    expect(runner.capture("git", ["tag"]).stdout).toBe("short");
  });

  it("plays a sequence of answers, the last repeating", () => {
    const runner = new FakeProcessRunner({
      "git tag": [succeeded("first"), failed("boom", 2)],
    });

    expect(runner.capture("git", ["tag"]).stdout).toBe("first");
    expect(runner.capture("git", ["tag"])).toStrictEqual(failed("boom", 2));
    expect(runner.capture("git", ["tag"]).status).toBe(2);
  });

  it("answers captureAsync like capture", async () => {
    const runner = new FakeProcessRunner({ "git tag": succeeded("v1") });

    await expect(runner.captureAsync("git", ["tag"])).resolves.toStrictEqual(
      succeeded("v1"),
    );
  });

  it("drops the output of a call that writes to a file", () => {
    const runner = new FakeProcessRunner({ "nx graph": succeeded("big") });

    expect(runner.captureToFile("nx", ["graph"]).stdout).toBe("");
  });

  it("runs the effect scripted for a command line", () => {
    const runner = new FakeProcessRunner({ "tool *": succeeded() });
    const seen: (readonly string[])[] = [];

    runner.effects["tool *"] = (args) => {
      seen.push(args);
    };
    runner.capture("tool", ["a"]);

    expect(seen).toStrictEqual([["a"]]);
  });

  it("ends a streamed call with the scripted or default exit code", () => {
    const runner = new FakeProcessRunner({}, 3, { "pnpm publish": [0, 1] });

    expect(runner.stream("pnpm", ["publish"])).toBe(0);
    expect(runner.stream("pnpm", ["publish"])).toBe(1);
    expect(runner.stream("pnpm", ["install"], "yes")).toBe(3);
    expect(runner.streamed.at(-1)).toStrictEqual({
      args: ["install"],
      executable: "pnpm",
      input: "yes",
    });
  });
});
