import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { captureOutput } from "@codebase/testing";

import { FAKE_COMMAND } from "../../../testing/fake-command-line";

import checkExecutor from "./executor";

import type { CheckExecutorContext } from "./executor.types";
import type { CapturedOutput } from "@codebase/testing";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const OPTIONS = { command: FAKE_COMMAND };

/** A context for the named project, which the workspace knows as `a` and `bad-b`. */
function contextFor(projectName: string | undefined): CheckExecutorContext {
  return {
    projectName,
    projectsConfigurations: {
      projects: {
        a: { root: "packages/a" },
        "bad-b": { root: "packages/bad-b" },
      },
    },
    root: ROOT,
  };
}

describe(checkExecutor, () => {
  let output: CapturedOutput;

  beforeEach(() => {
    vi.clearAllMocks();
    output = captureOutput();
  });

  it("passes a project the command line passes", async () => {
    expect.hasAssertions();

    await expect(
      checkExecutor(OPTIONS, contextFor("a")),
    ).resolves.toStrictEqual({ success: true });
  });

  it("fails a project the command line fails, and prints its report", async () => {
    expect.hasAssertions();

    await expect(
      checkExecutor(OPTIONS, contextFor("bad-b")),
    ).resolves.toStrictEqual({ success: false });
    expect(output.stdout()).toContain("missing: argv");
  });

  it("writes when asked to", async () => {
    expect.hasAssertions();

    await checkExecutor({ ...OPTIONS, write: true }, contextFor("a"));

    expect(output.stdout()).toContain("wrote");
  });

  it("refuses to run with no project", async () => {
    expect.hasAssertions();

    await expect(checkExecutor(OPTIONS, contextFor(undefined))).rejects.toThrow(
      "must be run against a project",
    );
  });

  it("refuses a project the workspace does not know", async () => {
    expect.hasAssertions();

    await expect(checkExecutor(OPTIONS, contextFor("zzz"))).rejects.toThrow(
      "Unknown project: zzz",
    );
  });
});
